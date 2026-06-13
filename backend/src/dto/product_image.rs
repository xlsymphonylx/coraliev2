use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct ImageResponse {
    pub id: i32,
    pub product_id: i32,
    pub url: String,
    pub alt: Option<String>,
    pub sort_order: i32,
}

#[derive(Debug, Deserialize)]
pub struct CreateImageRequest {
    pub product_id: i32,
    pub url: String,
    pub alt: Option<String>,
    pub sort_order: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateImageRequest {
    pub url: Option<String>,
    pub alt: Option<String>,
    pub sort_order: Option<i32>,
}
