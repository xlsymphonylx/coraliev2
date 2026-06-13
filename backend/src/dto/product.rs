use serde::{Deserialize, Serialize};
use rust_decimal::Decimal;

use crate::dto::category::CategorySummary;
use crate::models::tag;

#[derive(Debug, Serialize)]
pub struct ProductResponse {
    pub id: i32,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub price: Decimal,
    pub product_type: String,
    pub barcode: Option<String>,
    pub category: Option<CategorySummary>,
    pub tags: Vec<TagSummary>,
    pub images: Vec<ImageResponse>,
    pub discounts: Vec<DiscountResponse>,
    pub bundle_items: Vec<BundleItemResponse>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
pub struct TagSummary {
    pub id: i32,
    pub name: String,
    pub slug: String,
}

impl From<tag::Model> for TagSummary {
    fn from(t: tag::Model) -> Self {
        TagSummary { id: t.id, name: t.name, slug: t.slug }
    }
}

#[derive(Debug, Serialize)]
pub struct ImageResponse {
    pub id: i32,
    pub url: String,
    pub alt: Option<String>,
    pub sort_order: i32,
}

#[derive(Debug, Serialize)]
pub struct DiscountResponse {
    pub id: i32,
    pub discount_percent: Decimal,
    pub active: bool,
    pub starts_at: Option<String>,
    pub ends_at: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct BundleItemResponse {
    pub id: i32,
    pub product_id: i32,
    pub quantity: i32,
    pub sort_order: i32,
}

#[derive(Debug, Deserialize)]
pub struct CreateProductRequest {
    pub name: String,
    pub slug: Option<String>,
    pub description: Option<String>,
    pub price: Decimal,
    pub product_type: Option<String>,
    pub category_id: Option<i32>,
    pub barcode: Option<String>,
    pub tag_ids: Option<Vec<i32>>,
    pub images: Option<Vec<CreateImageRequest>>,
    pub bundle_items: Option<Vec<CreateBundleItemRequest>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProductRequest {
    pub name: Option<String>,
    pub slug: Option<String>,
    pub description: Option<String>,
    pub price: Option<Decimal>,
    pub product_type: Option<String>,
    pub category_id: Option<i32>,
    pub barcode: Option<String>,
    pub tag_ids: Option<Vec<i32>>,
    pub images: Option<Vec<CreateImageRequest>>,
    pub bundle_items: Option<Vec<CreateBundleItemRequest>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateImageRequest {
    pub url: String,
    pub alt: Option<String>,
    pub sort_order: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct CreateBundleItemRequest {
    pub product_id: i32,
    pub quantity: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct ProductQuery {
    pub category_id: Option<i32>,
    pub tag_id: Option<i32>,
    pub product_type: Option<String>,
    pub search: Option<String>,
    pub barcode: Option<String>,
}
