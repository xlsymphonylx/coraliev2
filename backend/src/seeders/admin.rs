use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set};

use crate::models::{role, user, user_role};

pub const NAME: &str = "admin user";

pub async fn seed(db: &DatabaseConnection) -> Result<(), String> {
    let existing = user::Entity::find()
        .filter(user::Column::Username.eq("admin"))
        .one(db)
        .await
        .map_err(|e| e.to_string())?;

    if existing.is_some() {
        return Err("already exists".into());
    }

    let admin_role = role::Entity::find()
        .filter(role::Column::Name.eq("admin"))
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("admin role not found — run migrations first")?;

    let password_hash = bcrypt::hash("AdminCoralie321", 10).map_err(|e| e.to_string())?;

    let admin = user::ActiveModel {
        username: Set("admin".into()),
        email: Set("admin@coralie.local".into()),
        password_hash: Set(password_hash),
        ..Default::default()
    }
    .insert(db)
    .await
    .map_err(|e| e.to_string())?;

    user_role::ActiveModel {
        user_id: Set(admin.id),
        role_id: Set(admin_role.id),
        ..Default::default()
    }
    .insert(db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}
