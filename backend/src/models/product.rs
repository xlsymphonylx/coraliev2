use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "products")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    #[sea_orm(column_type = "Decimal(Some((10, 2)))")]
    pub price: Decimal,
    #[sea_orm(column_name = "type")]
    pub product_type: String,
    pub category_id: Option<i32>,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::category::Entity",
        from = "Column::CategoryId",
        to = "super::category::Column::Id"
    )]
    Category,
    #[sea_orm(has_many = "super::product_image::Entity")]
    ProductImage,
    #[sea_orm(has_many = "super::product_tag::Entity")]
    ProductTag,
    #[sea_orm(has_many = "super::product_discount::Entity")]
    ProductDiscount,
    #[sea_orm(has_many = "super::bundle_item::Entity")]
    BundleItem,
}

impl Related<super::product_image::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ProductImage.def()
    }
}

impl Related<super::product_tag::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ProductTag.def()
    }
}

impl Related<super::product_discount::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ProductDiscount.def()
    }
}

impl Related<super::tag::Entity> for Entity {
    fn to() -> RelationDef {
        super::product_tag::Relation::Tag.def()
    }

    fn via() -> Option<RelationDef> {
        Some(super::product_tag::Relation::Product.def().rev())
    }
}

impl Related<super::category::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Category.def()
    }
}

impl Related<super::bundle_item::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::BundleItem.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
