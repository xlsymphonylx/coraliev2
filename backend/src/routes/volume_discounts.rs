use axum::{Router, routing::{delete, get, patch, post}};
use crate::{controllers::volume_discounts, state::AppState, utils::auth::RequireAdmin};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(|s: axum::extract::State<AppState>, _: RequireAdmin| async move { volume_discounts::list(s).await }))
        .route("/", post(|s: axum::extract::State<AppState>, _: RequireAdmin, b: axum::Json<crate::dto::volume_discount::CreateVolumeDiscountRequest>| async move { volume_discounts::create(s, b).await }))
        .route("/{id}", patch(|s: axum::extract::State<AppState>, p: axum::extract::Path<i32>, _: RequireAdmin, b: axum::Json<crate::dto::volume_discount::UpdateVolumeDiscountRequest>| async move { volume_discounts::update(s, p, b).await }))
        .route("/{id}", delete(|s: axum::extract::State<AppState>, p: axum::extract::Path<i32>, _: RequireAdmin| async move { volume_discounts::delete(s, p).await }))
}
