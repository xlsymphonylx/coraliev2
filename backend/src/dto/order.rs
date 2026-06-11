use serde::{Deserialize, Serialize};
use rust_decimal::Decimal;

#[derive(Debug, Serialize)]
pub struct OrderResponse {
    pub id: i32,
    pub user_id: Option<i32>,
    pub anon_name: Option<String>,
    pub status: String,
    pub total: Decimal,
    pub items: Vec<OrderItemResponse>,
    pub shipping_address_id: Option<i32>,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
pub struct OrderItemResponse {
    pub id: i32,
    pub product_id: i32,
    pub quantity: i32,
}

#[derive(Debug, Deserialize)]
pub struct CreateOrderRequest {
    pub items: Vec<CreateOrderItem>,
    pub anon_name: Option<String>,
    pub shipping_address_id: Option<i32>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateOrderItem {
    pub product_id: i32,
    pub quantity: i32,
}

#[derive(Debug, Deserialize)]
pub struct UpdateOrderStatusRequest {
    pub status: String,
}
