use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.create_table(
            Table::create().table(OrderItems::Table).if_not_exists()
                .col(ColumnDef::new(OrderItems::Id).integer().not_null().auto_increment().primary_key())
                .col(ColumnDef::new(OrderItems::OrderId).integer().not_null())
                .col(ColumnDef::new(OrderItems::ProductId).integer().not_null())
                .col(ColumnDef::new(OrderItems::Quantity).integer().not_null())
                .col(ColumnDef::new(OrderItems::DeletedAt).timestamp().null())
                .foreign_key(
                    ForeignKey::create().name("fk_order_items_order")
                        .from(OrderItems::Table, OrderItems::OrderId).to(Orders::Table, Orders::Id)
                        .on_delete(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create().name("fk_order_items_product")
                        .from(OrderItems::Table, OrderItems::ProductId).to(Products::Table, Products::Id)
                        .on_delete(ForeignKeyAction::Cascade),
                )
                .to_owned(),
        ).await
    }
    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.drop_table(Table::drop().table(OrderItems::Table).to_owned()).await
    }
}
#[derive(DeriveIden)]
enum OrderItems { Table, Id, OrderId, ProductId, Quantity, DeletedAt }
#[derive(DeriveIden)]
enum Orders { Table, Id }
#[derive(DeriveIden)]
enum Products { Table, Id }
