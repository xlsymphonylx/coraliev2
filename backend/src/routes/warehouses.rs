use axum::{Router, routing::{delete, get, patch, post}};
use crate::{controllers::warehouses, state::AppState, utils::auth::RequireAdmin};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(|s: axum::extract::State<AppState>, _: RequireAdmin| async move { warehouses::list(s).await }))
        .route("/", post(|s: axum::extract::State<AppState>, _: RequireAdmin, b: axum::Json<crate::dto::warehouse::CreateWarehouseRequest>| async move { warehouses::create(s, b).await }))
        .route("/{id}", patch(|s: axum::extract::State<AppState>, p: axum::extract::Path<i32>, _: RequireAdmin, b: axum::Json<crate::dto::warehouse::UpdateWarehouseRequest>| async move { warehouses::update(s, p, b).await }))
        .route("/{id}", delete(|s: axum::extract::State<AppState>, p: axum::extract::Path<i32>, _: RequireAdmin| async move { warehouses::delete(s, p).await }))
}
