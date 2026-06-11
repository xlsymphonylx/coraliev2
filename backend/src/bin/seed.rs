use migration::MigratorTrait;

use backend::{seeders, state::db};

#[tokio::main]
async fn main() {
    let db = db::connect().await.expect("Failed to connect to database");

    migration::Migrator::up(&db, None)
        .await
        .expect("Failed to run migrations");

    seeders::run(&db).await;
}
