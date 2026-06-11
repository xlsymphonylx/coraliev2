use axum::{Router, routing::{get, patch, post}};

use crate::{controllers::orders, state::AppState};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", post(orders::create))
        .route("/", get(orders::list))
        .route("/{id}", get(orders::get))
        .route("/{id}/status", patch(orders::update_status))
}
