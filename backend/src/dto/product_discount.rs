use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct ProductDiscountResponse {
    pub id: i32,
    pub product_id: i32,
    pub discount_percent: Decimal,
    pub active: bool,
    pub starts_at: Option<String>,
    pub ends_at: Option<String>,
    pub discount_set_id: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
pub struct CreateProductDiscountRequest {
    pub product_id: i32,
    pub discount_percent: Decimal,
    pub active: Option<bool>,
    pub starts_at: Option<String>,
    pub ends_at: Option<String>,
    pub discount_set_id: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProductDiscountRequest {
    pub discount_percent: Option<Decimal>,
    pub active: Option<bool>,
    pub starts_at: Option<String>,
    pub ends_at: Option<String>,
    pub discount_set_id: Option<Uuid>,
}
