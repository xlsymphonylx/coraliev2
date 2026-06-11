use sea_orm_migration::prelude::*;
use sea_orm_migration::sea_orm::{ConnectionTrait, Statement};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.create_table(
            Table::create().table(StorageUnits::Table).if_not_exists()
                .col(ColumnDef::new(StorageUnits::Id).integer().not_null().auto_increment().primary_key())
                .col(ColumnDef::new(StorageUnits::WarehouseId).integer().not_null())
                .col(ColumnDef::new(StorageUnits::Code).string().not_null())
                .col(ColumnDef::new(StorageUnits::DeletedAt).timestamp().null())
                .foreign_key(
                    ForeignKey::create().name("fk_storage_units_warehouse")
                        .from(StorageUnits::Table, StorageUnits::WarehouseId)
                        .to(Warehouses::Table, Warehouses::Id)
                        .on_delete(ForeignKeyAction::Cascade),
                )
                .to_owned(),
        ).await?;
        // unique(warehouse_id, code) via raw SQL
        let db = manager.get_database_backend();
        manager.get_connection()
            .execute(Statement::from_string(
                db,
                "CREATE UNIQUE INDEX IF NOT EXISTS idx_storage_units_warehouse_code ON storage_units (warehouse_id, code)",
            ))
            .await?;
        Ok(())
    }
    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.drop_table(Table::drop().table(StorageUnits::Table).to_owned()).await
    }
}
#[derive(DeriveIden)]
enum StorageUnits { Table, Id, WarehouseId, Code, DeletedAt }
#[derive(DeriveIden)]
enum Warehouses { Table, Id }
