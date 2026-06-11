use axum::{Router, routing::get};

use crate::{controllers::health, state::AppState};

pub fn router() -> Router<AppState> {
    Router::new().route("/health", get(health::check))
}
