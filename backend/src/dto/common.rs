use serde::Serialize;

#[derive(Serialize)]
pub struct ApiResponse<T: Serialize> {
    pub status: u16,
    pub message: String,
    pub data: Option<T>,
}

impl<T: Serialize> ApiResponse<T> {
    pub fn ok(data: T) -> Self {
        Self {
            status: 200,
            message: "ok".to_string(),
            data: Some(data),
        }
    }

    pub fn error(status: u16, message: String) -> Self {
        Self {
            status,
            message,
            data: None,
        }
    }
}
