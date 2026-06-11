use sea_orm::{Database, DatabaseConnection};

use super::config::Config;

pub async fn connect() -> Result<DatabaseConnection, sea_orm::DbErr> {
    let config = Config::env();
    Database::connect(&config.database_url).await
}
