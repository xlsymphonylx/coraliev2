use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let tables = [
            "users", "roles", "user_roles",
            "categories", "tags", "products", "product_images", "product_tags",
            "product_discounts", "volume_discounts", "bundle_items",
        ];
        for t in tables {
            manager
                .alter_table(
                    Table::alter()
                        .table(Alias::new(t))
                        .add_column_if_not_exists(
                            ColumnDef::new(Alias::new("deleted_at")).timestamp().null(),
                        )
                        .to_owned(),
                )
                .await?;
        }
        Ok(())
    }

    async fn down(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
        // Not dropping columns in down — too destructive for data
        Ok(())
    }
}
