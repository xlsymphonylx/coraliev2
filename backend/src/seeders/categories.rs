use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set};

use crate::models::category;

pub const NAME: &str = "categories";

pub async fn seed(db: &DatabaseConnection) -> Result<(), String> {
    let existing = category::Entity::find()
        .filter(category::Column::Name.eq("Desde Corea"))
        .one(db)
        .await
        .map_err(|e| e.to_string())?;

    if existing.is_some() {
        return Err("already exists".into());
    }

    let categories = [
        ("Desde Corea", "desde-corea", None),
        ("Maquillaje", "maquillaje", None),
        ("Skincare", "skincare", None),
        ("Cabello", "cabello", None),
        ("Fragancias", "fragancias", None),
        ("Herramientas y Brochas", "herramientas-y-brochas", None),
        ("Cuerpo y Baño", "cuerpo-y-bano", None),
        ("Tamaño Mini", "tamano-mini", None),
        ("Regalos y Sets", "regalos-y-sets", None),
    ];

    for (name, slug, description) in &categories {
        category::ActiveModel {
            name: Set(name.to_string()),
            slug: Set(slug.to_string()),
            description: Set(description.clone()),
            ..Default::default()
        }
        .insert(db)
        .await
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}
