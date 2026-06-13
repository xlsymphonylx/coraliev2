use axum::{Router, routing::{delete, get, patch, post}};
use crate::{controllers::product_images, state::AppState, utils::auth::RequireAdmin};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(|s: axum::extract::State<AppState>, _: RequireAdmin| async move { product_images::list(s).await }))
        .route("/", post(|s: axum::extract::State<AppState>, _: RequireAdmin, b: axum::Json<crate::dto::product_image::CreateImageRequest>| async move { product_images::create(s, b).await }))
        .route("/{id}", patch(|s: axum::extract::State<AppState>, p: axum::extract::Path<i32>, _: RequireAdmin, b: axum::Json<crate::dto::product_image::UpdateImageRequest>| async move { product_images::update(s, p, b).await }))
        .route("/{id}", delete(|s: axum::extract::State<AppState>, p: axum::extract::Path<i32>, _: RequireAdmin| async move { product_images::delete(s, p).await }))
}
