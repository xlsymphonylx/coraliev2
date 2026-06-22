use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(VolumeDiscounts::Table)
                    .add_column_if_not_exists(ColumnDef::new(VolumeDiscounts::StartsAt).date_time())
                    .to_owned(),
            )
            .await?;
        manager
            .alter_table(
                Table::alter()
                    .table(VolumeDiscounts::Table)
                    .add_column_if_not_exists(ColumnDef::new(VolumeDiscounts::EndsAt).date_time())
                    .to_owned(),
            )
            .await?;
        manager
            .alter_table(
                Table::alter()
                    .table(VolumeDiscounts::Table)
                    .add_column_if_not_exists(
                        ColumnDef::new(VolumeDiscounts::Active)
                            .boolean()
                            .default(true),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(VolumeDiscounts::Table)
                    .drop_column(VolumeDiscounts::StartsAt)
                    .to_owned(),
            )
            .await?;
        manager
            .alter_table(
                Table::alter()
                    .table(VolumeDiscounts::Table)
                    .drop_column(VolumeDiscounts::EndsAt)
                    .to_owned(),
            )
            .await?;
        manager
            .alter_table(
                Table::alter()
                    .table(VolumeDiscounts::Table)
                    .drop_column(VolumeDiscounts::Active)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum VolumeDiscounts {
    Table,
    StartsAt,
    EndsAt,
    Active,
}
