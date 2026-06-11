use axum::{Router, routing::{delete, get, patch, post}};

use crate::{
    controllers::categories,
    state::AppState,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(categories::list))
        .route("/", post(categories::create))
        .route("/{id}", patch(categories::update))
        .route("/{id}", delete(categories::delete))
}
