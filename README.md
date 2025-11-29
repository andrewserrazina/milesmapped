# MilesMapped API

A production-ready FastAPI backend skeleton for the MilesMapped service, featuring Postgres, SQLAlchemy, Alembic migrations, and Docker orchestration.

## Features
- FastAPI application with modular routing and health endpoint
- SQLAlchemy models and Pydantic schemas
- Alembic migrations preconfigured with an example `User` model
- Dockerfile and docker-compose for API, Postgres, and optional pgAdmin
- Environment-based settings loaded from `.env`

## Getting Started
1. Copy `.env` and adjust values as needed:
   ```bash
   cp .env .env.local
   ```
2. Build and start the stack:
   ```bash
   docker-compose up --build
   ```
3. Run Alembic migrations inside the API container:
   ```bash
   docker-compose exec api alembic upgrade head
   ```
4. Access the API at `http://localhost:8000` and docs at `/docs`.

## Project Layout
- `app/main.py`: FastAPI app instance and router registration
- `app/core/config.py`: Settings management via environment variables
- `app/db/`: SQLAlchemy base and session setup
- `app/models/`, `app/schemas/`, `app/api/routes/`: Domain models, Pydantic schemas, and API endpoints
- `migrations/`: Alembic configuration and migration scripts
