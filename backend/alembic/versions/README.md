Migration scripts live in this directory.

Examples:
- Create a migration: `alembic revision --autogenerate -m "describe change"`
- Apply migrations: `alembic upgrade head`

The app currently also performs best-effort SQLite schema adjustments and seeds data on startup for local development; use Alembic as the source of truth for schema evolution in shared/production environments.
