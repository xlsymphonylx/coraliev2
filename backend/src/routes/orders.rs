use axum::{Json, Router, extract::State, routing::{get, patch, post}};

use crate::{
    controllers::orders,
    state::AppState,
    utils::auth::{AuthUser, RequireAdmin},
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", post(
            |State(state): State<AppState>, me: AuthUser, Json(body): Json<crate::dto::order::CreateOrderRequest>| async move {
                orders::create(State(state), me, Json(body)).await
            },
        ))
        .route("/admin", post(
            |State(state): State<AppState>, _a: RequireAdmin, Json(body): Json<crate::dto::order::CreateOrderRequest>| async move {
                orders::admin_create(State(state), _a, body).await
            },
        ))
        .route("/", get(
            |s: State<AppState>, _: RequireAdmin| async move { orders::list(s).await },
        ))
        .route("/{id}", get(
            |s: State<AppState>, p: axum::extract::Path<i32>, _: RequireAdmin| async move { orders::get(s, p).await },
        ))
        .route("/{id}/status", patch(
            |s: State<AppState>, p: axum::extract::Path<i32>, _: RequireAdmin, b: axum::Json<crate::dto::order::UpdateOrderStatusRequest>| async move {
                orders::update_status(s, p, b).await
            },
        ))
}
