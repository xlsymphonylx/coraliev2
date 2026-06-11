use axum::{Router, routing::{get, patch, post}};

use crate::{controllers::inventory, state::AppState};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(inventory::list))
        .route("/", post(inventory::create))
        .route("/{id}", patch(inventory::update))
}
