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
        promo_setting::{PromoSettingResponse, UpdatePromoSettingRequest},
    },
    models::promo_setting,
    state::AppState,
};

pub async fn get(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<PromoSettingResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let setting = promo_setting::Entity::find_by_id(1)
        .one(&state.db)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;

    match setting {
        Some(s) => Ok(Json(ApiResponse::ok(PromoSettingResponse {
            id: s.id,
            title: s.title,
            subtitle: s.subtitle,
            background_color: s.background_color,
            title_color: s.title_color,
            subtitle_color: s.subtitle_color,
            image: s.image,
            updated_at: s.updated_at.to_rfc3339(),
        }))),
        None => Ok(Json(ApiResponse::ok(PromoSettingResponse {
            id: 1,
            title: "Descubre la esencia de Coralie".into(),
            subtitle: "Productos Originales a Precios Justos".into(),
            background_color: "#fad4da".into(),
            title_color: "#18151a".into(),
            subtitle_color: "#6a5a62".into(),
            image: "/banner.webp".into(),
            updated_at: Utc::now().to_rfc3339(),
        }))),
    }
}

pub async fn update(
    State(state): State<AppState>,
    Json(body): Json<UpdatePromoSettingRequest>,
) -> Result<Json<ApiResponse<PromoSettingResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let setting = promo_setting::Entity::find_by_id(1)
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
        let mut active: promo_setting::ActiveModel = existing.clone().into();
        if let Some(title) = body.title {
            active.title = Set(title);
        }
        if let Some(subtitle) = body.subtitle {
            active.subtitle = Set(subtitle);
        }
        if let Some(bg) = body.background_color {
            active.background_color = Set(bg);
        }
        if let Some(image) = body.image {
            active.image = Set(image);
        }
        if let Some(tc) = body.title_color {
            active.title_color = Set(tc);
        }
        if let Some(sc) = body.subtitle_color {
            active.subtitle_color = Set(sc);
        }
        active.updated_at = Set(Utc::now());
        active
    } else {
        promo_setting::ActiveModel {
            id: Set(1),
            title: Set(body.title.unwrap_or_else(|| "Descubre la esencia de Coralie".into())),
            subtitle: Set(body.subtitle.unwrap_or_else(|| "Productos Originales a Precios Justos".into())),
            background_color: Set(body.background_color.unwrap_or_else(|| "#fad4da".into())),
            title_color: Set(body.title_color.unwrap_or_else(|| "#18151a".into())),
            subtitle_color: Set(body.subtitle_color.unwrap_or_else(|| "#6a5a62".into())),
            image: Set(body.image.unwrap_or_else(|| "/banner.webp".into())),
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

    Ok(Json(ApiResponse::ok(PromoSettingResponse {
        id: updated.id,
        title: updated.title,
        subtitle: updated.subtitle,
        background_color: updated.background_color,
        title_color: updated.title_color,
        subtitle_color: updated.subtitle_color,
        image: updated.image,
        updated_at: updated.updated_at.to_rfc3339(),
    })))
}
