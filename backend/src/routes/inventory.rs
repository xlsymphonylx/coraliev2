use axum::{Router, routing::{get, patch, post}};

use crate::{controllers::inventory, state::AppState, utils::auth::RequireAdmin};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(|s: axum::extract::State<AppState>, _: RequireAdmin| async move { inventory::list(s).await }))
        .route("/", post(|s: axum::extract::State<AppState>, _: RequireAdmin, b: axum::Json<crate::dto::inventory::CreateInventoryRequest>| async move { inventory::create(s, b).await }))
        .route("/{id}", patch(|s: axum::extract::State<AppState>, p: axum::extract::Path<i32>, _: RequireAdmin, b: axum::Json<crate::dto::inventory::UpdateInventoryRequest>| async move { inventory::update(s, p, b).await }))
}
