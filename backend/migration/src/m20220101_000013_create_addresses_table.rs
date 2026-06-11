use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Addresses::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Addresses::Id).integer().not_null().auto_increment().primary_key())
                    .col(ColumnDef::new(Addresses::UserId).integer().null())
                    .col(ColumnDef::new(Addresses::Label).string().not_null())
                    .col(ColumnDef::new(Addresses::Line1).string().not_null())
                    .col(ColumnDef::new(Addresses::Line2).string().null())
                    .col(ColumnDef::new(Addresses::City).string().not_null())
                    .col(ColumnDef::new(Addresses::State).string().not_null())
                    .col(ColumnDef::new(Addresses::IsDefault).boolean().not_null().default(false))
                    .col(ColumnDef::new(Addresses::CreatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .col(ColumnDef::new(Addresses::DeletedAt).timestamp().null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_addresses_user")
                            .from(Addresses::Table, Addresses::UserId)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::SetNull),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.drop_table(Table::drop().table(Addresses::Table).to_owned()).await
    }
}

#[derive(DeriveIden)]
enum Addresses {
    Table, Id, UserId, Label, Line1, Line2, City, State, IsDefault, CreatedAt, DeletedAt,
}
#[derive(DeriveIden)]
enum Users { Table, Id }
