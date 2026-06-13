use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};

use crate::{
    dto::{
        common::ApiResponse,
        storage_unit::{CreateStorageUnitRequest, StorageUnitResponse, UpdateStorageUnitRequest},
    },
    models::storage_unit,
    state::AppState,
};

pub async fn list(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<StorageUnitResponse>>>, (StatusCode, Json<ApiResponse<()>>)> {
    Ok(Json(ApiResponse::ok(
        storage_unit::Entity::find()
            .filter(storage_unit::Column::DeletedAt.is_null())
            .all(&state.db)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?
            .into_iter()
            .map(|s| StorageUnitResponse {
                id: s.id,
                warehouse_id: s.warehouse_id,
                code: s.code,
            })
            .collect(),
    )))
}
pub async fn create(
    State(state): State<AppState>,
    Json(body): Json<CreateStorageUnitRequest>,
) -> Result<Json<ApiResponse<StorageUnitResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let s = storage_unit::ActiveModel {
        warehouse_id: Set(body.warehouse_id),
        code: Set(body.code),
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
    Ok(Json(ApiResponse::ok(StorageUnitResponse {
        id: s.id,
        warehouse_id: s.warehouse_id,
        code: s.code,
    })))
}
pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(body): Json<UpdateStorageUnitRequest>,
) -> Result<Json<ApiResponse<StorageUnitResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let s = storage_unit::Entity::find_by_id(id)
        .filter(storage_unit::Column::DeletedAt.is_null())
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
    let mut a: storage_unit::ActiveModel = s.into();
    if let Some(c) = body.code {
        a.code = Set(c);
    }
    let u = a.update(&state.db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;
    Ok(Json(ApiResponse::ok(StorageUnitResponse {
        id: u.id,
        warehouse_id: u.warehouse_id,
        code: u.code,
    })))
}
pub async fn delete(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let s = storage_unit::Entity::find_by_id(id)
        .filter(storage_unit::Column::DeletedAt.is_null())
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
    let mut a: storage_unit::ActiveModel = s.into();
    a.deleted_at = Set(Some(chrono::Utc::now()));
    a.update(&state.db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;
    Ok(Json(ApiResponse::ok(())))
}
