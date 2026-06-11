use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "tags")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
    pub slug: String,
    pub created_at: DateTimeUtc,
    pub deleted_at: Option<DateTimeUtc>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::product_tag::Entity")]
    ProductTag,
}

impl Related<super::product_tag::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ProductTag.def()
    }
}

impl Related<super::product::Entity> for Entity {
    fn to() -> RelationDef {
        super::product_tag::Relation::Product.def()
    }

    fn via() -> Option<RelationDef> {
        Some(super::product_tag::Relation::Tag.def().rev())
    }
}

impl ActiveModelBehavior for ActiveModel {}
