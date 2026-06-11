use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(ProductDiscounts::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(ProductDiscounts::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(ProductDiscounts::ProductId).integer().not_null())
                    .col(ColumnDef::new(ProductDiscounts::DiscountPercent).decimal().not_null())
                    .col(ColumnDef::new(ProductDiscounts::StartsAt).timestamp().null())
                    .col(ColumnDef::new(ProductDiscounts::EndsAt).timestamp().null())
                    .col(
                        ColumnDef::new(ProductDiscounts::Active)
                            .boolean()
                            .not_null()
                            .default(true),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_product_discounts_product")
                            .from(ProductDiscounts::Table, ProductDiscounts::ProductId)
                            .to(Products::Table, Products::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(ProductDiscounts::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum ProductDiscounts {
    Table,
    Id,
    ProductId,
    DiscountPercent,
    StartsAt,
    EndsAt,
    Active,
}

#[derive(DeriveIden)]
enum Products {
    Table,
    Id,
}
