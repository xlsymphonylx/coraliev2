use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(DiscountSets::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(DiscountSets::Id)
                            .uuid()
                            .not_null()
                            .primary_key()
                            .extra("DEFAULT gen_random_uuid()"),
                    )
                    .col(ColumnDef::new(DiscountSets::Name).string().not_null())
                    .col(ColumnDef::new(DiscountSets::Slug).string().not_null().unique_key())
                    .col(ColumnDef::new(DiscountSets::Description).string())
                    .col(ColumnDef::new(DiscountSets::Active).boolean().default(true))
                    .col(ColumnDef::new(DiscountSets::StartsAt).date_time())
                    .col(ColumnDef::new(DiscountSets::EndsAt).date_time())
                    .col(ColumnDef::new(DiscountSets::DeletedAt).date_time())
                    .col(ColumnDef::new(DiscountSets::CreatedAt).date_time().extra("DEFAULT NOW()"))
                    .col(ColumnDef::new(DiscountSets::UpdatedAt).date_time().extra("DEFAULT NOW()"))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(DiscountSets::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum DiscountSets {
    Table,
    Id,
    Name,
    Slug,
    Description,
    Active,
    StartsAt,
    EndsAt,
    DeletedAt,
    CreatedAt,
    UpdatedAt,
}
