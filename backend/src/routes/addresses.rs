use axum::{Router, routing::{delete, get, patch, post}};

use crate::{controllers::addresses, state::AppState};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(addresses::list))
        .route("/", post(addresses::create))
        .route("/{id}", patch(addresses::update))
        .route("/{id}", delete(addresses::delete))
}
