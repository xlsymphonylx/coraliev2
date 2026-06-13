use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};

use crate::{
    dto::{
        common::ApiResponse,
        inventory::{CreateInventoryRequest, InventoryResponse, UpdateInventoryRequest},
    },
    models::inventory,
    state::AppState,
};

pub async fn list(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<InventoryResponse>>>, (StatusCode, Json<ApiResponse<()>>)> {
    let items = inventory::Entity::find()
        .filter(inventory::Column::DeletedAt.is_null())
        .all(&state.db)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;

    Ok(Json(ApiResponse::ok(
        items
            .into_iter()
            .map(|i| InventoryResponse {
                id: i.id,
                product_id: i.product_id,
                storage_unit_id: i.storage_unit_id,
                batch_code: i.batch_code,
                quantity: i.quantity,
                low_stock_threshold: i.low_stock_threshold,
                entry_date: i.entry_date.to_rfc3339(),
                expire_date: i.expire_date.map(|d| d.to_rfc3339()),
            })
            .collect(),
    )))
}

pub async fn create(
    State(state): State<AppState>,
    Json(body): Json<CreateInventoryRequest>,
) -> Result<Json<ApiResponse<InventoryResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let i = inventory::ActiveModel {
        product_id: Set(body.product_id),
        storage_unit_id: Set(body.storage_unit_id),
        batch_code: Set(body.batch_code),
        quantity: Set(body.quantity),
        low_stock_threshold: Set(body.low_stock_threshold.unwrap_or(5)),
        expire_date: Set(body.expire_date.and_then(|d| {
            chrono::DateTime::parse_from_rfc3339(&d)
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

    Ok(Json(ApiResponse::ok(InventoryResponse {
        id: i.id,
        product_id: i.product_id,
        storage_unit_id: i.storage_unit_id,
        batch_code: i.batch_code,
        quantity: i.quantity,
        low_stock_threshold: i.low_stock_threshold,
        entry_date: i.entry_date.to_rfc3339(),
        expire_date: i.expire_date.map(|d| d.to_rfc3339()),
    })))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(body): Json<UpdateInventoryRequest>,
) -> Result<Json<ApiResponse<InventoryResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let item = inventory::Entity::find_by_id(id)
        .filter(inventory::Column::DeletedAt.is_null())
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
                Json(ApiResponse::error(404, "inventory record not found".into())),
            )
        })?;

    let mut active: inventory::ActiveModel = item.into();
    if let Some(q) = body.quantity {
        active.quantity = Set(q);
    }
    if let Some(t) = body.low_stock_threshold {
        active.low_stock_threshold = Set(t);
    }

    let updated = active.update(&state.db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    Ok(Json(ApiResponse::ok(InventoryResponse {
        id: updated.id,
        product_id: updated.product_id,
        storage_unit_id: updated.storage_unit_id,
        batch_code: updated.batch_code,
        quantity: updated.quantity,
        low_stock_threshold: updated.low_stock_threshold,
        entry_date: updated.entry_date.to_rfc3339(),
        expire_date: updated.expire_date.map(|d| d.to_rfc3339()),
    })))
}
