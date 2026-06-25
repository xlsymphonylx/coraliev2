use sea_orm::{ActiveModelTrait, DatabaseConnection, EntityTrait, Set};

use crate::models::promo_setting;

pub const NAME: &str = "promo_settings";

pub async fn seed(db: &DatabaseConnection) -> Result<(), String> {
    let existing = promo_setting::Entity::find_by_id(1)
        .one(db)
        .await
        .map_err(|e| e.to_string())?;

    if existing.is_some() {
        return Err("already exists".into());
    }

    promo_setting::ActiveModel {
        id: Set(1),
        title: Set("Descubre la esencia de Coralie".into()),
        subtitle: Set("Productos Originales a Precios Justos".into()),
        background_color: Set("#fad4da".into()),
        title_color: Set("#18151a".into()),
        subtitle_color: Set("#6a5a62".into()),
        image: Set("/banner.webp".into()),
        ..Default::default()
    }
    .insert(db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}
