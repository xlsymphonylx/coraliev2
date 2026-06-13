use axum::Router;
use tokio::net::TcpListener;
use tower_http::cors::{CorsLayer, Any};

use backend::{
    routes,
    state::{AppState, config::Config, db},
};

#[tokio::main]
async fn main() {
    let config = Config::env();
    let db = db::connect().await.expect("Failed to connect to database");

    let state = AppState {
        db,
        jwt_secret: config.jwt_secret,
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .merge(routes::router())
        .layer(cors)
        .with_state(state);

    let listener = TcpListener::bind(format!("0.0.0.0:{}", config.port))
        .await
        .unwrap();

    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<std::net::SocketAddr>(),
    )
    .await
    .unwrap();
}
