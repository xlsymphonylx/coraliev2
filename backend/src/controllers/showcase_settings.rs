use axum::{
    Json,
    extract::State,
    http::StatusCode,
};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};

use crate::{
    dto::{
        common::ApiResponse,
        showcase_setting::{ShowcaseSettingResponse, UpdateShowcaseSettingRequest},
    },
    models::showcase_setting,
    state::AppState,
};

pub async fn get(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<ShowcaseSettingResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let setting = showcase_setting::Entity::find_by_id(1)
        .one(&state.db)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;

    match setting {
        Some(s) => Ok(Json(ApiResponse::ok(ShowcaseSettingResponse {
            id: s.id,
            discount: s.discount,
            title: s.title,
            subtitle: s.subtitle,
            button_text: s.button_text,
            button_link: s.button_link,
            example_image_1: s.example_image_1,
            example_image_2: s.example_image_2,
            product_image: s.product_image,
            product_category: s.product_category,
            product_category_link: s.product_category_link,
            product_title: s.product_title,
            product_price: s.product_price,
            updated_at: s.updated_at.to_rfc3339(),
        }))),
        None => Ok(Json(ApiResponse::ok(ShowcaseSettingResponse {
            id: 1,
            discount: "2% OFF".into(),
            title: "Labios atrevidos, atrevida tú".into(),
            subtitle: "¡Descubre nuestra nueva colección de delineador labiales con un 2% de descuento!".into(),
            button_text: "Compra Ahora".into(),
            button_link: "https://coraliegtm.com/products/rhode-peptide-lip-shape".into(),
            example_image_1: "/showcase-example-1.jpg".into(),
            example_image_2: "/showcase-example-2.png".into(),
            product_image: "/showcase-product.jpg".into(),
            product_category: "Skin Care".into(),
            product_category_link: "https://coraliegtm.com/collections/skincare".into(),
            product_title: "ANUA Heartleaf Pore Control Cleansing Oil".into(),
            product_price: "Q250.00".into(),
            updated_at: Utc::now().to_rfc3339(),
        }))),
    }
}

pub async fn update(
    State(state): State<AppState>,
    Json(body): Json<UpdateShowcaseSettingRequest>,
) -> Result<Json<ApiResponse<ShowcaseSettingResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let setting = showcase_setting::Entity::find_by_id(1)
        .one(&state.db)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;

    let exists = setting.is_some();

    let active = if let Some(ref existing) = setting {
        let mut active: showcase_setting::ActiveModel = existing.clone().into();
        if let Some(v) = body.discount { active.discount = Set(v); }
        if let Some(v) = body.title { active.title = Set(v); }
        if let Some(v) = body.subtitle { active.subtitle = Set(v); }
        if let Some(v) = body.button_text { active.button_text = Set(v); }
        if let Some(v) = body.button_link { active.button_link = Set(v); }
        if let Some(v) = body.example_image_1 { active.example_image_1 = Set(v); }
        if let Some(v) = body.example_image_2 { active.example_image_2 = Set(v); }
        if let Some(v) = body.product_image { active.product_image = Set(v); }
        if let Some(v) = body.product_category { active.product_category = Set(v); }
        if let Some(v) = body.product_category_link { active.product_category_link = Set(v); }
        if let Some(v) = body.product_title { active.product_title = Set(v); }
        if let Some(v) = body.product_price { active.product_price = Set(v); }
        active.updated_at = Set(Utc::now());
        active
    } else {
        showcase_setting::ActiveModel {
            id: Set(1),
            discount: Set(body.discount.unwrap_or_else(|| "2% OFF".into())),
            title: Set(body.title.unwrap_or_else(|| "Labios atrevidos, atrevida tú".into())),
            subtitle: Set(body.subtitle.unwrap_or_else(|| "¡Descubre nuestra nueva colección de delineador labiales con un 2% de descuento!".into())),
            button_text: Set(body.button_text.unwrap_or_else(|| "Compra Ahora".into())),
            button_link: Set(body.button_link.unwrap_or_else(|| "https://coraliegtm.com/products/rhode-peptide-lip-shape".into())),
            example_image_1: Set(body.example_image_1.unwrap_or_else(|| "/showcase-example-1.jpg".into())),
            example_image_2: Set(body.example_image_2.unwrap_or_else(|| "/showcase-example-2.png".into())),
            product_image: Set(body.product_image.unwrap_or_else(|| "/showcase-product.jpg".into())),
            product_category: Set(body.product_category.unwrap_or_else(|| "Skin Care".into())),
            product_category_link: Set(body.product_category_link.unwrap_or_else(|| "https://coraliegtm.com/collections/skincare".into())),
            product_title: Set(body.product_title.unwrap_or_else(|| "ANUA Heartleaf Pore Control Cleansing Oil".into())),
            product_price: Set(body.product_price.unwrap_or_else(|| "Q250.00".into())),
            updated_at: Set(Utc::now()),
        }
    };

    let updated = if exists {
        active.update(&state.db).await.map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?
    } else {
        active.insert(&state.db).await.map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?
    };

    Ok(Json(ApiResponse::ok(ShowcaseSettingResponse {
        id: updated.id,
        discount: updated.discount,
        title: updated.title,
        subtitle: updated.subtitle,
        button_text: updated.button_text,
        button_link: updated.button_link,
        example_image_1: updated.example_image_1,
        example_image_2: updated.example_image_2,
        product_image: updated.product_image,
        product_category: updated.product_category,
        product_category_link: updated.product_category_link,
        product_title: updated.product_title,
        product_price: updated.product_price,
        updated_at: updated.updated_at.to_rfc3339(),
    })))
}
