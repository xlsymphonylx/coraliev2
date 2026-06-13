use axum::{Router, extract::State, routing::{delete, get, post}};

use crate::{
    controllers::tags,
    state::AppState,
    utils::auth::RequireAdmin,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(tags::list))
        .route("/", post(|State(state): State<AppState>, _: RequireAdmin, body: axum::Json<crate::dto::tag::CreateTagRequest>| async move {
            tags::create(State(state), body).await
        }))
        .route("/{id}", delete(|State(state): State<AppState>, id: axum::extract::Path<i32>, _: RequireAdmin| async move {
            tags::delete(State(state), id).await
        }))
}
