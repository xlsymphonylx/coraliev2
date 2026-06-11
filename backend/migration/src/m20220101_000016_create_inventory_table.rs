use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.create_table(
            Table::create().table(Inventory::Table).if_not_exists()
                .col(ColumnDef::new(Inventory::Id).integer().not_null().auto_increment().primary_key())
                .col(ColumnDef::new(Inventory::ProductId).integer().not_null())
                .col(ColumnDef::new(Inventory::StorageUnitId).integer().not_null())
                .col(ColumnDef::new(Inventory::BatchCode).string().null())
                .col(ColumnDef::new(Inventory::Quantity).integer().not_null().default(0))
                .col(ColumnDef::new(Inventory::LowStockThreshold).integer().not_null().default(5))
                .col(ColumnDef::new(Inventory::EntryDate).timestamp().not_null().default(Expr::current_timestamp()))
                .col(ColumnDef::new(Inventory::ExpireDate).timestamp().null())
                .col(ColumnDef::new(Inventory::DeletedAt).timestamp().null())
                .foreign_key(
                    ForeignKey::create().name("fk_inventory_product")
                        .from(Inventory::Table, Inventory::ProductId).to(Products::Table, Products::Id)
                        .on_delete(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create().name("fk_inventory_storage_unit")
                        .from(Inventory::Table, Inventory::StorageUnitId).to(StorageUnits::Table, StorageUnits::Id)
                        .on_delete(ForeignKeyAction::Cascade),
                )
                .to_owned(),
        ).await
    }
    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.drop_table(Table::drop().table(Inventory::Table).to_owned()).await
    }
}
#[derive(DeriveIden)]
enum Inventory {
    Table, Id, ProductId, StorageUnitId, BatchCode, Quantity,
    LowStockThreshold, EntryDate, ExpireDate, DeletedAt,
}
#[derive(DeriveIden)]
enum Products { Table, Id }
#[derive(DeriveIden)]
enum StorageUnits { Table, Id }
