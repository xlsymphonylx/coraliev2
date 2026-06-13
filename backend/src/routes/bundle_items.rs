use axum::{Router, routing::{delete, get, patch, post}};
use crate::{controllers::bundle_items, state::AppState, utils::auth::RequireAdmin};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(|s: axum::extract::State<AppState>, _: RequireAdmin| async move { bundle_items::list(s).await }))
        .route("/", post(|s: axum::extract::State<AppState>, _: RequireAdmin, b: axum::Json<crate::dto::bundle_item::CreateBundleItemRequest>| async move { bundle_items::create(s, b).await }))
        .route("/{id}", patch(|s: axum::extract::State<AppState>, p: axum::extract::Path<i32>, _: RequireAdmin, b: axum::Json<crate::dto::bundle_item::UpdateBundleItemRequest>| async move { bundle_items::update(s, p, b).await }))
        .route("/{id}", delete(|s: axum::extract::State<AppState>, p: axum::extract::Path<i32>, _: RequireAdmin| async move { bundle_items::delete(s, p).await }))
}
