use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};

use crate::{
    dto::{
        common::ApiResponse,
        tag::{CreateTagRequest, TagResponse},
    },
    models::tag,
    state::AppState,
};

fn slugify(s: &str) -> String {
    s.to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' { c } else { ' ' })
        .collect::<String>()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join("-")
}

pub async fn list(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<TagResponse>>>, (StatusCode, Json<ApiResponse<()>>)> {
    let tags = tag::Entity::find()
        .filter(tag::Column::DeletedAt.is_null())
        .all(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;

    let resp: Vec<TagResponse> = tags
        .into_iter()
        .map(|t| TagResponse {
            id: t.id,
            name: t.name,
            slug: t.slug,
            created_at: t.created_at.to_rfc3339(),
        })
        .collect();

    Ok(Json(ApiResponse::ok(resp)))
}

pub async fn create(
    State(state): State<AppState>,
    Json(body): Json<CreateTagRequest>,
) -> Result<Json<ApiResponse<TagResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let slug = body.slug.unwrap_or_else(|| slugify(&body.name));

    let t = tag::ActiveModel {
        name: Set(body.name),
        slug: Set(slug),
        ..Default::default()
    }
    .insert(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;

    Ok(Json(ApiResponse::ok(TagResponse {
        id: t.id,
        name: t.name,
        slug: t.slug,
        created_at: t.created_at.to_rfc3339(),
    })))
}

pub async fn delete(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let t = tag::Entity::find_by_id(id)
        .filter(tag::Column::DeletedAt.is_null())
        .one(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?
        .ok_or_else(|| (StatusCode::NOT_FOUND, Json(ApiResponse::error(404, "tag not found".into()))))?;

    let mut active: tag::ActiveModel = t.into();
    active.deleted_at = Set(Some(Utc::now()));
    active.update(&state.db).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;

    Ok(Json(ApiResponse::ok(())))
}
