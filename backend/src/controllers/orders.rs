use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use rust_decimal::Decimal;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, EntityTrait, ModelTrait, QueryFilter, QueryOrder, Set,
};

use crate::{
    dto::{
        common::ApiResponse,
        order::{CreateOrderRequest, OrderAddressInfo, OrderItemResponse, OrderResponse, OrderUserInfo, UpdateOrderStatusRequest},
    },
    models::{inventory, order, order_item, order_item::Entity as OrderItem, product},
    state::AppState,
    utils::auth::{AuthUser, RequireAdmin},
};

pub async fn create(
    State(state): State<AppState>,
    me: AuthUser,
    Json(body): Json<CreateOrderRequest>,
) -> Result<Json<ApiResponse<OrderResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    create_internal(state, Some(me.user_id), axum::Json(body)).await
}

pub async fn admin_create(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    body: CreateOrderRequest,
) -> Result<Json<ApiResponse<OrderResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    create_internal(state, None, axum::Json(body)).await
}

async fn create_internal(
    state: AppState,
    user_id: Option<i32>,
    Json(body): Json<CreateOrderRequest>,
) -> Result<Json<ApiResponse<OrderResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let mut total = Decimal::ZERO;
    let mut items_to_insert = Vec::new();

    for item in &body.items {
        let prod = product::Entity::find_by_id(item.product_id)
            .filter(product::Column::DeletedAt.is_null())
            .one(&state.db)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?
            .ok_or_else(|| {
                (
                    StatusCode::BAD_REQUEST,
                    Json(ApiResponse::error(
                        400,
                        format!("product {} not found", item.product_id),
                    )),
                )
            })?;

        let unit_price = prod.price;
        total += unit_price * Decimal::from(item.quantity);
        items_to_insert.push((item.product_id, item.quantity));

        // FIFO inventory deduction
        let batches = inventory::Entity::find()
            .filter(inventory::Column::ProductId.eq(item.product_id))
            .filter(inventory::Column::Quantity.gt(0))
            .filter(inventory::Column::DeletedAt.is_null())
            .filter(
                sea_orm::Condition::any()
                    .add(inventory::Column::ExpireDate.is_null())
                    .add(inventory::Column::ExpireDate.gt(chrono::Utc::now().naive_utc())),
            )
            .order_by(inventory::Column::EntryDate, sea_orm::Order::Asc)
            .order_by(inventory::Column::Id, sea_orm::Order::Asc)
            .all(&state.db)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?;

        let mut remaining = item.quantity;
        for batch in &batches {
            if remaining <= 0 {
                break;
            }
            let deduct = std::cmp::min(remaining, batch.quantity);
            remaining -= deduct;

            let mut active: inventory::ActiveModel = batch.clone().into();
            active.quantity = Set(batch.quantity - deduct);
            active.update(&state.db).await.map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::error(500, e.to_string())),
                )
            })?;
        }

        if remaining > 0 {
            return Err((
                StatusCode::CONFLICT,
                Json(ApiResponse::error(
                    409,
                    format!("insufficient stock for product {}", item.product_id),
                )),
            ));
        }
    }

    let ord = order::ActiveModel {
        user_id: Set(user_id),
        anon_name: Set(body.anon_name),
        anon_email: Set(body.anon_email),
        anon_phone: Set(body.anon_phone),
        status: Set("pending".into()),
        total: Set(total),
        shipping_address_id: Set(body.shipping_address_id),
        notes: Set(body.notes),
        ..Default::default()
    }
    .insert(&state.db)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    for (product_id, qty) in items_to_insert {
        let oi = order_item::ActiveModel {
            order_id: Set(ord.id),
            product_id: Set(product_id),
            quantity: Set(qty),
            ..Default::default()
        }
        .insert(&state.db)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string())))
        })?;
    }

    build_order_response(&state.db, ord).await
        .map(|r| Json(ApiResponse::ok(r)))
}

pub async fn list(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<OrderResponse>>>, (StatusCode, Json<ApiResponse<()>>)> {
    let orders = order::Entity::find()
        .filter(order::Column::DeletedAt.is_null())
        .all(&state.db)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?;

    let mut responses = Vec::new();
    for o in orders {
        responses.push(build_order_response(&state.db, o).await?);
    }
    Ok(Json(ApiResponse::ok(responses)))
}

pub async fn get(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<ApiResponse<OrderResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let ord = order::Entity::find_by_id(id)
        .filter(order::Column::DeletedAt.is_null())
        .one(&state.db)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?
        .ok_or_else(|| {
            (
                StatusCode::NOT_FOUND,
                Json(ApiResponse::error(404, "order not found".into())),
            )
        })?;

    Ok(Json(ApiResponse::ok(
        build_order_response(&state.db, ord).await?,
    )))
}

pub async fn update_status(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(body): Json<UpdateOrderStatusRequest>,
) -> Result<Json<ApiResponse<OrderResponse>>, (StatusCode, Json<ApiResponse<()>>)> {
    let ord = order::Entity::find_by_id(id)
        .filter(order::Column::DeletedAt.is_null())
        .one(&state.db)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(500, e.to_string())),
            )
        })?
        .ok_or_else(|| {
            (
                StatusCode::NOT_FOUND,
                Json(ApiResponse::error(404, "order not found".into())),
            )
        })?;

    let mut active: order::ActiveModel = ord.into();
    active.status = Set(body.status);
    let updated = active.update(&state.db).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::error(500, e.to_string())),
        )
    })?;

    Ok(Json(ApiResponse::ok(
        build_order_response(&state.db, updated).await?,
    )))
}

async fn build_order_response(
    db: &sea_orm::DatabaseConnection,
    o: order::Model,
) -> Result<OrderResponse, (StatusCode, Json<ApiResponse<()>>)> {
    let items = o.find_related(OrderItem).all(db).await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string())))
    })?;

    // Fetch user info if linked to a registered user
    let user = if let Some(uid) = o.user_id {
        let u = crate::models::user::Entity::find_by_id(uid)
            .one(db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;
        u.map(|u| OrderUserInfo {
            id: u.id,
            username: u.username,
            email: u.email,
            phone: u.phone,
        })
    } else {
        None
    };

    // Fetch shipping address
    let address = if let Some(aid) = o.shipping_address_id {
        let a = crate::models::address::Entity::find_by_id(aid)
            .one(db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::error(500, e.to_string()))))?;
        a.map(|a| OrderAddressInfo {
            id: a.id,
            label: a.label,
            line1: a.line1,
            line2: a.line2,
            city: a.city,
            state: a.state,
        })
    } else {
        None
    };

    Ok(OrderResponse {
        id: o.id,
        user_id: o.user_id,
        user,
        shipping_address: address,
        anon_name: o.anon_name,
        anon_email: o.anon_email,
        anon_phone: o.anon_phone,
        status: o.status,
        total: o.total,
        items: items
            .into_iter()
            .map(|i| OrderItemResponse {
                id: i.id,
                product_id: i.product_id,
                quantity: i.quantity,
            })
            .collect(),
        shipping_address_id: o.shipping_address_id,
        notes: o.notes,
        created_at: o.created_at.to_rfc3339(),
        updated_at: o.updated_at.to_rfc3339(),
    })
}
