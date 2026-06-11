use axum::{Json, extract::{Path, State}, http::StatusCode};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};

use crate::{
    dto::{
        common::ApiResponse,
        volume_discount::{CreateVolumeDiscountRequest, UpdateVolumeDiscountRequest, VolumeDiscountResponse},
    },
    models::volume_discount, state::AppState,
};

pub async fn list(State(state): State<AppState>) -> Result<Json<ApiResponse<Vec<VolumeDiscountResponse>>>, (StatusCode, Json<ApiResponse<()>>)> {
    Ok(Json(ApiResponse::ok(volume_discount::Entity::find().filter(volume_discount::Column::DeletedAt.is_null()).all(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?.into_iter().map(|d| VolumeDiscountResponse { id: d.id, product_id: d.product_id, min_quantity: d.min_quantity, discount_percent: d.discount_percent, description: d.description }).collect())))
}
pub async fn create(State(state): State<AppState>, Json(body): Json<CreateVolumeDiscountRequest>) -> Result<Json<ApiResponse<VolumeDiscountResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let d = volume_discount::ActiveModel { product_id: Set(body.product_id), min_quantity: Set(body.min_quantity), discount_percent: Set(body.discount_percent), description: Set(body.description), ..Default::default() }.insert(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;
    Ok(Json(ApiResponse::ok(VolumeDiscountResponse { id: d.id, product_id: d.product_id, min_quantity: d.min_quantity, discount_percent: d.discount_percent, description: d.description })))
}
pub async fn update(State(state): State<AppState>, Path(id): Path<i32>, Json(body): Json<UpdateVolumeDiscountRequest>) -> Result<Json<ApiResponse<VolumeDiscountResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let d = volume_discount::Entity::find_by_id(id).filter(volume_discount::Column::DeletedAt.is_null()).one(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?.ok_or_else(|| (StatusCode::NOT_FOUND, Json(ApiResponse::error(404, "not found".into()))))?;
    let mut a: volume_discount::ActiveModel = d.into();
    if let Some(v) = body.min_quantity { a.min_quantity = Set(v); }
    if let Some(v) = body.discount_percent { a.discount_percent = Set(v); }
    if let Some(v) = body.description { a.description = Set(Some(v)); }
    let u = a.update(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;
    Ok(Json(ApiResponse::ok(VolumeDiscountResponse { id: u.id, product_id: u.product_id, min_quantity: u.min_quantity, discount_percent: u.discount_percent, description: u.description })))
}
pub async fn delete(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let d = volume_discount::Entity::find_by_id(id).filter(volume_discount::Column::DeletedAt.is_null()).one(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?.ok_or_else(|| (StatusCode::NOT_FOUND, Json(ApiResponse::error(404, "not found".into()))))?;
    let mut a: volume_discount::ActiveModel = d.into(); a.deleted_at = Set(Some(chrono::Utc::now())); a.update(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;
    Ok(Json(ApiResponse::ok(())))
}
