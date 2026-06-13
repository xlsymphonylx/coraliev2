use axum::{Json, extract::{Path, State}, http::StatusCode};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};

use crate::{
    dto::{
        bundle_item::{BundleItemResponse, CreateBundleItemRequest, UpdateBundleItemRequest},
        common::ApiResponse,
    },
    models::bundle_item, state::AppState,
};

pub async fn list(State(state): State<AppState>) -> Result<Json<ApiResponse<Vec<BundleItemResponse>>>, (StatusCode, Json<ApiResponse<()>>)> {
    Ok(Json(ApiResponse::ok(bundle_item::Entity::find().filter(bundle_item::Column::DeletedAt.is_null()).all(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?.into_iter().map(|b| BundleItemResponse { id: b.id, bundle_id: b.bundle_id, product_id: b.product_id, quantity: b.quantity, sort_order: b.sort_order }).collect())))
}
pub async fn create(State(state): State<AppState>, Json(body): Json<CreateBundleItemRequest>) -> Result<Json<ApiResponse<BundleItemResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let b = bundle_item::ActiveModel { bundle_id: Set(body.bundle_id), product_id: Set(body.product_id), quantity: Set(body.quantity.unwrap_or(1)), sort_order: Set(body.sort_order.unwrap_or(0)), ..Default::default() }.insert(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;
    Ok(Json(ApiResponse::ok(BundleItemResponse { id: b.id, bundle_id: b.bundle_id, product_id: b.product_id, quantity: b.quantity, sort_order: b.sort_order })))
}
pub async fn update(State(state): State<AppState>, Path(id): Path<i32>, Json(body): Json<UpdateBundleItemRequest>) -> Result<Json<ApiResponse<BundleItemResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let bi = bundle_item::Entity::find_by_id(id).filter(bundle_item::Column::DeletedAt.is_null()).one(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?.ok_or_else(|| (StatusCode::NOT_FOUND, Json(ApiResponse::error(404, "not found".into()))))?;
    let mut a: bundle_item::ActiveModel = bi.into();
    if let Some(v) = body.product_id { a.product_id = Set(v); }
    if let Some(v) = body.quantity { a.quantity = Set(v); }
    if let Some(v) = body.sort_order { a.sort_order = Set(v); }
    let u = a.update(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;
    Ok(Json(ApiResponse::ok(BundleItemResponse { id: u.id, bundle_id: u.bundle_id, product_id: u.product_id, quantity: u.quantity, sort_order: u.sort_order })))
}
pub async fn delete(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let bi = bundle_item::Entity::find_by_id(id).filter(bundle_item::Column::DeletedAt.is_null()).one(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?.ok_or_else(|| (StatusCode::NOT_FOUND, Json(ApiResponse::error(404, "not found".into()))))?;
    let mut a: bundle_item::ActiveModel = bi.into(); a.deleted_at = Set(Some(chrono::Utc::now())); a.update(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;
    Ok(Json(ApiResponse::ok(())))
}
