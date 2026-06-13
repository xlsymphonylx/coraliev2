use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct BundleItemResponse {
    pub id: i32,
    pub bundle_id: i32,
    pub product_id: i32,
    pub quantity: i32,
    pub sort_order: i32,
}

#[derive(Debug, Deserialize)]
pub struct CreateBundleItemRequest {
    pub bundle_id: i32,
    pub product_id: i32,
    pub quantity: Option<i32>,
    pub sort_order: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateBundleItemRequest {
    pub product_id: Option<i32>,
    pub quantity: Option<i32>,
    pub sort_order: Option<i32>,
}
