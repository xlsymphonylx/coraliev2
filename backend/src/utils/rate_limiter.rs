use std::{
    collections::HashMap,
    net::IpAddr,
    sync::{Arc, Mutex},
    time::Instant,
};

use axum::{
    extract::{ConnectInfo, Request},
    http::StatusCode,
    middleware::Next,
    response::Json,
};

use crate::dto::common::ApiResponse;

pub struct RateLimiter {
    window: std::time::Duration,
    max_requests: usize,
    attempts: Mutex<HashMap<IpAddr, Vec<Instant>>>,
}

impl RateLimiter {
    pub fn new(max_requests: usize, per_window: std::time::Duration) -> Self {
        Self {
            window: per_window,
            max_requests,
            attempts: Mutex::new(HashMap::new()),
        }
    }
}

impl Clone for RateLimiter {
    fn clone(&self) -> Self {
        Self {
            window: self.window,
            max_requests: self.max_requests,
            attempts: Mutex::new(HashMap::new()),
        }
    }
}

pub async fn login_rate_limit(
    ConnectInfo(addr): ConnectInfo<std::net::SocketAddr>,
    limiter: axum::extract::State<Arc<RateLimiter>>,
    request: Request,
    next: Next,
) -> Result<axum::response::Response, (StatusCode, Json<ApiResponse<()>>)> {
    let ip = addr.ip();
    let now = Instant::now();
    let cutoff = now - limiter.window;

    {
        let mut map = limiter.attempts.lock().unwrap();
        let entry = map.entry(ip).or_default();
        entry.retain(|t| *t > cutoff);
        entry.push(now);

        if entry.len() > limiter.max_requests {
            return Err((
                StatusCode::TOO_MANY_REQUESTS,
                Json(ApiResponse::error(429, "too many requests, slow down".into())),
            ));
        }
    }

    Ok(next.run(request).await)
}
