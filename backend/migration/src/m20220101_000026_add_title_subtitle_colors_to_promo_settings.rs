use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(PromoSettings::Table)
                    .add_column_if_not_exists(
                        ColumnDef::new(PromoSettings::TitleColor)
                            .string()
                            .not_null()
                            .default("#18151a"),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(PromoSettings::Table)
                    .add_column_if_not_exists(
                        ColumnDef::new(PromoSettings::SubtitleColor)
                            .string()
                            .not_null()
                            .default("#6a5a62"),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(PromoSettings::Table)
                    .drop_column(PromoSettings::TitleColor)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(PromoSettings::Table)
                    .drop_column(PromoSettings::SubtitleColor)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum PromoSettings {
    Table,
    TitleColor,
    SubtitleColor,
}
