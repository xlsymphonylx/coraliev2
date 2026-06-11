use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(VolumeDiscounts::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(VolumeDiscounts::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(VolumeDiscounts::ProductId).integer().null())
                    .col(ColumnDef::new(VolumeDiscounts::MinQuantity).integer().not_null())
                    .col(ColumnDef::new(VolumeDiscounts::DiscountPercent).decimal().not_null())
                    .col(ColumnDef::new(VolumeDiscounts::Description).string().null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_volume_discounts_product")
                            .from(VolumeDiscounts::Table, VolumeDiscounts::ProductId)
                            .to(Products::Table, Products::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(VolumeDiscounts::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum VolumeDiscounts {
    Table,
    Id,
    ProductId,
    MinQuantity,
    DiscountPercent,
    Description,
}

#[derive(DeriveIden)]
enum Products {
    Table,
    Id,
}
