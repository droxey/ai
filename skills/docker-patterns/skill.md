# Docker Patterns

Reference patterns for Docker Compose, Swarm, and container best practices.

## Multi-Stage Build

```dockerfile
# syntax=docker/dockerfile:1

# --- Base ---
FROM python:3.12-slim AS base
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

# --- Dependencies ---
FROM base AS deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Dev ---
FROM deps AS dev
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt
COPY . .
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# --- Production ---
FROM deps AS prod
COPY . .
RUN python manage.py collectstatic --noinput
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

## Compose Patterns

```yaml
services:
  app:
    build:
      context: .
      target: dev  # Switch to prod for production
    volumes:
      - .:/app     # Hot reload in dev only
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

## Swarm Deploy

```yaml
deploy:
  replicas: 2
  update_config:
    parallelism: 1
    delay: 10s
    order: start-first
  restart_policy:
    condition: on-failure
    delay: 5s
    max_attempts: 3
  resources:
    limits:
      memory: 512M
      cpus: "0.5"
```

## Networking

- One network per logical group (frontend, backend, monitoring).
- Use aliases for service discovery. Never hardcode container IPs.
- Expose only edge services (reverse proxy). Internal services stay on internal networks.

## Security

- Run as non-root: `USER appuser` after creating the user.
- Read-only root filesystem where possible: `read_only: true`.
- Drop all capabilities, add back only what's needed: `cap_drop: [ALL]`.
- No `--privileged` unless absolutely required (and document why).
- Scan images with `trivy` or `grype` in CI.
