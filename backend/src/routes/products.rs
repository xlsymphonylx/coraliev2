use axum::{Router, routing::{delete, get, patch, post}};

use crate::{
    controllers::products,
    state::AppState,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(products::list))
        .route("/", post(products::create))
        .route("/{slug}", get(products::get))
        .route("/{id}", patch(products::update))
        .route("/{id}", delete(products::delete))
}
