use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(ProductImages::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(ProductImages::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(ProductImages::ProductId).integer().not_null())
                    .col(ColumnDef::new(ProductImages::Url).string().not_null())
                    .col(ColumnDef::new(ProductImages::Alt).string().null())
                    .col(ColumnDef::new(ProductImages::SortOrder).integer().not_null().default(0))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_product_images_product")
                            .from(ProductImages::Table, ProductImages::ProductId)
                            .to(Products::Table, Products::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(ProductImages::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum ProductImages {
    Table,
    Id,
    ProductId,
    Url,
    Alt,
    SortOrder,
}

#[derive(DeriveIden)]
enum Products {
    Table,
    Id,
}
