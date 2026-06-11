use axum::{Json, extract::State, http::StatusCode};
use sea_orm::{
    ActiveModelTrait, ColumnTrait, EntityTrait, ModelTrait, QueryFilter, Set, TransactionTrait,
};

use crate::{
    dto::{
        auth::{
            AdminSignupRequest, AuthResponse, ChangePasswordRequest, LoginRequest, RoleInfo,
            SignupRequest, UpdateProfileRequest, UserInfo,
        },
        common::ApiResponse,
    },
    models::{
        role, role::Entity as Role,
        user,
        user::Entity as User,
        user_role,
    },
    state::AppState,
    utils::{auth::AuthUser, jwt},
};

pub async fn signup(
    State(state): State<AppState>,
    Json(body): Json<SignupRequest>,
) -> Result<Json<ApiResponse<AuthResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let txn = state.db.begin().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    // Check existing username or email
    let existing = User::find()
        .filter(
            sea_orm::Condition::any()
                .add(user::Column::Username.eq(&body.username))
                .add(user::Column::Email.eq(&body.email)),
        )
        .one(&txn)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;

    if existing.is_some() {
        return Err((
            StatusCode::CONFLICT,
            Json(ApiResponse::error(409, "username or email already taken".into())),
        ));
    }

    let password_hash = bcrypt::hash(&body.password, 10).map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    // Create user
    let user = user::ActiveModel {
        username: Set(body.username.clone()),
        email: Set(body.email.clone()),
        password_hash: Set(password_hash),
        ..Default::default()
    }
    .insert(&txn)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    // Auto-assign "customer" role
    let customer_role = Role::find()
        .filter(role::Column::Name.eq("customer"))
        .one(&txn)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?
        .ok_or_else(|| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(
                    500,
                    "customer role not found — run migrations first".into(),
                )),
            )
        })?;

    user_role::ActiveModel {
        user_id: Set(user.id),
        role_id: Set(customer_role.id),
        ..Default::default()
    }
    .insert(&txn)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    txn.commit().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    let roles = vec![customer_role.into()];
    let claims = jwt::make_claims(user.id, &user.username, vec!["customer".into()], 86400);
    let token =
        jwt::encode_token(&claims, &state.jwt_secret).map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;

    Ok(Json(ApiResponse::ok(AuthResponse {
        token,
        user: UserInfo {
            id: user.id,
            username: user.username,
            email: user.email,
            roles,
        },
    })))
}

pub async fn admin_signup(
    State(state): State<AppState>,
    Json(body): Json<AdminSignupRequest>,
) -> Result<Json<ApiResponse<AuthResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let txn = state.db.begin().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    // Check existing
    let existing = User::find()
        .filter(
            sea_orm::Condition::any()
                .add(user::Column::Username.eq(&body.username))
                .add(user::Column::Email.eq(&body.email)),
        )
        .one(&txn)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;

    if existing.is_some() {
        return Err((
            StatusCode::CONFLICT,
            Json(ApiResponse::error(409, "username or email already taken".into())),
        ));
    }

    // Verify the requested role exists
    let role = Role::find_by_id(body.role_id).one(&txn).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    let role = role.ok_or_else(|| {
        (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::error(400, "role not found".into())),
        )
    })?;

    let password_hash = bcrypt::hash(&body.password, 10).map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    let user = user::ActiveModel {
        username: Set(body.username.clone()),
        email: Set(body.email.clone()),
        password_hash: Set(password_hash),
        ..Default::default()
    }
    .insert(&txn)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    user_role::ActiveModel {
        user_id: Set(user.id),
        role_id: Set(role.id),
        ..Default::default()
    }
    .insert(&txn)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    txn.commit().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    let role_name = role.name.clone();
    let claims = jwt::make_claims(user.id, &user.username, vec![role_name.clone()], 86400);
    let token =
        jwt::encode_token(&claims, &state.jwt_secret).map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;

    Ok(Json(ApiResponse::ok(AuthResponse {
        token,
        user: UserInfo {
            id: user.id,
            username: user.username,
            email: user.email,
            roles: vec![role.into()],
        },
    })))
}

