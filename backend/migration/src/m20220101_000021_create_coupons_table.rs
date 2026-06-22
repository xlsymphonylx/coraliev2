use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Coupons::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Coupons::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Coupons::Code).string().not_null().unique_key())
                    .col(ColumnDef::new(Coupons::DiscountType).string_len(10).not_null())
                    .col(ColumnDef::new(Coupons::DiscountValue).decimal().not_null())
                    .col(ColumnDef::new(Coupons::MinPurchase).decimal())
                    .col(ColumnDef::new(Coupons::MaxUses).integer())
                    .col(ColumnDef::new(Coupons::CurrentUses).integer().default(0))
                    .col(ColumnDef::new(Coupons::StartsAt).date_time())
                    .col(ColumnDef::new(Coupons::EndsAt).date_time())
                    .col(ColumnDef::new(Coupons::Active).boolean().default(true))
                    .col(ColumnDef::new(Coupons::DeletedAt).date_time())
                    .col(ColumnDef::new(Coupons::CreatedAt).date_time().extra("DEFAULT NOW()"))
                    .col(ColumnDef::new(Coupons::UpdatedAt).date_time().extra("DEFAULT NOW()"))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Coupons::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Coupons {
    Table,
    Id,
    Code,
    DiscountType,
    DiscountValue,
    MinPurchase,
    MaxUses,
    CurrentUses,
    StartsAt,
    EndsAt,
    Active,
    DeletedAt,
    CreatedAt,
    UpdatedAt,
}
