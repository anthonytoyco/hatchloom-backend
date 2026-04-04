# HatchLoom Backend

HatchLoom is an education platform monorepo composed of three microservices and their frontends, orchestrated together via Docker Compose.

## Services

| Service                         | Description                                                              | API Port | Frontend Port |
| ------------------------------- | ------------------------------------------------------------------------ | -------- | ------------- |
| [user-service](./user-service/) | Authentication and user profile management                               | 8081     | 3000          |
| [launchpad](./launchpad/)       | Student entrepreneurship workspace (Sandboxes, SideHustles, BMCs, Teams) | 8082     | 4173          |
| [connecthub](./connecthub/)     | Social feed, posts, classified listings, and messaging                   | 8083     | 5173          |

A pgAdmin instance is also available at **http://localhost:5050** for database management.

## Prerequisites

- Docker and Docker Compose
- Java 25+ (for running services locally without Docker)
- Maven 3.9+ (or use the included `mvnw` wrappers)

## Running the Full Stack

Build and start all services together from the repository root:

```bash
docker compose up --build
```

To run in the background:

```bash
docker compose up -d --build
```

To stop all services:

```bash
docker compose down
```

## Service URLs (full-stack compose)

| URL                   | Service               |
| --------------------- | --------------------- |
| http://localhost:3000 | User Service Frontend |
| http://localhost:4173 | LaunchPad Frontend    |
| http://localhost:5173 | ConnectHub Frontend   |
| http://localhost:8081 | User Service API      |
| http://localhost:8082 | LaunchPad API         |
| http://localhost:8083 | ConnectHub API        |
| http://localhost:5050 | pgAdmin               |

## Running Services Individually

Each service can be run independently. See the README in each service directory for details:

- [user-service/README.md](./user-service/README.md)
- [launchpad/README.md](./launchpad/README.md)
- [connecthub/README.md](./connecthub/README.md)

## API Documentation

- [User Service API](./user-service/API_DOCUMENTATION.md)
- [LaunchPad API](./launchpad/API_DOCUMENTATION.md)
- [ConnectHub API](./connecthub/API_DOCUMENTATION.md)

## Environment Variables

All services are configured via a single `.env` file at the repository root. Copy the example and fill in your values:

```bash
cp .env.example .env
```

| Variable                          | Description                                                                            |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| `LAUNCHPAD_DB`                    | Launchpad PostgreSQL database name                                                     |
| `LAUNCHPAD_USER`                  | Launchpad PostgreSQL username                                                          |
| `LAUNCHPAD_PASSWORD`              | Launchpad PostgreSQL password                                                          |
| `AUTH_DB`                         | Auth PostgreSQL database name                                                          |
| `AUTH_USER`                       | Auth PostgreSQL username                                                               |
| `AUTH_PASSWORD`                   | Auth PostgreSQL password                                                               |
| `CONNECTHUB_DB`                   | ConnectHub PostgreSQL database name                                                    |
| `CONNECTHUB_USER`                 | ConnectHub PostgreSQL username                                                         |
| `CONNECTHUB_PASSWORD`             | ConnectHub PostgreSQL password                                                         |
| `JWT_ACCESS_TOKEN_EXPIRY_MINUTES` | Access token lifetime in minutes (default: `30`)                                       |
| `JWT_REFRESH_TOKEN_EXPIRY_DAYS`   | Refresh token lifetime in days (default: `7`)                                          |
| `JWT_ISSUER_URI`                  | JWT issuer URI - points to auth-service internally (`http://auth-service:8080`)        |
| `AUTH_SERVICE_URL`                | Internal Docker network URL for the auth service                                       |
| `LAUNCHPAD_SERVICE_URL`           | Internal Docker network URL for the launchpad service                                  |
| `PGADMIN_DEFAULT_EMAIL`           | pgAdmin login email                                                                    |
| `PGADMIN_DEFAULT_PASSWORD`        | pgAdmin login password                                                                 |
| `VITE_API_BASE_URL`               | Base URL prefix for API calls baked into frontend builds (use `/api` with nginx proxy) |
| `VITE_AUTH_URL`                   | Public URL of the auth frontend (used by other frontends to redirect to login)         |
| `VITE_CONNECTHUB_URL`             | Public URL of the ConnectHub frontend                                                  |
| `VITE_CONNECTHUB_API_URL`         | Public URL of the ConnectHub API (used by LaunchPad to link to classified posts)       |
| `CORS_ALLOWED_ORIGINS`            | Comma-separated list of origins permitted by Spring Boot CORS configuration            |

> **Note:** `VITE_*` variables are baked into the frontend static assets at Docker build time. Changing them requires rebuilding the frontend images.

