use axum::{Json, extract::{Path, State}, http::StatusCode};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};

use crate::{
    dto::{
        common::ApiResponse,
        warehouse::{CreateWarehouseRequest, UpdateWarehouseRequest, WarehouseResponse},
    },
    models::warehouse, state::AppState,
};

pub async fn list(State(state): State<AppState>) -> Result<Json<ApiResponse<Vec<WarehouseResponse>>>, (StatusCode, Json<ApiResponse<()>>)> {
    Ok(Json(ApiResponse::ok(warehouse::Entity::find().filter(warehouse::Column::DeletedAt.is_null()).all(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?.into_iter().map(|w| WarehouseResponse { id: w.id, name: w.name, created_at: w.created_at.to_rfc3339() }).collect())))
}
pub async fn create(State(state): State<AppState>, Json(body): Json<CreateWarehouseRequest>) -> Result<Json<ApiResponse<WarehouseResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let w = warehouse::ActiveModel { name: Set(body.name), ..Default::default() }.insert(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;
    Ok(Json(ApiResponse::ok(WarehouseResponse { id: w.id, name: w.name, created_at: w.created_at.to_rfc3339() })))
}
pub async fn update(State(state): State<AppState>, Path(id): Path<i32>, Json(body): Json<UpdateWarehouseRequest>) -> Result<Json<ApiResponse<WarehouseResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let w = warehouse::Entity::find_by_id(id).filter(warehouse::Column::DeletedAt.is_null()).one(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?.ok_or_else(|| (StatusCode::NOT_FOUND, Json(ApiResponse::error(404, "not found".into()))))?;
    let mut a: warehouse::ActiveModel = w.into(); if let Some(n) = body.name { a.name = Set(n); }
    let u = a.update(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;
    Ok(Json(ApiResponse::ok(WarehouseResponse { id: u.id, name: u.name, created_at: u.created_at.to_rfc3339() })))
}
pub async fn delete(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let w = warehouse::Entity::find_by_id(id).filter(warehouse::Column::DeletedAt.is_null()).one(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?.ok_or_else(|| (StatusCode::NOT_FOUND, Json(ApiResponse::error(404, "not found".into()))))?;
    let mut a: warehouse::ActiveModel = w.into(); a.deleted_at = Set(Some(chrono::Utc::now())); a.update(&state.db).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;
    Ok(Json(ApiResponse::ok(())))
}
