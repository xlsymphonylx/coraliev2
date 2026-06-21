use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
};
use chrono::Utc;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, EntityTrait, ModelTrait, QueryFilter, QueryOrder, Set,
};

use std::collections::HashSet;

use crate::{
    dto::{
        category::CategorySummary,
        common::ApiResponse,
        product::{
            BundleItemResponse, CreateProductRequest, DiscountResponse, ImageResponse,
            ProductQuery, ProductResponse, TagSummary, UpdateProductRequest,
        },
    },
    models::{bundle_item, category, product, product_discount, product_image, product_tag, tag},
    state::AppState,
};

fn slugify(s: &str) -> String {
    s.to_lowercase()
        .chars()
        .map(|c| {
            if c.is_alphanumeric() || c == '-' {
                c
            } else {
                ' '
            }
        })
        .collect::<String>()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join("-")
}

pub async fn list(
    State(state): State<AppState>,
    Query(q): Query<ProductQuery>,
) -> Result<Json<ApiResponse<Vec<ProductResponse>>>, (StatusCode, Json<ApiResponse<()>>)> {
    let mut query = product::Entity::find().filter(product::Column::DeletedAt.is_null());

    if let Some(cat_id) = q.category_id {
        let all_ids = collect_category_and_descendants(&state.db, cat_id).await.map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;
        query = query.filter(product::Column::CategoryId.is_in(all_ids));
    }
    if let Some(pt) = q.product_type {
        query = query.filter(product::Column::ProductType.eq(pt));
    }
    if let Some(search) = q.search {
        let pattern = format!("%{}%", search);
        query = query.filter(
            sea_orm::Condition::any()
                .add(product::Column::Name.like(&pattern))
                .add(product::Column::Description.like(&pattern)),
        );
    }
    if let Some(bc) = q.barcode {
        query = query.filter(product::Column::Barcode.eq(bc));
    }
    if let Some(tag_id) = q.tag_id {
        let pts = product_tag::Entity::find()
            .filter(product_tag::Column::TagId.eq(tag_id))
            .all(&state.db)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?;
        let ids: Vec<i32> = pts.into_iter().map(|pt| pt.product_id).collect();
        query = query.filter(product::Column::Id.is_in(ids));
    }

    let products = query.all(&state.db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    let mut responses = Vec::new();
    for p in products {
        responses.push(build_response(&state.db, p).await?);
    }

    Ok(Json(ApiResponse::ok(responses)))
}

pub async fn get(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<Json<ApiResponse<ProductResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let product = product::Entity::find()
        .filter(product::Column::Slug.eq(&slug))
        .one(&state.db)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?
        .ok_or_else(|| {
            (
                StatusCode::NOT_FOUND,
                Json(ApiResponse::error(404, "product not found".into())),
            )
        })?;

    Ok(Json(ApiResponse::ok(
        build_response(&state.db, product).await?,
    )))
}

pub async fn create(
    State(state): State<AppState>,
    Json(body): Json<CreateProductRequest>,
) -> Result<Json<ApiResponse<ProductResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let slug = body.slug.unwrap_or_else(|| slugify(&body.name));

    let existing = product::Entity::find()
        .filter(product::Column::Slug.eq(&slug))
        .one(&state.db)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;

    if existing.is_some() {
        return Err((
            StatusCode::CONFLICT,
            Json(ApiResponse::error(409, "slug already taken".into())),
        ));
    }

    let prod = product::ActiveModel {
        name: Set(body.name),
        slug: Set(slug),
        description: Set(body.description),
        price: Set(body.price),
        product_type: Set(body.product_type.unwrap_or_else(|| "simple".into())),
        category_id: Set(body.category_id),
        barcode: Set(body.barcode),
        ..Default::default()
    }
    .insert(&state.db)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    // Insert tags
    if let Some(tag_ids) = body.tag_ids {
        for tid in tag_ids {
            product_tag::ActiveModel {
                product_id: Set(prod.id),
                tag_id: Set(tid),
                ..Default::default()
            }
            .insert(&state.db)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?;
        }
    }

    // Insert images
    if let Some(images) = body.images {
        for (i, img) in images.into_iter().enumerate() {
            product_image::ActiveModel {
                product_id: Set(prod.id),
                url: Set(img.url),
                alt: Set(img.alt),
                sort_order: Set(img.sort_order.unwrap_or(i as i32)),
                ..Default::default()
            }
            .insert(&state.db)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?;
        }
    }

    // Insert bundle items
    if let Some(items) = body.bundle_items {
        for (i, bi) in items.into_iter().enumerate() {
            bundle_item::ActiveModel {
                bundle_id: Set(prod.id),
                product_id: Set(bi.product_id),
                quantity: Set(bi.quantity.unwrap_or(1)),
                sort_order: Set(i as i32),
                ..Default::default()
            }
            .insert(&state.db)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?;
        }
    }

    Ok(Json(ApiResponse::ok(
        build_response(&state.db, prod).await?,
    )))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(body): Json<UpdateProductRequest>,
) -> Result<Json<ApiResponse<ProductResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let prod = product::Entity::find_by_id(id)
        .one(&state.db)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?
        .ok_or_else(|| {
            (
                StatusCode::NOT_FOUND,
                Json(ApiResponse::error(404, "product not found".into())),
            )
        })?;

    let mut active: product::ActiveModel = prod.into();

    if let Some(name) = body.name {
        active.name = Set(name);
    }
    if let Some(slug) = body.slug {
        active.slug = Set(slug);
    }
    if let Some(desc) = body.description {
        active.description = Set(Some(desc));
    }
    if let Some(price) = body.price {
        active.price = Set(price);
    }
    if let Some(pt) = body.product_type {
        active.product_type = Set(pt);
    }
    if let Some(cat_id) = body.category_id {
        active.category_id = Set(Some(cat_id));
    }
    if let Some(bc) = body.barcode {
        active.barcode = Set(Some(bc));
    }

    let updated = active.update(&state.db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    // Replace tags
    if let Some(tag_ids) = body.tag_ids {
        product_tag::Entity::delete_many()
            .filter(product_tag::Column::ProductId.eq(updated.id))
            .exec(&state.db)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?;
        for tid in tag_ids {
            product_tag::ActiveModel {
                product_id: Set(updated.id),
                tag_id: Set(tid),
                ..Default::default()
            }
            .insert(&state.db)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?;
        }
    }

    // Replace images
    if let Some(images) = body.images {
        product_image::Entity::delete_many()
            .filter(product_image::Column::ProductId.eq(updated.id))
            .exec(&state.db)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?;
        for (i, img) in images.into_iter().enumerate() {
            product_image::ActiveModel {
                product_id: Set(updated.id),
                url: Set(img.url),
                alt: Set(img.alt),
                sort_order: Set(img.sort_order.unwrap_or(i as i32)),
                ..Default::default()
            }
            .insert(&state.db)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?;
        }
    }

    // Replace bundle items
    if let Some(items) = body.bundle_items {
        bundle_item::Entity::delete_many()
            .filter(bundle_item::Column::BundleId.eq(updated.id))
            .exec(&state.db)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?;
        for (i, bi) in items.into_iter().enumerate() {
            bundle_item::ActiveModel {
                bundle_id: Set(updated.id),
                product_id: Set(bi.product_id),
                quantity: Set(bi.quantity.unwrap_or(1)),
                sort_order: Set(i as i32),
                ..Default::default()
            }
            .insert(&state.db)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?;
        }
    }

    Ok(Json(ApiResponse::ok(
        build_response(&state.db, updated).await?,
    )))
}

