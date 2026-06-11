use axum::{Router, routing::{delete, get, post}};

use crate::{
    controllers::tags,
    state::AppState,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(tags::list))
        .route("/", post(tags::create))
        .route("/{id}", delete(tags::delete))
}
