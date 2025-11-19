# Snapnet — Workforce Management

## Overview

Snapnet is a scalable workforce-management backend built with NestJS, TypeORM (MySQL), RabbitMQ (job queueing), and Redis (cache/idempotency). Key features implemented in this repo:

- REST APIs for departments, employees, leave requests (Swagger docs at /api/docs)
- Messaging with RabbitMQ via @golevelup/nestjs-rabbitmq:
  - Producer: publish `leave.requested`, `user.registered`
  - Consumers: leave request processor (auto-approve short leaves ≤ 2 days), email worker (welcome email)
  - Retry strategies (exponential / fixed) and configurable retry policies
  - Dead-lettering to DLQ on exhaustion
- Idempotency via Redis.setNxExpire for workers (prevents duplicate updates)
- Health endpoints:
  - GET /api/health — liveness
  - GET /api/queue-health — checks Redis + RabbitMQ (requires ADMIN role)
- Authentication and roles guard (routes protected via `@Roles(Role.ADMIN)` and `RolesGuard`)
- Unit and integration tests (Jest + Supertest). Queue-integration tests can run against mocked or real RabbitMQ.
- TypeORM-based migrations with CLI in package.json (migration:run / migration:generate)

## Important files

- Health controller/service: [src/health/health.controller.ts](src/health/health.controller.ts), [src/health/health.service.ts](src/health/health.service.ts)
- Messaging: [src/job-queue/producer.service.ts](src/job-queue/producer.service.ts), [src/job-queue/email.processor.ts](src/job-queue/email.processor.ts)
- Redis abstraction: [src/redis/redis.service.ts](src/redis/redis.service.ts)
- Config abstraction: [src/utils/common/config/config.service.ts](src/utils/common/config/config.service.ts)
- App entry: [src/app.module.ts](src/app.module.ts)
- Tests: tests live in `test/` and `src/**/*.spec.ts`

## Prerequisites

- Node >= 18, npm or yarn
- Docker & Docker Compose (for local DB & message broker)
- Optional: MySQL client for inspection

## Environment variables

Create a `.env` at project root with the following (example):

- APP_URL=http://localhost
- PORT=3000
- NODE_ENV=development

Database

- DB_HOST (default: localhost)
- DB_PORT (default: 3306)
- DB_USERNAME
- DB_PASSWORD
- DB_NAME

Redis

- REDIS_HOST
- REDIS_PORT
- REDIS_PASSWORD (optional)
- REDIS_DB

RabbitMQ

- RABBITMQ_URL (e.g. amqp://guest:guest@localhost:5672)
- RABBITMQ_EXCHANGE (default: workforce.events)
- RABBITMQ_DLQ (DLQ routing key/exchange name)

Retry & queues

- RETRY_STRATEGY (fixed|exponential)
- RETRY_FIXED_DELAY_MS
- RETRY_BASE_MS
- RETRY_CAP_MS
- EMAIL_MAX_RETRIES

## Setup — local (recommended)

1. Clone repo and install dependencies:
   - Windows PowerShell:
     - npm install
2. Copy example env:
   - copy .env.example .env (if .env.example present) or create .env with variables above
3. Start supporting services (MySQL + RabbitMQ) with Docker Compose:
   - docker-compose up -d
   - Wait until MySQL & RabbitMQ healthy (docker-compose ps / docker logs)
4. Run DB migrations:
   - npm run migration:run
   - (To generate a new migration file: npm run migration:generate -- -n MigrationName)
5. Start app:
   - npm run start:dev
6. Swagger UI:
   - Open {APP_URL}/api/docs (configured in src/main.ts)

## Run tests

- Unit & integration (uses Jest):
  - npm test
- To run tests with services from Docker Compose:
  - docker-compose -f docker-compose.yml up -d
  - npm test

## Migration notes

- Migrations implemented via TypeORM CLI helper in package.json; TypeScript migrations in `src/database/migrations`.
- Use `npm run migration:generate` to produce migration files and `npm run migration:run` to apply them.

## Queue testing

- Tests mock RabbitMQ by default for speed. To run tests against an actual broker:
  - Start RabbitMQ with docker-compose
  - Ensure RABBITMQ_URL points to running broker
  - Run tests

## Health endpoints

- GET /api/health — public
- GET /api/queue-health — protected; requires ADMIN role (decorator/guard in [src/decorators/role.decorator.ts](src/decorators/role.decorator.ts) and [src/guards/roles.guard.ts](src/guards/roles.guard.ts))

## Docker files (this repo)

See the Docker files included in the repository root:

- Dockerfile — application image build
- .dockerignore — reduce image size
- docker-compose.yml — default dev stack (MySQL + RabbitMQ)
- docker-compose.test.yml — stack optimized for CI/tests

## Troubleshooting

- If migrations fail: verify DB credentials and network access (docker-compose logs db).
- If RabbitMQ connection fails: check RABBITMQ_URL and firewall; management UI at http://localhost:15672 (guest/guest).
- For Redis issues: ensure REDIS_HOST/REDIS_PORT set and service running.

## References (open files)

- Health controller: [src/health/health.controller.ts](src/health/health.controller.ts)
- Health service: [src/health/health.service.ts](src/health/health.service.ts)
- Producer: [src/job-queue/producer.service.ts](src/job-queue/producer.service.ts)
- Email worker: [src/job-queue/email.processor.ts](src/job-queue/email.processor.ts)
- Redis service: [src/redis/redis.service.ts](src/redis/redis.service.ts)
- Config: [src/utils/common/config/config.service.ts](src/utils/common/config/config.service.ts)