---

## Deployment (Google Cloud VM)

The production stack runs on a **Google Cloud e2-standard-2 VM**. All nine containers from the root `docker-compose.yaml` run on the VM, with [Caddy](https://caddyserver.com/) acting as the reverse proxy handling HTTPS termination via Let's Encrypt.

### Architecture

```
Internet
    │
    ▼
Caddy (ports 80 / 443) - auto HTTPS via Let's Encrypt
    │
    ├─► auth.hatchloom.anthonytoyco.com      → auth-frontend     (localhost:3000)
    ├─► launchpad.hatchloom.anthonytoyco.com → launchpad-frontend (localhost:4173)
    └─► connecthub.hatchloom.anthonytoyco.com → connecthub-frontend (localhost:5173)
```

Caddy forwards each subdomain to the corresponding frontend container. The frontend nginx configs then proxy `/api/*` traffic to the Spring Boot backends on the internal Docker network. Backend services and databases are not exposed publicly.

### Container Port Map

| Container             | Internal Port | Host Port | Public via Caddy |
| --------------------- | ------------- | --------- | ---------------- |
| `auth-frontend`       | 80            | 3000      | Yes              |
| `launchpad-frontend`  | 80            | 4173      | Yes              |
| `connecthub-frontend` | 80            | 5173      | Yes              |
| `auth-service`        | 8080          | 8081      | No               |
| `launchpad-service`   | 8080          | 8082      | No               |
| `connecthub-service`  | 8080          | 8083      | No               |
| `launchpad-postgres`  | 5432          | 5432      | No               |
| `auth-postgres`       | 5432          | 5433      | No               |
| `connecthub-postgres` | 5432          | 5434      | No               |
| `auth-pgadmin`        | 80            | 5050      | No               |

### Production URLs

| URL                                           | Service               |
| --------------------------------------------- | --------------------- |
| https://auth.hatchloom.anthonytoyco.com       | User Service Frontend |
| https://launchpad.hatchloom.anthonytoyco.com  | LaunchPad Frontend    |
| https://connecthub.hatchloom.anthonytoyco.com | ConnectHub Frontend   |

---

## CI/CD (GitHub Actions)

Every push to `main` (and every pull request targeting `main`) runs six CI workflows in parallel. Three for backends and three for frontends. All images are published to **GitHub Container Registry (GHCR)** at `ghcr.io/anthonytoyco/<image-name>`.

### CI Workflows

| Workflow file               | Trigger          | What it does                                                                |
| --------------------------- | ---------------- | --------------------------------------------------------------------------- |
| `user-service-backend.yml`  | push / PR → main | Tests with Maven (JWT secret injected), builds & pushes Docker image        |
| `launchpad-backend.yml`     | push / PR → main | Tests with Maven + Postgres service container, builds & pushes Docker image |
| `connecthub-backend.yml`    | push / PR → main | Tests with Maven, builds & pushes Docker image                              |
| `user-service-frontend.yml` | push / PR → main | Lint, build production bundle, builds & pushes Docker image                 |
| `launchpad-frontend.yml`    | push / PR → main | Lint, typecheck, build production bundle, builds & pushes Docker image      |
| `connecthub-frontend.yml`   | push / PR → main | Lint, build production bundle, builds & pushes Docker image                 |

Two reusable workflow templates keep the CI logic DRY:

- **`_reusable-java-ci.yml`**: Sets up Java 25 (Temurin), runs `./mvnw clean verify`, optionally spins up a Postgres 16 service container, uploads Surefire reports, and builds/pushes the Docker image to GHCR on `main` pushes.
- **`_reusable-node-ci.yml`**: Sets up Node 22, runs `npm ci`, lint, optional typecheck, `npm run build`, uploads the `dist/` artifact, and builds/pushes the Docker image to GHCR on `main` pushes.

### Deploy Workflow

The `deploy.yml` workflow triggers via `workflow_run` whenever any of the six CI workflows completes on `main`. Before deploying, it queries the GitHub API to confirm that **all six CI workflows have passed** for the same commit SHA. Only then does it SSH into the VM and run:

```bash
cd /home/anthonytoyco/app/hatchloom-backend
git pull --ff-only origin main
docker compose up -d --build
docker compose ps
```

#### Required GitHub Secrets

| Secret        | Description                                     |
| ------------- | ----------------------------------------------- |
| `DEPLOY_HOST` | Public IP address of the Google Cloud VM        |
| `DEPLOY_USER` | SSH username on the VM                          |
| `DEPLOY_KEY`  | Private SSH key (RSA-4096) authorized on the VM |
