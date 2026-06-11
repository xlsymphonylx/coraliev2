use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct RoleResponse {
    pub id: i32,
    pub name: String,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateRoleRequest {
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateRoleRequest {
    pub name: Option<String>,
}
