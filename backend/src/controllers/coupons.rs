use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, QueryOrder, Set};

use crate::{
    dto::{
        common::ApiResponse,
        coupon::{CouponResponse, CreateCouponRequest, UpdateCouponRequest},
    },
    models::coupon,
    state::AppState,
};

fn model_to_response(d: coupon::Model) -> CouponResponse {
    CouponResponse {
        id: d.id,
        code: d.code,
        discount_type: d.discount_type,
        discount_value: d.discount_value,
        min_purchase: d.min_purchase,
        max_uses: d.max_uses,
        current_uses: d.current_uses,
        starts_at: d.starts_at.map(|t| t.to_rfc3339()),
        ends_at: d.ends_at.map(|t| t.to_rfc3339()),
        active: d.active,
        discount_set_id: d.discount_set_id,
    }
}

pub async fn list(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<CouponResponse>>>, (StatusCode, Json<ApiResponse<()>>)> {
    Ok(Json(ApiResponse::ok(
        coupon::Entity::find()
            .filter(coupon::Column::DeletedAt.is_null())
            .order_by_desc(coupon::Column::CreatedAt)
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
    Json(body): Json<CreateCouponRequest>,
) -> Result<Json<ApiResponse<CouponResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let d = coupon::ActiveModel {
        code: Set(body.code),
        discount_type: Set(body.discount_type),
        discount_value: Set(body.discount_value),
        min_purchase: Set(body.min_purchase),
        max_uses: Set(body.max_uses),
        current_uses: Set(Some(0)),
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
        active: Set(body.active),
        discount_set_id: Set(body.discount_set_id),
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
    Path(id): Path<i32>,
    Json(body): Json<UpdateCouponRequest>,
) -> Result<Json<ApiResponse<CouponResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let d = coupon::Entity::find_by_id(id)
        .filter(coupon::Column::DeletedAt.is_null())
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

    let mut a: coupon::ActiveModel = d.into();
    if let Some(v) = body.code { a.code = Set(v); }
    if let Some(v) = body.discount_type { a.discount_type = Set(v); }
    if let Some(v) = body.discount_value { a.discount_value = Set(v); }
    if let Some(v) = body.min_purchase { a.min_purchase = Set(Some(v)); }
    if let Some(v) = body.max_uses { a.max_uses = Set(Some(v)); }
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
    if let Some(v) = body.active { a.active = Set(Some(v)); }
    a.discount_set_id = Set(body.discount_set_id);

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
    Path(id): Path<i32>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let d = coupon::Entity::find_by_id(id)
        .filter(coupon::Column::DeletedAt.is_null())
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

    let mut a: coupon::ActiveModel = d.into();
    a.deleted_at = Set(Some(chrono::Utc::now()));
    a.update(&state.db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    Ok(Json(ApiResponse::ok(())))
}
