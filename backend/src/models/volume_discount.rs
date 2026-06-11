use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "volume_discounts")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub product_id: Option<i32>,
    pub min_quantity: i32,
    #[sea_orm(column_type = "Decimal(Some((5, 2)))")]
    pub discount_percent: Decimal,
    pub description: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::product::Entity",
        from = "Column::ProductId",
        to = "super::product::Column::Id"
    )]
    Product,
}

impl Related<super::product::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Product.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
