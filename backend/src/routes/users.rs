use axum::{Router, routing::{get, post}};

use crate::{controllers::users, state::AppState, utils::auth::RequireAdmin};

pub fn router() -> Router<AppState> {
    Router::new()
        .route(
            "/",
            get({
                |state: axum::extract::State<AppState>, _admin: RequireAdmin| async move {
                    users::list(state).await
                }
            }),
        )
        .route(
            "/",
            post({
                |state: axum::extract::State<AppState>,
                 _admin: RequireAdmin,
                 body: axum::Json<crate::dto::user::CreateUserRequest>| async move {
                    users::create(state, body).await
                }
            }),
        )
        .route(
            "/{id}",
            get({
                |state: axum::extract::State<AppState>,
                 id: axum::extract::Path<i32>,
                 _admin: RequireAdmin| async move { users::get(state, id).await }
            }),
        )
        .route(
            "/{id}",
            axum::routing::patch(
                |state: axum::extract::State<AppState>,
                 id: axum::extract::Path<i32>,
                 _admin: RequireAdmin,
                 body: axum::Json<crate::dto::user::UpdateUserRequest>| async move {
                    users::update(state, id, body).await
                },
            ),
        )
        .route(
            "/{id}",
            axum::routing::delete(
                |state: axum::extract::State<AppState>,
                 id: axum::extract::Path<i32>,
                 _admin: RequireAdmin| async move { users::delete(state, id).await },
            ),
        )
}
