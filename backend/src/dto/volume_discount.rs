use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct VolumeDiscountResponse {
    pub id: i32,
    pub product_id: Option<i32>,
    pub min_quantity: i32,
    pub discount_percent: Decimal,
    pub description: Option<String>,
    pub starts_at: Option<String>,
    pub ends_at: Option<String>,
    pub active: Option<bool>,
    pub discount_set_id: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
pub struct CreateVolumeDiscountRequest {
    pub product_id: Option<i32>,
    pub min_quantity: i32,
    pub discount_percent: Decimal,
    pub description: Option<String>,
    pub starts_at: Option<String>,
    pub ends_at: Option<String>,
    pub active: Option<bool>,
    pub discount_set_id: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateVolumeDiscountRequest {
    pub min_quantity: Option<i32>,
    pub discount_percent: Option<Decimal>,
    pub description: Option<String>,
    pub starts_at: Option<String>,
    pub ends_at: Option<String>,
    pub active: Option<bool>,
    pub discount_set_id: Option<Uuid>,
}
