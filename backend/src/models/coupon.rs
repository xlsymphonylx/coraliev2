use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "coupons")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub code: String,
    pub discount_type: String,
    #[sea_orm(column_type = "Decimal(Some((10, 2)))")]
    pub discount_value: Decimal,
    #[sea_orm(column_type = "Decimal(Some((10, 2)))")]
    pub min_purchase: Option<Decimal>,
    pub max_uses: Option<i32>,
    pub current_uses: Option<i32>,
    pub starts_at: Option<DateTimeUtc>,
    pub ends_at: Option<DateTimeUtc>,
    pub active: Option<bool>,
    pub deleted_at: Option<DateTimeUtc>,
    pub created_at: Option<DateTimeUtc>,
    pub updated_at: Option<DateTimeUtc>,
    pub discount_set_id: Option<Uuid>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::discount_set::Entity",
        from = "Column::DiscountSetId",
        to = "super::discount_set::Column::Id"
    )]
    DiscountSet,
}

impl ActiveModelBehavior for ActiveModel {}
