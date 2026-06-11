use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct WarehouseResponse {
    pub id: i32,
    pub name: String,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateWarehouseRequest {
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateWarehouseRequest {
    pub name: Option<String>,
}
