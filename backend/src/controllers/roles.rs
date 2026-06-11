use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use sea_orm::{ActiveModelTrait, EntityTrait, Set};

use crate::{
    dto::{
        common::ApiResponse,
        role::{CreateRoleRequest, RoleResponse, UpdateRoleRequest},
    },
    models::role,
    state::AppState,
};

pub async fn list(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<RoleResponse>>>, (StatusCode, Json<ApiResponse<()>>)> {
    let roles = role::Entity::find().all(&state.db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    let responses: Vec<RoleResponse> = roles
        .into_iter()
        .map(|r| RoleResponse {
            id: r.id,
            name: r.name,
            created_at: r.created_at.to_rfc3339(),
        })
        .collect();

    Ok(Json(ApiResponse::ok(responses)))
}

pub async fn create(
    State(state): State<AppState>,
    Json(body): Json<CreateRoleRequest>,
) -> Result<Json<ApiResponse<RoleResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let role = role::ActiveModel {
        name: Set(body.name),
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

    Ok(Json(ApiResponse::ok(RoleResponse {
        id: role.id,
        name: role.name,
        created_at: role.created_at.to_rfc3339(),
    })))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(body): Json<UpdateRoleRequest>,
) -> Result<Json<ApiResponse<RoleResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let role = role::Entity::find_by_id(id)
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
                Json(ApiResponse::error(404, "role not found".into())),
            )
        })?;

    let mut active: role::ActiveModel = role.into();

    if let Some(name) = body.name {
        active.name = Set(name);
    }

    let updated = active.update(&state.db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    Ok(Json(ApiResponse::ok(RoleResponse {
        id: updated.id,
        name: updated.name,
        created_at: updated.created_at.to_rfc3339(),
    })))
}

pub async fn delete(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let result = role::Entity::delete_by_id(id)
        .exec(&state.db)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;

    if result.rows_affected == 0 {
        return Err((
            StatusCode::NOT_FOUND,
            Json(ApiResponse::error(404, "role not found".into())),
        ));
    }

    Ok(Json(ApiResponse::ok(())))
}
