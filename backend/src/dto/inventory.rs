use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct InventoryResponse {
    pub id: i32,
    pub product_id: i32,
    pub storage_unit_id: i32,
    pub batch_code: Option<String>,
    pub quantity: i32,
    pub low_stock_threshold: i32,
    pub entry_date: String,
    pub expire_date: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateInventoryRequest {
    pub product_id: i32,
    pub storage_unit_id: i32,
    pub batch_code: Option<String>,
    pub quantity: i32,
    pub low_stock_threshold: Option<i32>,
    pub expire_date: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateInventoryRequest {
    pub quantity: Option<i32>,
    pub low_stock_threshold: Option<i32>,
}
