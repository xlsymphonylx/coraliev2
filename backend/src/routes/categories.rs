use axum::{Router, extract::State, routing::{delete, get, patch, post}};

use crate::{
    controllers::categories,
    state::AppState,
    utils::auth::RequireAdmin,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(categories::list))
        .route("/", post(|State(state): State<AppState>, _: RequireAdmin, body: axum::Json<crate::dto::category::CreateCategoryRequest>| async move {
            categories::create(State(state), body).await
        }))
        .route("/{id}", patch(|State(state): State<AppState>, id: axum::extract::Path<i32>, _: RequireAdmin, body: axum::Json<crate::dto::category::UpdateCategoryRequest>| async move {
            categories::update(State(state), id, body).await
        }))
        .route("/{id}", delete(|State(state): State<AppState>, id: axum::extract::Path<i32>, _: RequireAdmin| async move {
            categories::delete(State(state), id).await
        }))
}
