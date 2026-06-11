use axum::{Json, extract::State};

use crate::{dto::common::ApiResponse, state::AppState};

pub async fn check(State(_state): State<AppState>) -> Json<ApiResponse<()>> {
    Json(ApiResponse::ok(()))
}
