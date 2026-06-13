use axum::{Json, extract::{Path, State}, http::StatusCode};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};

use crate::{
    dto::{
        common::ApiResponse,
        product_image::{CreateImageRequest, UpdateImageRequest, ImageResponse},
    },
    models::product_image, state::AppState,
};

pub async fn list(State(state): State<AppState>) -> Result<Json<ApiResponse<Vec<ImageResponse>>>, (StatusCode, Json<ApiResponse<()>>)> {
    Ok(Json(ApiResponse::ok(product_image::Entity::find().filter(product_image::Column::DeletedAt.is_null()).all(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?.into_iter().map(|i| ImageResponse { id: i.id, product_id: i.product_id, url: i.url, alt: i.alt, sort_order: i.sort_order }).collect())))
}
pub async fn create(State(state): State<AppState>, Json(body): Json<CreateImageRequest>) -> Result<Json<ApiResponse<ImageResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let i = product_image::ActiveModel { product_id: Set(body.product_id), url: Set(body.url), alt: Set(body.alt), sort_order: Set(body.sort_order.unwrap_or(0)), ..Default::default() }.insert(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;
    Ok(Json(ApiResponse::ok(ImageResponse { id: i.id, product_id: i.product_id, url: i.url, alt: i.alt, sort_order: i.sort_order })))
}
pub async fn update(State(state): State<AppState>, Path(id): Path<i32>, Json(body): Json<UpdateImageRequest>) -> Result<Json<ApiResponse<ImageResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let img = product_image::Entity::find_by_id(id).filter(product_image::Column::DeletedAt.is_null()).one(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?.ok_or_else(|| (StatusCode::NOT_FOUND, Json(ApiResponse::error(404, "not found".into()))))?;
    let mut a: product_image::ActiveModel = img.into();
    if let Some(v) = body.url { a.url = Set(v); }
    if let Some(v) = body.alt { a.alt = Set(Some(v)); }
    if let Some(v) = body.sort_order { a.sort_order = Set(v); }
    let u = a.update(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;
    Ok(Json(ApiResponse::ok(ImageResponse { id: u.id, product_id: u.product_id, url: u.url, alt: u.alt, sort_order: u.sort_order })))
}
pub async fn delete(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let img = product_image::Entity::find_by_id(id).filter(product_image::Column::DeletedAt.is_null()).one(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?.ok_or_else(|| (StatusCode::NOT_FOUND, Json(ApiResponse::error(404, "not found".into()))))?;
    let mut a: product_image::ActiveModel = img.into(); a.deleted_at = Set(Some(chrono::Utc::now())); a.update(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;
    Ok(Json(ApiResponse::ok(())))
}
