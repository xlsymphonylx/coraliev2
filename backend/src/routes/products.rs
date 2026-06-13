use axum::{Router, extract::State, http::StatusCode, Json, routing::{delete, get, patch, post}};

use crate::{
    controllers::products,
    dto::common::ApiResponse,
    state::AppState,
    utils::auth::RequireAdmin,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(products::list))
        .route("/", post(|State(state): State<AppState>, _: RequireAdmin, body: axum::Json<crate::dto::product::CreateProductRequest>| async move {
            products::create(State(state), body).await
        }))
        .route("/{slug}", get(products::get))
        .route("/{slug}", patch(|State(state): State<AppState>, axum::extract::Path(slug): axum::extract::Path<String>, _: RequireAdmin, body: axum::Json<crate::dto::product::UpdateProductRequest>| async move {
            let id: i32 = slug.parse().map_err(|_| (StatusCode::BAD_REQUEST, Json(ApiResponse::error(400, "invalid id".into()))))?;
            products::update(State(state), axum::extract::Path(id), body).await
        }))
        .route("/{slug}", delete(|State(state): State<AppState>, axum::extract::Path(slug): axum::extract::Path<String>, _: RequireAdmin| async move {
            let id: i32 = slug.parse().map_err(|_| (StatusCode::BAD_REQUEST, Json(ApiResponse::error(400, "invalid id".into()))))?;
            products::delete(State(state), axum::extract::Path(id)).await
        }))
}
