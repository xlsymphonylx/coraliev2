use axum::{Router, routing::{delete, get, patch, post}};
use crate::{controllers::coupons, state::AppState, utils::auth::RequireAdmin};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(|s: axum::extract::State<AppState>, _: RequireAdmin| async move { coupons::list(s).await }))
        .route("/", post(|s: axum::extract::State<AppState>, _: RequireAdmin, b: axum::Json<crate::dto::coupon::CreateCouponRequest>| async move { coupons::create(s, b).await }))
        .route("/{id}", patch(|s: axum::extract::State<AppState>, p: axum::extract::Path<i32>, _: RequireAdmin, b: axum::Json<crate::dto::coupon::UpdateCouponRequest>| async move { coupons::update(s, p, b).await }))
        .route("/{id}", delete(|s: axum::extract::State<AppState>, p: axum::extract::Path<i32>, _: RequireAdmin| async move { coupons::delete(s, p).await }))
}
