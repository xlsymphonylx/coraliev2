use axum::{Json, extract::{Path, State}, http::StatusCode};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};

use crate::{
    dto::{
        address::{AddressResponse, CreateAddressRequest, UpdateAddressRequest},
        common::ApiResponse,
    },
    models::address,
    state::AppState,
    utils::auth::AuthUser,
};

pub async fn list(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<AddressResponse>>>, (StatusCode, Json<ApiResponse<()>>)> {
    let addresses = address::Entity::find()
        .filter(address::Column::DeletedAt.is_null())
        .all(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;

    Ok(Json(ApiResponse::ok(addresses.into_iter().map(|a| AddressResponse {
        id: a.id,
        user_id: a.user_id,
        label: a.label,
        line1: a.line1,
        line2: a.line2,
        city: a.city,
        state: a.state,
        is_default: a.is_default,
        created_at: a.created_at.to_rfc3339(),
    }).collect())))
}

pub async fn create(
    State(state): State<AppState>,
    me: AuthUser,
    Json(body): Json<CreateAddressRequest>,
) -> Result<Json<ApiResponse<AddressResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let a = address::ActiveModel {
        user_id: Set(Some(me.user_id)),
        label: Set(body.label),
        line1: Set(body.line1),
        line2: Set(body.line2),
        city: Set(body.city),
        state: Set(body.state),
        is_default: Set(body.is_default.unwrap_or(false)),
        ..Default::default()
    }
    .insert(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;

    Ok(Json(ApiResponse::ok(AddressResponse {
        id: a.id,
        user_id: a.user_id,
        label: a.label,
        line1: a.line1,
        line2: a.line2,
        city: a.city,
        state: a.state,
        is_default: a.is_default,
        created_at: a.created_at.to_rfc3339(),
    })))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(body): Json<UpdateAddressRequest>,
) -> Result<Json<ApiResponse<AddressResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let a = address::Entity::find_by_id(id)
        .filter(address::Column::DeletedAt.is_null())
        .one(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?
        .ok_or_else(|| (StatusCode::NOT_FOUND, Json(ApiResponse::error(404, "address not found".into()))))?;

    let mut active: address::ActiveModel = a.into();
    if let Some(v) = body.label { active.label = Set(v); }
    if let Some(v) = body.line1 { active.line1 = Set(v); }
    if let Some(v) = body.line2 { active.line2 = Set(Some(v)); }
    if let Some(v) = body.city { active.city = Set(v); }
    if let Some(v) = body.state { active.state = Set(v); }
    if let Some(v) = body.is_default { active.is_default = Set(v); }

    let updated = active.update(&state.db).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;

    Ok(Json(ApiResponse::ok(AddressResponse {
        id: updated.id,
        user_id: updated.user_id,
        label: updated.label,
        line1: updated.line1,
        line2: updated.line2,
        city: updated.city,
        state: updated.state,
        is_default: updated.is_default,
        created_at: updated.created_at.to_rfc3339(),
    })))
}

pub async fn delete(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let a = address::Entity::find_by_id(id)
        .filter(address::Column::DeletedAt.is_null())
        .one(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?
        .ok_or_else(|| (StatusCode::NOT_FOUND, Json(ApiResponse::error(404, "address not found".into()))))?;

    let mut active: address::ActiveModel = a.into();
    active.deleted_at = Set(Some(chrono::Utc::now()));
    active.update(&state.db).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;

    Ok(Json(ApiResponse::ok(())))
}
