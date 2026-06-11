use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.create_table(
            Table::create().table(Warehouses::Table).if_not_exists()
                .col(ColumnDef::new(Warehouses::Id).integer().not_null().auto_increment().primary_key())
                .col(ColumnDef::new(Warehouses::Name).string().not_null().unique_key())
                .col(ColumnDef::new(Warehouses::CreatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                .col(ColumnDef::new(Warehouses::DeletedAt).timestamp().null())
                .to_owned(),
        ).await
    }
    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.drop_table(Table::drop().table(Warehouses::Table).to_owned()).await
    }
}
#[derive(DeriveIden)]
enum Warehouses { Table, Id, Name, CreatedAt, DeletedAt }
