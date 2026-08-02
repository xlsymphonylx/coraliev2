use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct ShowcaseSettingResponse {
    pub id: i32,
    pub discount: String,
    pub title: String,
    pub subtitle: String,
    pub button_text: String,
    pub button_link: String,
    pub example_image_1: String,
    pub example_image_2: String,
    pub product_image: String,
    pub product_category: String,
    pub product_category_link: String,
    pub product_title: String,
    pub product_price: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateShowcaseSettingRequest {
    pub discount: Option<String>,
    pub title: Option<String>,
    pub subtitle: Option<String>,
    pub button_text: Option<String>,
    pub button_link: Option<String>,
    pub example_image_1: Option<String>,
    pub example_image_2: Option<String>,
    pub product_image: Option<String>,
    pub product_category: Option<String>,
    pub product_category_link: Option<String>,
    pub product_title: Option<String>,
    pub product_price: Option<String>,
}