pub async fn delete(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let prod = product::Entity::find_by_id(id)
        .filter(product::Column::DeletedAt.is_null())
        .one(&state.db)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?
        .ok_or_else(|| {
            (
                StatusCode::NOT_FOUND,
                Json(ApiResponse::error(404, "product not found".into())),
            )
        })?;

    let mut active: product::ActiveModel = prod.into();
    active.deleted_at = Set(Some(Utc::now()));
    active.update(&state.db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    Ok(Json(ApiResponse::ok(())))
}

// --- helpers ---

async fn build_response(
    db: &sea_orm::DatabaseConnection,
    p: product::Model,
) -> Result<ProductResponse, (StatusCode, Json<ApiResponse<()>>)> {
    let images = p
        .find_related(product_image::Entity)
        .order_by(product_image::Column::SortOrder, sea_orm::Order::Asc)
        .all(db)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;

    let tags = p.find_related(tag::Entity).all(db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    let discounts = p
        .find_related(product_discount::Entity)
        .filter(product_discount::Column::Active.eq(true))
        .all(db)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;

    let bundle_items = if p.product_type == "bundle" {
        bundle_item::Entity::find()
            .filter(bundle_item::Column::BundleId.eq(p.id))
            .order_by(bundle_item::Column::SortOrder, sea_orm::Order::Asc)
            .all(db)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?
    } else {
        Vec::new()
    };

    let category = if let Some(cat_id) = p.category_id {
        category::Entity::find_by_id(cat_id)
            .one(db)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?
            .map(|c| CategorySummary {
                id: c.id,
                name: c.name,
                slug: c.slug,
            })
    } else {
        None
    };

    Ok(ProductResponse {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        product_type: p.product_type,
        barcode: p.barcode,
        category,
        tags: tags
            .into_iter()
            .map(|t| TagSummary {
                id: t.id,
                name: t.name,
                slug: t.slug,
            })
            .collect(),
        images: images
            .into_iter()
            .map(|i| ImageResponse {
                id: i.id,
                url: i.url,
                alt: i.alt,
                sort_order: i.sort_order,
            })
            .collect(),
        discounts: discounts
            .into_iter()
            .map(|d| DiscountResponse {
                id: d.id,
                discount_percent: d.discount_percent,
                active: d.active,
                starts_at: d.starts_at.map(|t| t.to_rfc3339()),
                ends_at: d.ends_at.map(|t| t.to_rfc3339()),
            })
            .collect(),
        bundle_items: bundle_items
            .into_iter()
            .map(|bi| BundleItemResponse {
                id: bi.id,
                product_id: bi.product_id,
                quantity: bi.quantity,
                sort_order: bi.sort_order,
            })
            .collect(),
        created_at: p.created_at.to_rfc3339(),
        updated_at: p.updated_at.to_rfc3339(),
    })
}

/// Recursively collect the given category ID and all its descendant IDs.
async fn collect_category_and_descendants(
    db: &sea_orm::DatabaseConnection,
    cat_id: i32,
) -> Result<Vec<i32>, sea_orm::DbErr> {
    let mut ids = HashSet::new();
    ids.insert(cat_id);

    let mut current_parents = vec![cat_id];
    loop {
        let children = category::Entity::find()
            .filter(category::Column::ParentId.is_in(current_parents.clone()))
            .filter(category::Column::DeletedAt.is_null())
            .all(db)
            .await?;

        if children.is_empty() {
            break;
        }

        let child_ids: Vec<i32> = children.iter().map(|c| c.id).collect();
        for &id in &child_ids {
            ids.insert(id);
        }
        current_parents = child_ids;
    }

    Ok(ids.into_iter().collect())
}
