# Coralie Backend

## Folder structure

```
backend/
├── Cargo.toml
├── migration/          # SeaORM migration crate (standalone)
│   ├── Cargo.toml
│   ├── README.md
│   └── src/
│       ├── lib.rs                          # Migrator struct, lists all migrations
│       └── mYYYYMMDD_HHMMSS_<name>.rs      # One migration file per table/concern
└── src/
    ├── main.rs         # Entry point — binds server, connects DB
    ├── lib.rs          # Module declarations
    ├── bin/
    │   └── seed.rs     # Database seeder binary
    ├── state/
    │   ├── mod.rs      # AppState (holds DatabaseConnection)
    │   ├── config.rs   # Env-based configuration (PORT, DATABASE_URL)
    │   └── db.rs       # Database connection helper
    ├── models/         # SeaORM entity models — one file per table
    │   ├── mod.rs
    │   └── user.rs     # users table entity
    ├── routes/         # Axum route definitions — one file per route group
    │   ├── mod.rs      # Top-level router that merges all sub-routers
    │   └── health.rs   # GET /health
    ├── controllers/    # Request handlers (thin — delegate to services later)
    │   ├── mod.rs
    │   └── health.rs   # Health check handler
    ├── dto/            # Data transfer objects / API response types
    │   ├── mod.rs
    │   └── common.rs   # ApiResponse<T> generic response wrapper
    └── utils/          # Miscellaneous helpers
        └── mod.rs
```

## Key conventions

- **Migrations are one concern per file.** Each migration file creates/modifies a single table or a tightly-coupled group (e.g., a junction table goes in its own file, foreign keys added in a separate migration file referencing the table it alters).
- **Models mirror the database.** Each `models/*.rs` file corresponds to one table, using SeaORM's `DeriveEntityModel`.
- **Controllers are thin.** They extract request state, call into a service layer (not yet present), and return `ApiResponse<T>`.
- **Routes are declarative.** Each route group has its own sub-router; `routes/mod.rs` just merges them.

## Running

```sh
# Start the server
DATABASE_URL="sqlite:./data.db?mode=rwc" cargo run

# Run migrations
cd migration && cargo run -- up
```
