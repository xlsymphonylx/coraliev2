use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};

use crate::{
    dto::{
        common::ApiResponse,
        product_discount::{
            CreateProductDiscountRequest, ProductDiscountResponse, UpdateProductDiscountRequest,
        },
    },
    models::product_discount,
    state::AppState,
};

pub async fn list(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<ProductDiscountResponse>>>, (StatusCode, Json<ApiResponse<()>>)> {
    Ok(Json(ApiResponse::ok(
        product_discount::Entity::find()
            .filter(product_discount::Column::DeletedAt.is_null())
            .all(&state.db)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?
            .into_iter()
            .map(|d| ProductDiscountResponse {
                id: d.id,
                product_id: d.product_id,
                discount_percent: d.discount_percent,
                active: d.active,
                starts_at: d.starts_at.map(|t| t.to_rfc3339()),
                ends_at: d.ends_at.map(|t| t.to_rfc3339()),
            })
            .collect(),
    )))
}
pub async fn create(
    State(state): State<AppState>,
    Json(body): Json<CreateProductDiscountRequest>,
) -> Result<Json<ApiResponse<ProductDiscountResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let d = product_discount::ActiveModel {
        product_id: Set(body.product_id),
        discount_percent: Set(body.discount_percent),
        active: Set(body.active.unwrap_or(true)),
        starts_at: Set(body.starts_at.and_then(|s| {
            chrono::DateTime::parse_from_rfc3339(&s)
                .ok()
                .map(|dt| dt.to_utc())
        })),
        ends_at: Set(body.ends_at.and_then(|s| {
            chrono::DateTime::parse_from_rfc3339(&s)
                .ok()
                .map(|dt| dt.to_utc())
        })),
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
    Ok(Json(ApiResponse::ok(ProductDiscountResponse {
        id: d.id,
        product_id: d.product_id,
        discount_percent: d.discount_percent,
        active: d.active,
        starts_at: d.starts_at.map(|t| t.to_rfc3339()),
        ends_at: d.ends_at.map(|t| t.to_rfc3339()),
    })))
}
pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(body): Json<UpdateProductDiscountRequest>,
) -> Result<Json<ApiResponse<ProductDiscountResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let d = product_discount::Entity::find_by_id(id)
        .filter(product_discount::Column::DeletedAt.is_null())
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
                Json(ApiResponse::error(404, "not found".into())),
            )
        })?;
    let mut a: product_discount::ActiveModel = d.into();
    if let Some(v) = body.discount_percent {
        a.discount_percent = Set(v);
    }
    if let Some(v) = body.active {
        a.active = Set(v);
    }
    if let Some(v) = body.starts_at {
        a.starts_at = Set(chrono::DateTime::parse_from_rfc3339(&v)
            .ok()
            .map(|dt| dt.to_utc()));
    }
    if let Some(v) = body.ends_at {
        a.ends_at = Set(chrono::DateTime::parse_from_rfc3339(&v)
            .ok()
            .map(|dt| dt.to_utc()));
    }
    let u = a.update(&state.db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;
    Ok(Json(ApiResponse::ok(ProductDiscountResponse {
        id: u.id,
        product_id: u.product_id,
        discount_percent: u.discount_percent,
        active: u.active,
        starts_at: u.starts_at.map(|t| t.to_rfc3339()),
        ends_at: u.ends_at.map(|t| t.to_rfc3339()),
    })))
}
pub async fn delete(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let d = product_discount::Entity::find_by_id(id)
        .filter(product_discount::Column::DeletedAt.is_null())
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
                Json(ApiResponse::error(404, "not found".into())),
            )
        })?;
    let mut a: product_discount::ActiveModel = d.into();
    a.deleted_at = Set(Some(chrono::Utc::now()));
    a.update(&state.db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;
    Ok(Json(ApiResponse::ok(())))
}
