use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct StorageUnitResponse {
    pub id: i32,
    pub warehouse_id: i32,
    pub code: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateStorageUnitRequest {
    pub warehouse_id: i32,
    pub code: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStorageUnitRequest {
    pub code: Option<String>,
}
