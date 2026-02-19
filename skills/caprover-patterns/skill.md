# CapRover Patterns

Deployment patterns for CapRover single-node PaaS on Docker Swarm.

## captain-definition

```json
{
  "schemaVersion": 2,
  "dockerfilePath": "./Dockerfile"
}
```

For image-based deploys (no build step):
```json
{
  "schemaVersion": 2,
  "imageName": "registry.example.com/app:latest"
}
```

## One-Click App Template

```yaml
# template.yml
captainVersion: 4
services:
  $$cap_appname:
    image: $$cap_image:$$cap_version
    environment:
      DATABASE_URL: $$cap_db_url
      SECRET_KEY: $$cap_secret
    volumes:
      - $$cap_appname-data:/data
    caproverExtra:
      containerHttpPort: "8000"

caproverOneClickApp:
  variables:
    - id: $$cap_version
      label: Version
      defaultValue: "latest"
    - id: $$cap_db_url
      label: Database URL
      description: PostgreSQL connection string
    - id: $$cap_secret
      label: Secret Key
      description: Application secret key
  instructions:
    start: >-
      Deploy [app name] on CapRover.
    end: >-
      App deployed at $$cap_appname.$$cap_root_domain.
  displayName: App Name
  isOfficial: false
  description: One-line description.
```

## Jinja Templates for CapRover Configs

When using Jinja (e.g., captainclaw pattern):

```jinja2
{# docker-compose.yml.j2 #}
services:
  {{ app_name }}:
    image: {{ image }}:{{ version }}
    environment:
      {% for key, value in env_vars.items() %}
      {{ key }}: "{{ value }}"
      {% endfor %}
    deploy:
      replicas: {{ replicas | default(1) }}
      labels:
        - "captainId={{ captain_id }}"
```

Render with: `jinja2 docker-compose.yml.j2 vars.yml > docker-compose.yml`

## Multi-Service Deployment

```yaml
# docker-compose.yml for CapRover stack deploy
services:
  app:
    image: app:latest
    networks:
      - captain-overlay
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        order: start-first

  worker:
    image: app:latest
    command: celery -A config worker -l info
    networks:
      - captain-overlay
    deploy:
      replicas: 1

networks:
  captain-overlay:
    external: true
```

## Self-Hosted Services on CapRover

Common patterns for services like WorkAdventure, Jitsi, LiveKit:

1. Create one-click app or use captain-definition per service
2. Configure environment via CapRover dashboard or CLI
3. Use CapRover's built-in Let's Encrypt for TLS
4. Connect services via captain-overlay network
5. Persistent data via named volumes, not bind mounts

## CapRover CLI

```bash
# install
npm install -g caprover

# login
caprover login

# deploy from current directory
caprover deploy -a appname

# deploy a specific image
caprover deploy -i registry.example.com/app:v1.2.3 -a appname

# view logs
caprover api --path /user/apps/appdata/appname --method GET
```

## Checklist

- captain-definition at repo root
- Dockerfile builds and runs locally before deploying
- Environment variables set in CapRover dashboard, not baked into image
- Healthcheck endpoint exposed for CapRover monitoring
- Named volumes for any persistent state
- TLS via CapRover's built-in Let's Encrypt, not self-managed
- Use `captain-overlay` network for inter-service communication
