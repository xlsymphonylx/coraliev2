use sea_orm::DatabaseConnection;

pub mod admin;

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

    println!("seeders: {} ran, {} skipped", ran, skipped);
}
