# Docker & Infrastructure

- Docker Compose for local dev, Swarm for production deploys.
- Multi-stage builds: dev target with hot reload, prod target minimal.
- CapRover for single-node management. Traefik for routing.
- Healthchecks on all services. Named volumes for persistence.
- .env for local, secrets for production. Never bake secrets into images.
