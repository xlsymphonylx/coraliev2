use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Add discount_set_id to product_discounts
        manager
            .alter_table(
                Table::alter()
                    .table(ProductDiscounts::Table)
                    .add_column_if_not_exists(
                        ColumnDef::new(ProductDiscounts::DiscountSetId)
                            .uuid()
                            .null(),
                    )
                    .to_owned(),
            )
            .await?;

        // Add discount_set_id to volume_discounts
        manager
            .alter_table(
                Table::alter()
                    .table(VolumeDiscounts::Table)
                    .add_column_if_not_exists(
                        ColumnDef::new(VolumeDiscounts::DiscountSetId)
                            .uuid()
                            .null(),
                    )
                    .to_owned(),
            )
            .await?;

        // Add discount_set_id to coupons
        manager
            .alter_table(
                Table::alter()
                    .table(Coupons::Table)
                    .add_column_if_not_exists(
                        ColumnDef::new(Coupons::DiscountSetId)
                            .uuid()
                            .null(),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(ProductDiscounts::Table)
                    .drop_column(ProductDiscounts::DiscountSetId)
                    .to_owned(),
            )
            .await?;
        manager
            .alter_table(
                Table::alter()
                    .table(VolumeDiscounts::Table)
                    .drop_column(VolumeDiscounts::DiscountSetId)
                    .to_owned(),
            )
            .await?;
        manager
            .alter_table(
                Table::alter()
                    .table(Coupons::Table)
                    .drop_column(Coupons::DiscountSetId)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum ProductDiscounts {
    Table,
    DiscountSetId,
}

#[derive(DeriveIden)]
enum VolumeDiscounts {
    Table,
    DiscountSetId,
}

#[derive(DeriveIden)]
enum Coupons {
    Table,
    DiscountSetId,
}
