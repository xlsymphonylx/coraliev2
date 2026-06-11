use axum::{
    extract::FromRequestParts,
    http::{StatusCode, request::Parts},
    response::Json,
};

use crate::dto::common::ApiResponse;
use crate::state::AppState;
use crate::utils::jwt::decode_token;

#[derive(Clone, Debug)]
pub struct AuthUser {
    pub user_id: i32,
    pub username: String,
    pub roles: Vec<String>,
}

impl AuthUser {
    pub fn has_role(&self, role: &str) -> bool {
        self.roles.iter().any(|r| r == role)
    }
}

impl FromRequestParts<AppState> for AuthUser {
    type Rejection = (StatusCode, Json<ApiResponse<()>>);

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let header = parts
            .headers
            .get("Authorization")
            .and_then(|v| v.to_str().ok())
            .and_then(|v| v.strip_prefix("Bearer "));

        let token = header.ok_or_else(|| {
            (
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::error(401, "missing authorization header".into())),
            )
        })?;

        let claims = decode_token(token, &state.jwt_secret).map_err(|_| {
            (
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::error(401, "invalid or expired token".into())),
            )
        })?;

        Ok(AuthUser {
            user_id: claims.sub,
            username: claims.username,
            roles: claims.roles,
        })
    }
}

/// Require admin role — delegates to AuthUser extractor, then checks role.
#[derive(Clone, Debug)]
pub struct RequireAdmin(pub AuthUser);

impl FromRequestParts<AppState> for RequireAdmin {
    type Rejection = (StatusCode, Json<ApiResponse<()>>);

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let user = AuthUser::from_request_parts(parts, state).await?;

        if !user.has_role("admin") {
            return Err((
                StatusCode::FORBIDDEN,
                Json(ApiResponse::error(403, "admin access required".into())),
            ));
        }

        Ok(RequireAdmin(user))
    }
}
