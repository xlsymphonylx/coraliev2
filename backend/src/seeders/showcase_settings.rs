use sea_orm::{ActiveModelTrait, DatabaseConnection, EntityTrait, Set};

use crate::models::showcase_setting;

pub const NAME: &str = "showcase_settings";

pub async fn seed(db: &DatabaseConnection) -> Result<(), String> {
    let existing = showcase_setting::Entity::find_by_id(1)
        .one(db)
        .await
        .map_err(|e| e.to_string())?;

    if existing.is_some() {
        return Err("already exists".into());
    }

    showcase_setting::ActiveModel {
        id: Set(1),
        discount: Set("2% OFF".into()),
        title: Set("Labios atrevidos, atrevida tú".into()),
        subtitle: Set("¡Descubre nuestra nueva colección de delineador labiales con un 2% de descuento!".into()),
        button_text: Set("Compra Ahora".into()),
        button_link: Set("https://coraliegtm.com/products/rhode-peptide-lip-shape".into()),
        example_image_1: Set("/showcase-example-1.jpg".into()),
        example_image_2: Set("/showcase-example-2.png".into()),
        product_image: Set("/showcase-product.jpg".into()),
        product_category: Set("Skin Care".into()),
        product_category_link: Set("https://coraliegtm.com/collections/skincare".into()),
        product_title: Set("ANUA Heartleaf Pore Control Cleansing Oil".into()),
        product_price: Set("Q250.00".into()),
        ..Default::default()
    }
    .insert(db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}
