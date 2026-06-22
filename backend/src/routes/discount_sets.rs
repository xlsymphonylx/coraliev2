use axum::{Router, routing::{delete, get, patch, post}};
use uuid::Uuid;
use crate::{controllers::discount_sets, state::AppState, utils::auth::RequireAdmin};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(|s: axum::extract::State<AppState>, _: RequireAdmin| async move { discount_sets::list(s).await }))
        .route("/", post(|s: axum::extract::State<AppState>, _: RequireAdmin, b: axum::Json<crate::dto::discount_set::CreateDiscountSetRequest>| async move { discount_sets::create(s, b).await }))
        .route("/{id}", patch(|s: axum::extract::State<AppState>, p: axum::extract::Path<Uuid>, _: RequireAdmin, b: axum::Json<crate::dto::discount_set::UpdateDiscountSetRequest>| async move { discount_sets::update(s, p, b).await }))
        .route("/{id}", delete(|s: axum::extract::State<AppState>, p: axum::extract::Path<Uuid>, _: RequireAdmin| async move { discount_sets::delete(s, p).await }))
}
