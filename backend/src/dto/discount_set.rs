use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct DiscountSetResponse {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub active: Option<bool>,
    pub starts_at: Option<String>,
    pub ends_at: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateDiscountSetRequest {
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub active: Option<bool>,
    pub starts_at: Option<String>,
    pub ends_at: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateDiscountSetRequest {
    pub name: Option<String>,
    pub slug: Option<String>,
    pub description: Option<String>,
    pub active: Option<bool>,
    pub starts_at: Option<String>,
    pub ends_at: Option<String>,
}
