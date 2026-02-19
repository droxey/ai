# Project: [name]

Django REST API. Docker Compose for local dev.

## Stack
Python 3.12+, Django 5.x, DRF, PostgreSQL, Celery+Redis, pytest.

## Build & Test
docker compose up -d
pytest --cov=apps -x
ruff check . && ruff format --check .

## Structure
config/settings/ → apps/[domain]/ → core/

## Notes
[Project-specific constraints, external integrations, deployment target]
