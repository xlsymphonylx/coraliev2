use std::{sync::Arc, time::Duration};

use axum::{
    Json, Router,
    extract::State,
    middleware,
    routing::{post, put},
};

use crate::{
    controllers::auth,
    dto::auth::AdminSignupRequest,
    state::AppState,
    utils::{
        auth::RequireAdmin,
        rate_limiter::{RateLimiter, login_rate_limit},
    },
};

pub fn router() -> Router<AppState> {
    let login_limiter = Arc::new(RateLimiter::new(5, Duration::from_secs(60)));

    Router::new()
        .route("/signup", post(auth::signup))
        .route(
            "/login",
            post(auth::login)
                .route_layer(middleware::from_fn_with_state(login_limiter, login_rate_limit)),
        )
        .route(
            "/admin/signup",
            post(
                |State(state): State<AppState>,
                 _admin: RequireAdmin,
                 Json(body): Json<AdminSignupRequest>| async move {
                    auth::admin_signup(State(state), Json(body)).await
                },
            ),
        )
        .route("/me", put(auth::update_me))
        .route("/me/password", put(auth::change_password))
}
