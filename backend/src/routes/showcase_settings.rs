use axum::{Router, extract::State, routing::{get, put}};

use crate::{
    controllers::showcase_settings,
    state::AppState,
    utils::auth::RequireAdmin,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(showcase_settings::get))
        .route("/", put(|State(state): State<AppState>, _: RequireAdmin, body: axum::Json<crate::dto::showcase_setting::UpdateShowcaseSettingRequest>| async move {
            showcase_settings::update(State(state), body).await
        }))
}
