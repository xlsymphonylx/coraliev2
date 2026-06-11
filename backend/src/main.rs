use axum::Router;
use tokio::net::TcpListener;

use backend::{
    routes,
    state::{AppState, config::Config, db},
};

#[tokio::main]
async fn main() {
    let config = Config::env();
    let db = db::connect().await.expect("Failed to connect to database");

    let state = AppState { db };

    let app = Router::new().merge(routes::router()).with_state(state);

    let listener = TcpListener::bind(format!("0.0.0.0:{}", config.port))
        .await
        .unwrap();

    axum::serve(listener, app).await.unwrap();
}
