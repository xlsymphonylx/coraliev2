pub mod addresses;
pub mod auth;
pub mod categories;
pub mod health;
pub mod inventory;
pub mod orders;
pub mod products;
pub mod roles;
pub mod tags;
pub mod users;

use axum::Router;

use crate::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .merge(health::router())
        .nest("/auth", auth::router())
        .nest("/users", users::router())
        .nest("/roles", roles::router())
        .nest("/products", products::router())
        .nest("/categories", categories::router())
        .nest("/tags", tags::router())
        .nest("/orders", orders::router())
        .nest("/addresses", addresses::router())
        .nest("/inventory", inventory::router())
}
