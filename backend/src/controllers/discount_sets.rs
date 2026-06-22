use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, QueryOrder, Set};
use uuid::Uuid;

use crate::{
    dto::{
        common::ApiResponse,
        discount_set::{DiscountSetResponse, CreateDiscountSetRequest, UpdateDiscountSetRequest},
    },
    models::discount_set,
    state::AppState,
};

fn model_to_response(d: discount_set::Model) -> DiscountSetResponse {
    DiscountSetResponse {
        id: d.id,
        name: d.name,
        slug: d.slug,
        description: d.description,
        active: d.active,
        starts_at: d.starts_at.map(|t| t.to_rfc3339()),
        ends_at: d.ends_at.map(|t| t.to_rfc3339()),
    }
}

pub async fn list(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<DiscountSetResponse>>>, (StatusCode, Json<ApiResponse<()>>)> {
    Ok(Json(ApiResponse::ok(
        discount_set::Entity::find()
            .filter(discount_set::Column::DeletedAt.is_null())
            .order_by_desc(discount_set::Column::CreatedAt)
            .all(&state.db)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?
            .into_iter()
            .map(model_to_response)
            .collect(),
    )))
}

pub async fn create(
    State(state): State<AppState>,
    Json(body): Json<CreateDiscountSetRequest>,
) -> Result<Json<ApiResponse<DiscountSetResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let d = discount_set::ActiveModel {
        id: Set(Uuid::new_v4()),
        name: Set(body.name),
        slug: Set(body.slug),
        description: Set(body.description),
        active: Set(body.active),
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

    Ok(Json(ApiResponse::ok(model_to_response(d))))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateDiscountSetRequest>,
) -> Result<Json<ApiResponse<DiscountSetResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let d = discount_set::Entity::find_by_id(id)
        .filter(discount_set::Column::DeletedAt.is_null())
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

    let mut a: discount_set::ActiveModel = d.into();
    if let Some(v) = body.name { a.name = Set(v); }
    if let Some(v) = body.slug { a.slug = Set(v); }
    if let Some(v) = body.description { a.description = Set(Some(v)); }
    if let Some(v) = body.active { a.active = Set(Some(v)); }
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

    Ok(Json(ApiResponse::ok(model_to_response(u))))
}

pub async fn delete(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let d = discount_set::Entity::find_by_id(id)
        .filter(discount_set::Column::DeletedAt.is_null())
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

    let mut a: discount_set::ActiveModel = d.into();
    a.deleted_at = Set(Some(chrono::Utc::now()));
    a.update(&state.db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    Ok(Json(ApiResponse::ok(())))
}
