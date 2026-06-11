use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use sea_orm::{ActiveModelTrait, EntityTrait, Set};

use crate::{
    dto::{
        category::{CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest},
        common::ApiResponse,
    },
    models::category,
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
) -> Result<Json<ApiResponse<Vec<CategoryResponse>>>, (StatusCode, Json<ApiResponse<()>>)> {
    let categories = category::Entity::find()
        .all(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;

    let resp: Vec<CategoryResponse> = categories
        .into_iter()
        .map(|c| CategoryResponse {
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            parent_id: c.parent_id,
            created_at: c.created_at.to_rfc3339(),
        })
        .collect();

    Ok(Json(ApiResponse::ok(resp)))
}

pub async fn create(
    State(state): State<AppState>,
    Json(body): Json<CreateCategoryRequest>,
) -> Result<Json<ApiResponse<CategoryResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let slug = body.slug.unwrap_or_else(|| slugify(&body.name));

    let cat = category::ActiveModel {
        name: Set(body.name),
        slug: Set(slug),
        description: Set(body.description),
        parent_id: Set(body.parent_id),
        ..Default::default()
    }
    .insert(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;

    Ok(Json(ApiResponse::ok(CategoryResponse {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        parent_id: cat.parent_id,
        created_at: cat.created_at.to_rfc3339(),
    })))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(body): Json<UpdateCategoryRequest>,
) -> Result<Json<ApiResponse<CategoryResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let cat = category::Entity::find_by_id(id)
        .one(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?
        .ok_or_else(|| (StatusCode::NOT_FOUND, Json(ApiResponse::error(404, "category not found".into()))))?;

    let mut active: category::ActiveModel = cat.into();

    if let Some(name) = body.name { active.name = Set(name); }
    if let Some(slug) = body.slug { active.slug = Set(slug); }
    if let Some(desc) = body.description { active.description = Set(Some(desc)); }
    if let Some(pid) = body.parent_id { active.parent_id = Set(Some(pid)); }

    let updated = active.update(&state.db).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;

    Ok(Json(ApiResponse::ok(CategoryResponse {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        parent_id: updated.parent_id,
        created_at: updated.created_at.to_rfc3339(),
    })))
}

pub async fn delete(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<ApiResponse<()>>)> {
    let result = category::Entity::delete_by_id(id)
        .exec(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;

    if result.rows_affected == 0 {
        return Err((StatusCode::NOT_FOUND, Json(ApiResponse::error(404, "category not found".into()))));
    }

    Ok(Json(ApiResponse::ok(())))
}
