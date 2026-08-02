use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "showcase_settings")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub discount: String,
    pub title: String,
    pub subtitle: String,
    pub button_text: String,
    pub button_link: String,
    pub example_image_1: String,
    pub example_image_2: String,
    pub product_image: String,
    pub product_category: String,
    pub product_category_link: String,
    pub product_title: String,
    pub product_price: String,
    pub updated_at: DateTimeUtc,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
