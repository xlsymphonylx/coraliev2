use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct PromoSettingResponse {
    pub id: i32,
    pub title: String,
    pub subtitle: String,
    pub background_color: String,
    pub title_color: String,
    pub subtitle_color: String,
    pub image: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePromoSettingRequest {
    pub title: Option<String>,
    pub subtitle: Option<String>,
    pub background_color: Option<String>,
    pub title_color: Option<String>,
    pub subtitle_color: Option<String>,
    pub image: Option<String>,
}
