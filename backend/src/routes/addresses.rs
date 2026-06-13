use axum::{Router, routing::{delete, get, patch, post}};

use crate::{controllers::addresses, state::AppState, utils::auth::AuthUser};
use axum::{Json, extract::State};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(
            |s: State<AppState>, me: AuthUser| async move { addresses::list(s, me).await },
        ))
        .route("/", post(
            |State(state): State<AppState>, me: AuthUser, Json(body): Json<crate::dto::address::CreateAddressRequest>| async move {
                addresses::create(State(state), me, Json(body)).await
            },
        ))
        .route("/{id}", patch(
            |s: State<AppState>, me: AuthUser, p: axum::extract::Path<i32>, b: axum::Json<crate::dto::address::UpdateAddressRequest>| async move {
                addresses::update(s, me, p, b).await
            },
        ))
        .route("/{id}", delete(
            |s: State<AppState>, me: AuthUser, p: axum::extract::Path<i32>| async move { addresses::delete(s, me, p).await },
        ))
}
