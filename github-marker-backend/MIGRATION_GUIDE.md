# Database Migration Guide

This project uses Alembic for database migrations with asyncpg support.

## Setup

Alembic has been configured to work with the async PostgreSQL setup using asyncpg.

## Common Commands

### Create a new migration

After making changes to your models, generate a migration:

```bash
.venv/bin/alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations

To upgrade to the latest version:

```bash
.venv/bin/alembic upgrade head
```

### Rollback migrations

To downgrade one version:

```bash
.venv/bin/alembic downgrade -1
```

To downgrade to a specific revision:

```bash
.venv/bin/alembic downgrade <revision_id>
```

### View migration history

```bash
.venv/bin/alembic history
```

### View current revision

```bash
.venv/bin/alembic current
```

## Migration Files

Migration files are stored in `alembic/versions/`

## Configuration

- `alembic.ini`: Main Alembic configuration file
- `alembic/env.py`: Environment configuration that connects to your database
- Database URL is loaded from `.env` file via `app.core.config.settings`

## Notes

- The configuration uses asyncpg for async database operations
- Models are imported from `app.models.users` and `app.models.bookmark`
- Base metadata is imported from `app.db.setup`
