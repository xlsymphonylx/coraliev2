use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, ModelTrait, QueryFilter, Set};

use crate::{
    dto::{
        auth::RoleInfo,
        common::ApiResponse,
        user::{UpdateUserRequest, UserResponse},
    },
    models::{role, user, user::Entity as User},
    state::AppState,
};

pub async fn list(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<UserResponse>>>, (StatusCode, Json<ApiResponse<()>>)> {
    let users = User::find().all(&state.db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    let mut responses = Vec::new();
    for u in users {
        let roles = u
            .find_related(role::Entity)
            .all(&state.db)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?;
        let role_infos: Vec<RoleInfo> = roles.into_iter().map(|r| r.into()).collect();

        responses.push(UserResponse {
            id: u.id,
            username: u.username,
            email: u.email,
            roles: role_infos,
            created_at: u.created_at.to_rfc3339(),
            updated_at: u.updated_at.to_rfc3339(),
        });
    }

    Ok(Json(ApiResponse::ok(responses)))
}

pub async fn get(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<ApiResponse<UserResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let user = User::find_by_id(id).one(&state.db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    let user = user.ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(ApiResponse::error(404, "user not found".into())),
        )
    })?;

    let roles = user
        .find_related(role::Entity)
        .all(&state.db)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;
    let role_infos: Vec<RoleInfo> = roles.into_iter().map(|r| r.into()).collect();

    Ok(Json(ApiResponse::ok(UserResponse {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: role_infos,
        created_at: user.created_at.to_rfc3339(),
        updated_at: user.updated_at.to_rfc3339(),
    })))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(body): Json<UpdateUserRequest>,
) -> Result<Json<ApiResponse<UserResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let user = User::find_by_id(id).one(&state.db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    let user = user.ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(ApiResponse::error(404, "user not found".into())),
        )
    })?;

    let current_username = user.username.clone();
    let current_email = user.email.clone();

    let mut active: user::ActiveModel = user.into();

    if let Some(ref username) = body.username {
        if *username != current_username {
            let conflict = User::find()
                .filter(user::Column::Username.eq(username))
                .filter(user::Column::Id.ne(id))
                .one(&state.db)
                .await
                .map_err(|e| {
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(ApiResponse::error(500, e.to_string())),
                    )
                })?;
            if conflict.is_some() {
                return Err((
                    StatusCode::CONFLICT,
                    Json(ApiResponse::error(409, "username already taken".into())),
                ));
            }
        }
        active.username = Set(username.clone());
    }
    if let Some(ref email) = body.email {
        if *email != current_email {
            let conflict = User::find()
                .filter(user::Column::Email.eq(email))
                .filter(user::Column::Id.ne(id))
                .one(&state.db)
                .await
                .map_err(|e| {
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(ApiResponse::error(500, e.to_string())),
                    )
                })?;
            if conflict.is_some() {
                return Err((
                    StatusCode::CONFLICT,
                    Json(ApiResponse::error(409, "email already taken".into())),
                ));
            }
        }
        active.email = Set(email.clone());
    }
    if let Some(password) = body.password {
        let hash = bcrypt::hash(&password, 10).map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;
        active.password_hash = Set(hash);
    }

    let updated = active.update(&state.db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    let roles = updated
        .find_related(role::Entity)
        .all(&state.db)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;
    let role_infos: Vec<RoleInfo> = roles.into_iter().map(|r| r.into()).collect();

    Ok(Json(ApiResponse::ok(UserResponse {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        roles: role_infos,
        created_at: updated.created_at.to_rfc3339(),
        updated_at: updated.updated_at.to_rfc3339(),
    })))
}

pub async fn delete(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let result = User::delete_by_id(id).exec(&state.db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    if result.rows_affected == 0 {
        return Err((
            StatusCode::NOT_FOUND,
            Json(ApiResponse::error(404, "user not found".into())),
        ));
    }

    Ok(Json(ApiResponse::ok(())))
}