pub async fn login(
    State(state): State<AppState>,
    Json(body): Json<LoginRequest>,
) -> Result<Json<ApiResponse<AuthResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let user = User::find()
        .filter(user::Column::Username.eq(&body.username))
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
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::error(401, "invalid username or password".into())),
            )
        })?;

    let valid = bcrypt::verify(&body.password, &user.password_hash).unwrap_or(false);
    if !valid {
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse::error(401, "invalid username or password".into())),
        ));
    }

    // Load roles for this user
    let roles: Vec<role::Model> = user
        .find_related(role::Entity)
        .all(&state.db)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;

    let role_names: Vec<String> = roles.iter().map(|r| r.name.clone()).collect();
    let role_infos: Vec<crate::dto::auth::RoleInfo> = roles.into_iter().map(|r| r.into()).collect();

    let claims = jwt::make_claims(user.id, &user.username, role_names, 86400);
    let token =
        jwt::encode_token(&claims, &state.jwt_secret).map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;

    Ok(Json(ApiResponse::ok(AuthResponse {
        token,
        user: UserInfo {
            id: user.id,
            username: user.username,
            email: user.email,
            roles: role_infos,
        },
    })))
}

pub async fn update_me(
    State(state): State<AppState>,
    me: AuthUser,
    Json(body): Json<UpdateProfileRequest>,
) -> Result<Json<ApiResponse<UserInfo>>, (StatusCode, Json<ApiResponse<()>>)> {
    let user = User::find_by_id(me.user_id)
        .one(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?
        .ok_or_else(|| (StatusCode::NOT_FOUND, Json(ApiResponse::error(404, "user not found".into()))))?;

    let mut active: user::ActiveModel = user.into();

    if let Some(username) = &body.username {
        check_conflict(
            &state.db,
            Some(&user::Column::Username),
            username,
            me.user_id,
            "username already taken",
        )
        .await?;
        active.username = Set(username.clone());
    }

    if let Some(email) = &body.email {
        check_conflict(
            &state.db,
            Some(&user::Column::Email),
            email,
            me.user_id,
            "email already taken",
        )
        .await?;
        active.email = Set(email.clone());
    }

    let updated = active
        .update(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;

    let roles: Vec<role::Model> = updated
        .find_related(role::Entity)
        .all(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;
    let role_infos: Vec<RoleInfo> = roles.into_iter().map(|r| r.into()).collect();

    Ok(Json(ApiResponse::ok(UserInfo {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        roles: role_infos,
    })))
}

pub async fn change_password(
    State(state): State<AppState>,
    me: AuthUser,
    Json(body): Json<ChangePasswordRequest>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let user = User::find_by_id(me.user_id)
        .one(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?
        .ok_or_else(|| (StatusCode::NOT_FOUND, Json(ApiResponse::error(404, "user not found".into()))))?;

    let valid = bcrypt::verify(&body.current_password, &user.password_hash).unwrap_or(false);
    if !valid {
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse::error(401, "current password is incorrect".into())),
        ));
    }

    let hash = bcrypt::hash(&body.new_password, 10)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;

    let mut active: user::ActiveModel = user.into();
    active.password_hash = Set(hash);
    active
        .update(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;

    Ok(Json(ApiResponse::ok(())))
}

async fn check_conflict(
    db: &sea_orm::DatabaseConnection,
    column: Option<&user::Column>,
    value: &str,
    exclude_id: i32,
    message: &str,
) -> Result<(), (StatusCode, Json<ApiResponse<()>>)> {
    if let Some(col) = column {
        let existing = User::find()
            .filter(col.eq(value))
            .filter(user::Column::Id.ne(exclude_id))
            .one(db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;

        if existing.is_some() {
            return Err((StatusCode::CONFLICT, Json(ApiResponse::error(409, message.into()))));
        }
    }
    Ok(())
}
