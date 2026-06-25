use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(PromoSettings::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(PromoSettings::Id)
                            .integer()
                            .not_null()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(PromoSettings::Title).string().not_null())
                    .col(ColumnDef::new(PromoSettings::Subtitle).string().not_null())
                    .col(
                        ColumnDef::new(PromoSettings::BackgroundColor)
                            .string()
                            .not_null()
                            .default("#fad4da"),
                    )
                    .col(
                        ColumnDef::new(PromoSettings::Image)
                            .string()
                            .not_null()
                            .default("/banner.webp"),
                    )
                    .col(
                        ColumnDef::new(PromoSettings::UpdatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(PromoSettings::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum PromoSettings {
    Table,
    Id,
    Title,
    Subtitle,
    BackgroundColor,
    Image,
    UpdatedAt,
}
