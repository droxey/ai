# Deployment Patterns

Docker Swarm, CI/CD, and production deployment patterns.

## Docker Swarm Deploy

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  app:
    image: registry.example.com/app:${TAG}
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
        failure_action: rollback
      rollback_config:
        parallelism: 0
        order: stop-first
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      resources:
        limits:
          memory: 512M
          cpus: "0.5"
        reservations:
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    secrets:
      - db_password
      - secret_key
    networks:
      - backend
      - traefik-public

secrets:
  db_password:
    external: true
  secret_key:
    external: true

networks:
  backend:
    driver: overlay
  traefik-public:
    external: true
```

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker compose -f docker-compose.test.yml up --abort-on-container-exit

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: registry.example.com/app:${{ github.sha }}
          target: prod

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: |
          ssh deploy@server "docker service update \
            --image registry.example.com/app:${{ github.sha }} \
            --update-order start-first \
            app_web"
```

## Zero-Downtime Deploy Checklist

1. Healthcheck endpoint returns 200 only when truly ready (DB connected, migrations run).
2. `start-first` update order — new container starts before old one stops.
3. Graceful shutdown — app handles SIGTERM, finishes in-flight requests.
4. Database migrations are backwards-compatible (no column renames/drops in same deploy).
5. Static assets versioned or on CDN — old containers serving old assets is fine.

## Rollback

```bash
# Swarm auto-rollback on failure
docker service update --rollback app_web

# Manual rollback to specific image
docker service update --image registry.example.com/app:${PREVIOUS_SHA} app_web
```

## Monitoring

- Prometheus for metrics, Grafana for dashboards, Loki for logs.
- Alert on: error rate > 1%, p99 latency > 2s, container restarts > 3/hour.
- Health endpoint: `/health` (load balancer), `/ready` (k8s readiness).
- Structured JSON logs. Include request_id for tracing across services.

## CapRover

```bash
# Deploy via CLI
caprover deploy --appName myapp --imageName registry.example.com/app:latest

# Or via git push (CapRover as remote)
git remote add caprover https://captain.example.com/myapp.git
git push caprover main
```

- One app per service. Use CapRover's internal networking for service-to-service.
- Enable HTTPS via Let's Encrypt in CapRover dashboard.
- Set environment variables in CapRover UI, not in images.
