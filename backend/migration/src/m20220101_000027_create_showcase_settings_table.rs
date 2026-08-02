use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(ShowcaseSettings::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(ShowcaseSettings::Id)
                            .integer()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(ShowcaseSettings::Discount)
                            .string()
                            .not_null()
                            .default("2% OFF"),
                    )
                    .col(
                        ColumnDef::new(ShowcaseSettings::Title)
                            .string()
                            .not_null()
                            .default("Labios atrevidos, atrevida tú"),
                    )
                    .col(
                        ColumnDef::new(ShowcaseSettings::Subtitle)
                            .string()
                            .not_null()
                            .default("¡Descubre nuestra nueva colección de delineador labiales con un 2% de descuento!"),
                    )
                    .col(
                        ColumnDef::new(ShowcaseSettings::ButtonText)
                            .string()
                            .not_null()
                            .default("Compra Ahora"),
                    )
                    .col(
                        ColumnDef::new(ShowcaseSettings::ButtonLink)
                            .string()
                            .not_null()
                            .default("https://coraliegtm.com/products/rhode-peptide-lip-shape"),
                    )
                    .col(
                        ColumnDef::new(ShowcaseSettings::ExampleImage1)
                            .string()
                            .not_null()
                            .default("/showcase-example-1.jpg"),
                    )
                    .col(
                        ColumnDef::new(ShowcaseSettings::ExampleImage2)
                            .string()
                            .not_null()
                            .default("/showcase-example-2.png"),
                    )
                    .col(
                        ColumnDef::new(ShowcaseSettings::ProductImage)
                            .string()
                            .not_null()
                            .default("/showcase-product.jpg"),
                    )
                    .col(
                        ColumnDef::new(ShowcaseSettings::ProductCategory)
                            .string()
                            .not_null()
                            .default("Skin Care"),
                    )
                    .col(
                        ColumnDef::new(ShowcaseSettings::ProductCategoryLink)
                            .string()
                            .not_null()
                            .default("https://coraliegtm.com/collections/skincare"),
                    )
                    .col(
                        ColumnDef::new(ShowcaseSettings::ProductTitle)
                            .string()
                            .not_null()
                            .default("ANUA Heartleaf Pore Control Cleansing Oil"),
                    )
                    .col(
                        ColumnDef::new(ShowcaseSettings::ProductPrice)
                            .string()
                            .not_null()
                            .default("Q250.00"),
                    )
                    .col(
                        ColumnDef::new(ShowcaseSettings::UpdatedAt)
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
            .drop_table(Table::drop().table(ShowcaseSettings::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum ShowcaseSettings {
    Table,
    Id,
    Discount,
    Title,
    Subtitle,
    ButtonText,
    ButtonLink,
    ExampleImage1,
    ExampleImage2,
    ProductImage,
    ProductCategory,
    ProductCategoryLink,
    ProductTitle,
    ProductPrice,
    UpdatedAt,
}
