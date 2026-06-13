use axum::{Router, extract::State, routing::{delete, get, patch, post}};

use crate::{
    controllers::products,
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
        .route("/{id}", patch(|State(state): State<AppState>, id: axum::extract::Path<i32>, _: RequireAdmin, body: axum::Json<crate::dto::product::UpdateProductRequest>| async move {
            products::update(State(state), id, body).await
        }))
        .route("/{id}", delete(|State(state): State<AppState>, id: axum::extract::Path<i32>, _: RequireAdmin| async move {
            products::delete(State(state), id).await
        }))
}
