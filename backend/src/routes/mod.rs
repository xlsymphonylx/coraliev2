pub mod auth;
pub mod health;
pub mod roles;
pub mod users;

use axum::Router;

use crate::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .merge(health::router())
        .nest("/auth", auth::router())
        .nest("/users", users::router())
        .nest("/roles", roles::router())
}
