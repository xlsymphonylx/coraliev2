use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Add contact fields to orders
        manager
            .alter_table(
                Table::alter()
                    .table(Orders::Table)
                    .add_column_if_not_exists(ColumnDef::new(Orders::AnonEmail).string().null())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Orders::Table)
                    .add_column_if_not_exists(ColumnDef::new(Orders::AnonPhone).string().null())
                    .to_owned(),
            )
            .await?;

        // Add phone to users
        manager
            .alter_table(
                Table::alter()
                    .table(Users::Table)
                    .add_column_if_not_exists(ColumnDef::new(Users::Phone).string().null())
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(Table::alter().table(Orders::Table).drop_column(Orders::AnonEmail).to_owned())
            .await?;
        manager
            .alter_table(Table::alter().table(Orders::Table).drop_column(Orders::AnonPhone).to_owned())
            .await?;
        manager
            .alter_table(Table::alter().table(Users::Table).drop_column(Users::Phone).to_owned())
            .await?;
        Ok(())
    }
}

#[derive(DeriveIden)]
enum Orders {
    Table,
    AnonEmail,
    AnonPhone,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Phone,
}
