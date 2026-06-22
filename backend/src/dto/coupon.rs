use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct CouponResponse {
    pub id: i32,
    pub code: String,
    pub discount_type: String,
    pub discount_value: Decimal,
    pub min_purchase: Option<Decimal>,
    pub max_uses: Option<i32>,
    pub current_uses: Option<i32>,
    pub starts_at: Option<String>,
    pub ends_at: Option<String>,
    pub active: Option<bool>,
    pub discount_set_id: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
pub struct CreateCouponRequest {
    pub code: String,
    pub discount_type: String,
    pub discount_value: Decimal,
    pub min_purchase: Option<Decimal>,
    pub max_uses: Option<i32>,
    pub starts_at: Option<String>,
    pub ends_at: Option<String>,
    pub active: Option<bool>,
    pub discount_set_id: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCouponRequest {
    pub code: Option<String>,
    pub discount_type: Option<String>,
    pub discount_value: Option<Decimal>,
    pub min_purchase: Option<Decimal>,
    pub max_uses: Option<i32>,
    pub starts_at: Option<String>,
    pub ends_at: Option<String>,
    pub active: Option<bool>,
    pub discount_set_id: Option<Uuid>,
}
