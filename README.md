# HatchLoom Quebec

The HatchLoom Quebec subpack is an education platform monorepo composed of three microservices and their frontends, orchestrated together via Docker Compose.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Services](#services)
3. [Cross-Service Communication](#cross-service-communication)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Running the Full Stack](#running-the-full-stack)
7. [Running Services Individually](#running-services-individually)
8. [API Documentation](#api-documentation)
9. [Deployment (Google Cloud VM)](#deployment-google-cloud-vm)
10. [CI/CD (GitHub Actions)](#cicd-github-actions)

---

## System Architecture

The subpack is composed of three independently deployable microservices, each with its own frontend SPA, backend Spring Boot API, and PostgreSQL database. There is no API gateway. Each frontend proxies its own `/api/*` traffic to its backend, and JWT authentication is enforced independently by every backend.

![System Component Diagram](diagrams/component_overview.png)

> Source: [diagrams/component_overview.puml](diagrams/component_overview.puml)

### Components

| Component               | Technology                    | Function                                                                                                           |
| ----------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **auth-frontend**       | React + Vite, served by nginx | Login, registration, profile management UI                                                                         |
| **auth-service**        | Spring Boot 3, Java 25        | Issues JWT access/refresh tokens (RS256), exposes OIDC discovery + JWKS endpoints, manages user profiles and roles |
| **auth-postgres**       | PostgreSQL 16                 | Stores user accounts, roles, and profiles                                                                          |
| **launchpad-frontend**  | React + Vite, served by nginx | Student workspace UI: sandboxes, side hustles, BMC editor, team management                                         |
| **launchpad-service**   | Spring Boot 3, Java 25        | Sandboxes, SideHustles, Business Model Canvases, Teams, Positions; validates JWTs via auth-service JWKS            |
| **launchpad-postgres**  | PostgreSQL 16                 | Stores sandboxes, side_hustles, bmc_sections, teams, positions                                                     |
| **connecthub-frontend** | React + Vite, served by nginx | Social feed UI: posts, classified listings, messaging                                                              |
| **connecthub-service**  | Spring Boot 3, Java 25        | Feed posts, feed actions, classified posts, messaging, notifications; validates JWTs via auth-service JWKS         |
| **connecthub-postgres** | PostgreSQL 16                 | Stores posts, feed_actions, classified_posts, conversations, messages, notifications                               |
| **auth-pgadmin**        | pgAdmin 4                     | Web-based database management (dev/ops use)                                                                        |

### User Roles

The system supports six roles, enforced via RBAC in auth-service:

`STUDENT` · `PARENT` · `SCHOOL_TEACHER` · `SCHOOL_ADMIN` · `HATCHLOOM_TEACHER` · `HATCHLOOM_ADMIN`

---

## Services

| Service                         | Description                                                              | API Port | Frontend Port |
| ------------------------------- | ------------------------------------------------------------------------ | -------- | ------------- |
| [user-service](./user-service/) | Authentication and user profile management                               | 8081     | 3000          |
| [launchpad](./launchpad/)       | Student entrepreneurship workspace (Sandboxes, SideHustles, BMCs, Teams) | 8082     | 4173          |
| [connecthub](./connecthub/)     | Social feed, posts, classified listings, and messaging                   | 8083     | 5173          |

A pgAdmin instance is also available at **http://localhost:5050** for database management.

---

## Cross-Service Communication

Services communicate over the internal Docker network. There are two integration points:

### 1. JWT Validation (auth-service → launchpad-service, connecthub-service)

auth-service issues RS256 JWT access tokens and exposes a standard OIDC discovery endpoint. Both launchpad-service and connecthub-service validate incoming Bearer tokens by fetching the public key from auth-service's JWKS endpoint - they do not share a secret and do not talk to auth-service at request time.

```
Browser
  │  Authorization: Bearer <JWT>
  ▼
launchpad-service / connecthub-service
  │  GET /.well-known/jwks.json  (once, cached)
  ▼
auth-service (:8081)
  │  { "keys": [ RSA public key (RS256) ] }
  ◄──────────────────────────────────────
```

**Endpoints provided by auth-service:**

| Endpoint                                | Description                             |
| --------------------------------------- | --------------------------------------- |
| `GET /.well-known/openid-configuration` | OIDC discovery document                 |
| `GET /.well-known/jwks.json`            | RSA public key set for JWT verification |

### 2. Position Status Interface (launchpad-service → connecthub-service)

When a user creates a classified post in ConnectHub, the service validates that the referenced LaunchPad position exists and is `OPEN` by calling a public endpoint on launchpad-service. This call requires no authentication token.

```
connecthub-service
  │  GET /launchpad/positions/{positionId}/status
  ▼
launchpad-service (:8082)
  │  "OPEN" | "FILLED" | "CLOSED"
  ◄──────────────────────────────
```

This is the only synchronous service-to-service call in the system. ConnectHub uses a `LaunchPadClient` (RestTemplate) configured with `LAUNCHPAD_SERVICE_URL` from the environment.

**Position status values:**

| Status   | Meaning                        |
| -------- | ------------------------------ |
| `OPEN`   | Accepting applicants           |
| `FILLED` | Position has been filled       |
| `CLOSED` | Manually closed by the student |

### Request flow summary

```
User Browser
  │
  │ HTTPS
  ▼
Caddy (reverse proxy, TLS termination)
  │
  ├─► auth-frontend (:3000)
  │       │  /api/* → auth-service (:8081)
  │       │              └─► auth-postgres (:5433)
  │
  ├─► launchpad-frontend (:4173)
  │       │  /api/* → launchpad-service (:8082)
  │       │              ├─► launchpad-postgres (:5432)
  │       │              └─► auth-service JWKS (token validation, cached)
  │
  └─► connecthub-frontend (:5173)
          │  /api/* → connecthub-service (:8083)
          │              ├─► connecthub-postgres (:5434)
          │              ├─► auth-service JWKS (token validation, cached)
          │              └─► launchpad-service position status (on classified post creation)
```

---

## Installation

### Prerequisites

Ensure the following are installed before proceeding:

| Tool           | Minimum version | Notes                                                                        |
| -------------- | --------------- | ---------------------------------------------------------------------------- |
| Docker         | 24+             | Required for all container-based runs                                        |
| Docker Compose | v2 (plugin)     | Included with Docker Desktop; `docker compose version` to verify             |
| Java (JDK)     | 25              | Only required to run backends natively without Docker                        |
| Maven          | 3.9+            | Only required to run backends natively; or use the included `./mvnw` wrapper |
| Node.js        | 22+             | Only required to run frontends natively without Docker                       |
| Git            | any             | To clone the repository                                                      |

**Verify Docker Compose plugin:**

```bash
docker compose version
# Docker Compose version v2.x.x
```

### Clone the repository

```bash
git clone https://github.com/anthonytoyco/hatchloom-backend.git
cd hatchloom-backend
```

---

## Configuration

All services are configured through a single `.env` file at the repository root. Docker Compose reads this file automatically.

```bash
cp .env.example .env
```

Open `.env` and set values appropriate for your environment. The table below lists every variable:

| Variable                          | Default (`.env.example`)        | Description                                                                      |
| --------------------------------- | ------------------------------- | -------------------------------------------------------------------------------- |
| `LAUNCHPAD_DB`                    | `launchpad_db`                  | Launchpad PostgreSQL database name                                               |
| `LAUNCHPAD_USER`                  | `launchpad_user`                | Launchpad PostgreSQL username                                                    |
| `LAUNCHPAD_PASSWORD`              | `changeme`                      | Launchpad PostgreSQL password                                                    |
| `AUTH_DB`                         | `user_service_db`               | Auth PostgreSQL database name                                                    |
| `AUTH_USER`                       | `auth_user`                     | Auth PostgreSQL username                                                         |
| `AUTH_PASSWORD`                   | `changeme`                      | Auth PostgreSQL password                                                         |
| `CONNECTHUB_DB`                   | `connecthub_db`                 | ConnectHub PostgreSQL database name                                              |
| `CONNECTHUB_USER`                 | `connecthub_user`               | ConnectHub PostgreSQL username                                                   |
| `CONNECTHUB_PASSWORD`             | `changeme`                      | ConnectHub PostgreSQL password                                                   |
| `JWT_ACCESS_TOKEN_EXPIRY_MINUTES` | `30`                            | Access token lifetime in minutes                                                 |
| `JWT_REFRESH_TOKEN_EXPIRY_DAYS`   | `7`                             | Refresh token lifetime in days                                                   |
| `JWT_ISSUER_URI`                  | `http://auth-service:8080`      | JWT issuer URI (internal Docker network address)                                 |
| `AUTH_SERVICE_URL`                | `http://auth-service:8080`      | Internal URL for auth-service (used by launchpad and connecthub for JWKS)        |
| `LAUNCHPAD_SERVICE_URL`           | `http://launchpad-service:8080` | Internal URL for launchpad-service (used by connecthub's LaunchPadClient)        |
| `PGADMIN_DEFAULT_EMAIL`           | `admin@example.com`             | pgAdmin login email                                                              |
| `PGADMIN_DEFAULT_PASSWORD`        | `changeme`                      | pgAdmin login password                                                           |
| `VITE_API_BASE_URL`               | `/api`                          | API base path baked into frontend builds (keep as `/api` when using nginx proxy) |
| `VITE_AUTH_URL`                   | `http://localhost:3000`         | Public URL of auth-frontend (used for login redirects from other frontends)      |
| `VITE_CONNECTHUB_URL`             | `http://localhost:5173`         | Public URL of connecthub-frontend                                                |
| `VITE_CONNECTHUB_API_URL`         | `http://localhost:8083`         | Public URL of ConnectHub API (used by LaunchPad to link classified post details) |
| `CORS_ALLOWED_ORIGINS`            | `http://localhost:3000,...`     | Comma-separated list of origins allowed by Spring Boot CORS configuration        |

> **Important:** `VITE_*` variables are baked into the frontend static assets at Docker **build** time. If you change them, you must rebuild the frontend images (`docker compose up --build`).

---

## Running the Full Stack

Build and start all ten containers from the repository root:

```bash
docker compose up --build
```

To run in the background:

```bash
docker compose up -d --build
```

Wait for all containers to become healthy (auth-service takes up to ~30 seconds on first start while Spring generates the RSA key pair):

```bash
docker compose ps
```

To stop and remove all containers:

```bash
docker compose down
```

To also remove persistent database volumes:

```bash
docker compose down -v
```

### Local service URLs

| URL                   | Service               |
| --------------------- | --------------------- |
| http://localhost:3000 | User Service Frontend |
| http://localhost:4173 | LaunchPad Frontend    |
| http://localhost:5173 | ConnectHub Frontend   |
| http://localhost:8081 | User Service API      |
| http://localhost:8082 | LaunchPad API         |
| http://localhost:8083 | ConnectHub API        |
| http://localhost:5050 | pgAdmin               |

### Startup order

Docker Compose enforces the following startup dependency chain:

```
auth-postgres (healthy)
    └─► auth-service (healthy - OIDC endpoint reachable)
            ├─► launchpad-postgres (healthy)
            │       └─► launchpad-service
            │               └─► launchpad-frontend
            └─── connecthub-postgres (healthy)
                     └─► connecthub-service
                             └─► connecthub-frontend
```

---

## Running Services Individually

Each service can be run independently. See the service-level README for details:

- [user-service/README.md](./user-service/README.md)
- [launchpad/README.md](./launchpad/README.md)
- [connecthub/README.md](./connecthub/README.md)

### Running a backend natively (example: launchpad)

```bash
# Start only the database
cd launchpad
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d launchpad-postgres

# Run the backend (dev profile skips external auth requirement)
cd backend
./mvnw spring-boot:run
```

The dev profile (`docker-compose.dev.yaml`) sets `SPRING_PROFILES_ACTIVE=dev`, which bypasses the external JWT validation requirement so the auth-service does not need to be running locally.

### Running tests

**Backend unit tests (no database required):**

```bash
# user-service
cd user-service && ./mvnw test

# launchpad
cd launchpad/backend && ./mvnw test

# connecthub
cd connecthub/backend && ./mvnw test
```

**Launchpad integration tests (requires running Postgres):**

```bash
cd launchpad/backend && ./mvnw test -Dgroups=integration \
  -DSPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/launchpad_db \
  -DSPRING_DATASOURCE_USERNAME=launchpad_user \
  -DSPRING_DATASOURCE_PASSWORD=launchpad_pass
```

---

## API Documentation

Interactive Swagger UI docs are available when any service is running:

| Service      | Swagger UI                            | OpenAPI JSON                      |
| ------------ | ------------------------------------- | --------------------------------- |
| User Service | http://localhost:8081/swagger-ui.html | http://localhost:8081/v3/api-docs |
| LaunchPad    | http://localhost:8082/swagger-ui.html | http://localhost:8082/v3/api-docs |
| ConnectHub   | http://localhost:8083/swagger-ui.html | http://localhost:8083/v3/api-docs |

Static API reference:

- [User Service API](./user-service/API_DOCUMENTATION.md)
- [LaunchPad API](./launchpad/API_DOCUMENTATION.md)
- [ConnectHub API](./connecthub/API_DOCUMENTATION.md)

---

## Deployment (Google Cloud VM)

The production stack runs on a **Google Cloud e2-standard-2 VM** (2 vCPUs, 8 GB RAM, Debian 12, `us-central1-a`). All ten containers from the root `docker-compose.yaml` run on the VM, with [Caddy](https://caddyserver.com/) acting as the reverse proxy handling HTTPS termination via Let's Encrypt.

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

Caddy routes each subdomain to the matching frontend container. The frontend nginx configs then proxy `/api/*` traffic to their Spring Boot backend on the internal Docker network. Backend services and databases are not publicly exposed.

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

### Deployment steps

See [claude/0-deployment-guide-start-here.md](./claude/0-deployment-guide-start-here.md) for the full step-by-step guide, which covers VM provisioning, Docker setup, Caddy configuration, SSL, and GitHub Actions secrets.

---

## CI/CD (GitHub Actions)

Every push to `main` (and every pull request targeting `main`) runs six CI workflows in parallel - three for backends and three for frontends. All images are published to **GitHub Container Registry (GHCR)** at `ghcr.io/anthonytoyco/<image-name>`.

### CI Workflows

| Workflow file               | Trigger          | What it does                                                                   |
| --------------------------- | ---------------- | ------------------------------------------------------------------------------ |
| `user-service-backend.yml`  | push / PR → main | Tests with Maven (JWT secret injected), builds & pushes Docker image           |
| `launchpad-backend.yml`     | push / PR → main | Tests with Maven + Postgres 16 service container, builds & pushes Docker image |
| `connecthub-backend.yml`    | push / PR → main | Tests with Maven, builds & pushes Docker image                                 |
| `user-service-frontend.yml` | push / PR → main | Lint, build production bundle, builds & pushes Docker image                    |
| `launchpad-frontend.yml`    | push / PR → main | Lint, typecheck, build production bundle, builds & pushes Docker image         |
| `connecthub-frontend.yml`   | push / PR → main | Lint, build production bundle, builds & pushes Docker image                    |

Two reusable workflow templates keep the CI logic DRY:

- **`_reusable-java-ci.yml`** - Sets up Java 25 (Temurin), runs `./mvnw clean verify`, optionally spins up a Postgres 16 service container, uploads Surefire reports, and builds/pushes the Docker image to GHCR on `main` pushes.
- **`_reusable-node-ci.yml`** - Sets up Node 22, runs `npm ci`, lint, optional typecheck, `npm run build`, uploads the `dist/` artifact, and builds/pushes the Docker image to GHCR on `main` pushes.

### Deploy Workflow

The `deploy.yml` workflow triggers via `workflow_run` whenever any of the six CI workflows completes on `main`. Before deploying, it queries the GitHub API to confirm that **all six CI workflows have passed** for the same commit SHA. Only then does it SSH into the VM and run:

```bash
cd /home/anthonytoyco/app/hatchloom-backend
git pull --ff-only origin main
docker compose up -d --build
docker compose ps
```

### Required GitHub Secrets

| Secret        | Description                                     |
| ------------- | ----------------------------------------------- |
| `DEPLOY_HOST` | Public IP address of the Google Cloud VM        |
| `DEPLOY_USER` | SSH username on the VM                          |
| `DEPLOY_KEY`  | Private SSH key (RSA-4096) authorized on the VM |

### Service Responsibilities

| Service                | Key Features                                                                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **auth-service**       | JWT issuance (RS256, access + refresh tokens), OIDC JWKS endpoint, role-based permission strategy, user profile CRUD, parent–student linking                                                           |
| **launchpad-service**  | Sandbox workspaces + tools, SideHustle venture lifecycle, Business Model Canvas (9 sections), team membership, position lifecycle (OPEN → FILLED → CLOSED), aggregated home view                       |
| **connecthub-service** | Multi-type feed (share / announcement / achievement), likes + nested comments, classified posts linked to LaunchPad positions, applications, 1-to-1 messaging, notifications, classified subscriptions |

### Databases

Each service owns its own PostgreSQL instance. There is no shared database.

| Database              | Service            | Notable Tables                                                                                                                                                                  |
| --------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth-postgres`       | auth-service       | `app_users`, `students`, `parents`, `school_teachers`, `school_admins`, `hatchloom_teachers`, `hatchloom_admins`, `user_profiles`, `academic_profiles`, `professional_profiles` |
| `launchpad-postgres`  | launchpad-service  | `sandboxes`, `sandbox_tools`, `side_hustles`, `bmc_sections`, `teams`, `team_members`, `positions`                                                                              |
| `connecthub-postgres` | connecthub-service | `posts`, `feed_actions`, `classified_posts`, `classified_post_applications`, `classified_subscriptions`, `conversations`, `messages`, `notifications`                           |

### Inter-Service Communication

ConnectHub calls the LaunchPad **Position Status API** (`GET /positions/{positionId}/status`) via `LaunchPadClient` (Spring `RestTemplate`) to verify a position is `OPEN` before a classified post can be created for it.
