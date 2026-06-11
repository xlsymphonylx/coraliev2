pub use sea_orm_migration::prelude::*;

mod m20220101_000001_create_users_table;
mod m20220101_000002_create_roles_table;
mod m20220101_000003_create_user_roles_table;
mod m20220101_000004_create_categories_table;
mod m20220101_000005_create_tags_table;
mod m20220101_000006_create_products_table;
mod m20220101_000007_create_product_images_table;
mod m20220101_000008_create_product_tags_table;
mod m20220101_000009_create_product_discounts_table;
mod m20220101_000010_create_volume_discounts_table;
mod m20220101_000011_create_bundle_items_table;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220101_000001_create_users_table::Migration),
            Box::new(m20220101_000002_create_roles_table::Migration),
            Box::new(m20220101_000003_create_user_roles_table::Migration),
            Box::new(m20220101_000004_create_categories_table::Migration),
            Box::new(m20220101_000005_create_tags_table::Migration),
            Box::new(m20220101_000006_create_products_table::Migration),
            Box::new(m20220101_000007_create_product_images_table::Migration),
            Box::new(m20220101_000008_create_product_tags_table::Migration),
            Box::new(m20220101_000009_create_product_discounts_table::Migration),
            Box::new(m20220101_000010_create_volume_discounts_table::Migration),
            Box::new(m20220101_000011_create_bundle_items_table::Migration),
        ]
    }
}
