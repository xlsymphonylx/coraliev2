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
mod m20220101_000012_add_deleted_at;
mod m20220101_000013_create_addresses_table;
mod m20220101_000014_create_warehouses_table;
mod m20220101_000015_create_storage_units_table;
mod m20220101_000016_create_inventory_table;
mod m20220101_000017_create_orders_table;
mod m20220101_000018_create_order_items_table;
mod m20220101_000019_add_barcode_to_products;
mod m20220101_000020_add_contact_fields;
mod m20220101_000021_create_coupons_table;
mod m20220101_000022_add_dates_to_volume_discounts;
mod m20220101_000023_create_discount_sets_table;
mod m20220101_000024_add_discount_set_id;
mod m20220101_000025_create_promo_settings_table;
mod m20220101_000026_add_title_subtitle_colors_to_promo_settings;
mod m20220101_000027_create_showcase_settings_table;

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
            Box::new(m20220101_000012_add_deleted_at::Migration),
            Box::new(m20220101_000013_create_addresses_table::Migration),
            Box::new(m20220101_000014_create_warehouses_table::Migration),
            Box::new(m20220101_000015_create_storage_units_table::Migration),
            Box::new(m20220101_000016_create_inventory_table::Migration),
            Box::new(m20220101_000017_create_orders_table::Migration),
            Box::new(m20220101_000018_create_order_items_table::Migration),
            Box::new(m20220101_000019_add_barcode_to_products::Migration),
            Box::new(m20220101_000020_add_contact_fields::Migration),
            Box::new(m20220101_000021_create_coupons_table::Migration),
            Box::new(m20220101_000022_add_dates_to_volume_discounts::Migration),
            Box::new(m20220101_000023_create_discount_sets_table::Migration),
            Box::new(m20220101_000024_add_discount_set_id::Migration),
            Box::new(m20220101_000025_create_promo_settings_table::Migration),
            Box::new(m20220101_000026_add_title_subtitle_colors_to_promo_settings::Migration),
            Box::new(m20220101_000027_create_showcase_settings_table::Migration),
        ]
    }
}
