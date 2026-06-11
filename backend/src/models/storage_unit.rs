use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "storage_units")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub warehouse_id: i32,
    pub code: String,
    pub deleted_at: Option<DateTimeUtc>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::warehouse::Entity",
        from = "Column::WarehouseId",
        to = "super::warehouse::Column::Id"
    )]
    Warehouse,
}

impl ActiveModelBehavior for ActiveModel {}
