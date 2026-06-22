pub mod addresses;
pub mod auth;
pub mod bundle_items;
pub mod categories;
pub mod coupons;
pub mod discount_sets;
pub mod health;
pub mod inventory;
pub mod orders;
pub mod product_discounts;
pub mod product_images;
pub mod products;
pub mod roles;
pub mod storage_units;
pub mod tags;
pub mod users;
pub mod volume_discounts;
pub mod warehouses;

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
        .nest("/warehouses", warehouses::router())
        .nest("/storage-units", storage_units::router())
        .nest("/product-images", product_images::router())
        .nest("/product-discounts", product_discounts::router())
        .nest("/volume-discounts", volume_discounts::router())
        .nest("/bundle-items", bundle_items::router())
        .nest("/coupons", coupons::router())
        .nest("/discount-sets", discount_sets::router())
}
