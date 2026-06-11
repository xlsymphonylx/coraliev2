use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct AddressResponse {
    pub id: i32,
    pub user_id: Option<i32>,
    pub label: String,
    pub line1: String,
    pub line2: Option<String>,
    pub city: String,
    pub state: String,
    pub is_default: bool,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateAddressRequest {
    pub label: String,
    pub line1: String,
    pub line2: Option<String>,
    pub city: String,
    pub state: String,
    pub is_default: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateAddressRequest {
    pub label: Option<String>,
    pub line1: Option<String>,
    pub line2: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub is_default: Option<bool>,
}
