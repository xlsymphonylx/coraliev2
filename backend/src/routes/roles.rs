use axum::{Router, routing::get};

use crate::{controllers::roles, state::AppState, utils::auth::RequireAdmin};

pub fn router() -> Router<AppState> {
    Router::new()
        .route(
            "/",
            get({
                |state: axum::extract::State<AppState>, _admin: RequireAdmin| async move {
                    roles::list(state).await
                }
            }),
        )
        .route(
            "/",
            axum::routing::post(
                |state: axum::extract::State<AppState>,
                 _admin: RequireAdmin,
                 body: axum::Json<crate::dto::role::CreateRoleRequest>| async move {
                    roles::create(state, body).await
                },
            ),
        )
        .route(
            "/{id}",
            axum::routing::patch(
                |state: axum::extract::State<AppState>,
                 id: axum::extract::Path<i32>,
                 _admin: RequireAdmin,
                 body: axum::Json<crate::dto::role::UpdateRoleRequest>| async move {
                    roles::update(state, id, body).await
                },
            ),
        )
        .route(
            "/{id}",
            axum::routing::delete(
                |state: axum::extract::State<AppState>,
                 id: axum::extract::Path<i32>,
                 _admin: RequireAdmin| async move { roles::delete(state, id).await },
            ),
        )
}
