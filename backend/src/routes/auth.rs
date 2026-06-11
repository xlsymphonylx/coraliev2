use axum::{Json, Router, extract::State, routing::post};

use crate::{
    controllers::auth,
    dto::auth::AdminSignupRequest,
    state::AppState,
    utils::auth::RequireAdmin,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/signup", post(auth::signup))
        .route("/login", post(auth::login))
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
}
