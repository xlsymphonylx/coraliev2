use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.create_table(
            Table::create().table(Orders::Table).if_not_exists()
                .col(ColumnDef::new(Orders::Id).integer().not_null().auto_increment().primary_key())
                .col(ColumnDef::new(Orders::UserId).integer().null())
                .col(ColumnDef::new(Orders::AnonName).string().null())
                .col(ColumnDef::new(Orders::Status).string().not_null().default("pending"))
                .col(ColumnDef::new(Orders::Total).decimal().not_null())
                .col(ColumnDef::new(Orders::ShippingAddressId).integer().null())
                .col(ColumnDef::new(Orders::Notes).text().null())
                .col(ColumnDef::new(Orders::CreatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                .col(ColumnDef::new(Orders::UpdatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                .col(ColumnDef::new(Orders::DeletedAt).timestamp().null())
                .foreign_key(
                    ForeignKey::create().name("fk_orders_user")
                        .from(Orders::Table, Orders::UserId).to(Users::Table, Users::Id)
                        .on_delete(ForeignKeyAction::SetNull),
                )
                .foreign_key(
                    ForeignKey::create().name("fk_orders_address")
                        .from(Orders::Table, Orders::ShippingAddressId).to(Addresses::Table, Addresses::Id)
                        .on_delete(ForeignKeyAction::SetNull),
                )
                .to_owned(),
        ).await
    }
    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.drop_table(Table::drop().table(Orders::Table).to_owned()).await
    }
}
#[derive(DeriveIden)]
enum Orders { Table, Id, UserId, AnonName, Status, Total, ShippingAddressId, Notes, CreatedAt, UpdatedAt, DeletedAt }
#[derive(DeriveIden)]
enum Users { Table, Id }
#[derive(DeriveIden)]
enum Addresses { Table, Id }
