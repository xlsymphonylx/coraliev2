use serde::{Deserialize, Serialize};

use crate::models::role;

#[derive(Debug, Deserialize)]
pub struct SignupRequest {
    pub username: String,
    pub email: String,
    pub phone: Option<String>,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct AdminSignupRequest {
    pub username: String,
    pub email: String,
    pub password: String,
    pub role_id: i32,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct UserInfo {
    pub id: i32,
    pub username: String,
    pub email: String,
    pub roles: Vec<RoleInfo>,
}

#[derive(Debug, Serialize)]
pub struct RoleInfo {
    pub id: i32,
    pub name: String,
}

impl From<role::Model> for RoleInfo {
    fn from(r: role::Model) -> Self {
        RoleInfo {
            id: r.id,
            name: r.name,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserInfo,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProfileRequest {
    pub username: Option<String>,
    pub email: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ChangePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}
