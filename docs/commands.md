# Worksphere Commands

Quick reference for commonly used development commands.

## Docker

### Start everything

```bash
docker compose --env-file .env up
```

### Start in background

```bash
docker compose --env-file .env up -d
```

### Stop everything

```bash
docker compose down
```

> `docker compose down` does not remove named volumes by default. Database/Kafka data remains in their Docker volumes.

### Rebuild images

```bash
docker compose --env-file .env up --build
```

### Rebuild without cache

```bash
docker compose --env-file .env build --no-cache
```

### Check running services

```bash
docker compose ps
```

### View logs

```bash
docker compose logs -f
```

### View one service

```bash
docker compose logs -f identity-service
```

```bash
docker compose logs -f notification-service
```

---

# Docker Debugger

Debugging is disabled by default.

Normal development:

```bash
docker compose --env-file .env up
```

Debug development:

```bash
docker compose --env-file .env.debug up
```

The debug environment enables the Node inspector for the configured service.

### VS Code

1. Start Docker using `.env.debug`.
2. Open VS Code.
3. Open **Run and Debug**.
4. Select the required `Attach:` configuration.
5. Start debugging.
6. Add breakpoints in the TypeScript source.
7. Trigger the API/request.

Configured services:

```text
Identity Service       → 9229
Workspace Service      → 9230
Notification Service   → 9231
```

Debug configurations are stored in:

```text
.vscode/launch.json
```

---

# Shared Contracts

Build shared contracts:

```bash
npm run build -w @worksphere/shared-contracts
```

Typecheck a service after changing contracts:

```bash
npm run typecheck -w @apps/identity-service
```

```bash
npm run typecheck -w @apps/notification-service
```

---

# Identity Service

Move into the service:

```bash
cd apps/identity-service
```

### Development

```bash
npm run dev
```

### Debug

```bash
npm run dev:debug
```

### Build

```bash
npm run build
```

### Typecheck

```bash
npm run typecheck
```

### Tests

```bash
npm test
```

---

# Database Migrations

Run from the Identity Service directory:

```bash
cd apps/identity-service
```

### Migration status

```bash
npm run migration:status
```

### Run migrations

```bash
npm run migration:up
```

### Undo latest migration

```bash
npm run migration:down
```

### Create migration

```bash
npm run migration:create -- migration-name
```

Example:

```bash
npm run migration:create -- add-user-profile
```

---

# PostgreSQL

List databases:

```bash
docker exec -it worksphere-postgres psql -U postgres -l
```

Connect to Identity DB:

```bash
docker exec -it worksphere-postgres psql -U postgres -d identity_db
```

List tables:

```bash
docker exec -it worksphere-postgres psql -U postgres -d identity_db -c "\dt"
```

Connect to Worksphere DB:

```bash
docker exec -it worksphere-postgres psql -U postgres -d worksphere
```

---

# Kafka

Check Kafka containers:

```bash
docker compose ps kafka-1 kafka-2 kafka-3
```

View Kafka logs:

```bash
docker compose logs -f kafka-1
```

Check topics:

```bash
docker exec -it worksphere-kafka-1 \
  /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server kafka-1:9092 \
  --list
```

Describe a topic:

```bash
docker exec -it worksphere-kafka-1 \
  /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server kafka-1:9092 \
  --describe \
  --topic identity.events
```

---

# Redis

Open Redis CLI:

```bash
docker exec -it worksphere-redis redis-cli
```

Check Redis:

```bash
docker exec -it worksphere-redis redis-cli ping
```

Expected:

```text
PONG
```

---

# Useful Docker Commands

Open a shell inside a service:

```bash
docker exec -it worksphere-identity sh
```

```bash
docker exec -it worksphere-notification sh
```

Check container environment:

```bash
docker exec -it worksphere-identity env
```

Restart a service:

```bash
docker compose restart identity-service
```

Restart notification service:

```bash
docker compose restart notification-service
```

---

# Clean Docker Environment

### Stop containers

```bash
docker compose down
```

### Stop and remove volumes

**WARNING: This deletes persistent Docker volume data.**

```bash
docker compose down -v
```

This removes data such as:

* PostgreSQL data
* Kafka data
* other named volumes

Use this only when intentionally resetting the local environment.

---

# Root Workspace Commands

Install dependencies:

```bash
npm install
```

Build a specific workspace:

```bash
npm run build -w @apps/identity-service
```

Typecheck a specific workspace:

```bash
npm run typecheck -w @apps/identity-service
```

Run tests for a workspace:

```bash
npm test -w @apps/identity-service
```

---

# Environment Files

Normal Docker development:

```text
.env
```

Debugger:

```text
.env.debug
```

Do not commit secrets or machine-specific credentials.

---

# Common Workflow

## Normal development

```bash
docker compose --env-file .env up
```

## Debugging

```bash
docker compose --env-file .env.debug up
```

Then attach the required debugger from VS Code.

## After changing shared contracts

```bash
npm run build -w @worksphere/shared-contracts
```

Then typecheck affected services.

## After changing a database schema

```bash
cd apps/identity-service
npm run migration:status
npm run migration:up
```

## After changing Docker configuration

```bash
docker compose --env-file .env up --build
```
