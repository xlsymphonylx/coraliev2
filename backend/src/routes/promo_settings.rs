use axum::{Router, extract::State, routing::{get, put}};

use crate::{
    controllers::promo_settings,
    state::AppState,
    utils::auth::RequireAdmin,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(promo_settings::get))
        .route("/", put(|State(state): State<AppState>, _: RequireAdmin, body: axum::Json<crate::dto::promo_setting::UpdatePromoSettingRequest>| async move {
            promo_settings::update(State(state), body).await
        }))
}
