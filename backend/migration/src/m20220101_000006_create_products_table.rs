use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Products::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Products::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Products::Name).string().not_null())
                    .col(ColumnDef::new(Products::Slug).string().not_null().unique_key())
                    .col(ColumnDef::new(Products::Description).string().null())
                    .col(ColumnDef::new(Products::Price).decimal().not_null())
                    .col(
                        ColumnDef::new(Products::ProductType)
                            .string()
                            .not_null()
                            .default("simple"),
                    )
                    .col(ColumnDef::new(Products::CategoryId).integer().null())
                    .col(
                        ColumnDef::new(Products::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Products::UpdatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_products_category")
                            .from(Products::Table, Products::CategoryId)
                            .to(Categories::Table, Categories::Id)
                            .on_delete(ForeignKeyAction::SetNull),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Products::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Products {
    Table,
    Id,
    Name,
    Slug,
    Description,
    Price,
    #[sea_orm(iden = "type")]
    ProductType,
    CategoryId,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Categories {
    Table,
    Id,
}
