use sea_orm::DatabaseConnection;

pub mod admin;
pub mod categories;
pub mod promo_settings;
pub mod showcase_settings;

pub async fn run(db: &DatabaseConnection) {
    let mut ran = 0u32;
    let mut skipped = 0u32;

    macro_rules! run_seeder {
        ($m:ident) => {
            print!("seeding {} ... ", $m::NAME);
            match $m::seed(db).await {
                Ok(()) => {
                    println!("done");
                    ran += 1;
                }
                Err(e) => {
                    println!("skipped ({})", e);
                    skipped += 1;
                }
            }
        };
    }

    run_seeder!(admin);
    run_seeder!(categories);
    run_seeder!(promo_settings);
    run_seeder!(showcase_settings);

    println!("seeders: {} ran, {} skipped", ran, skipped);
}
