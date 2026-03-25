# LaunchPad Service

LaunchPad is the student entrepreneurship workspace microservice for Hatchloom.
It owns Sandboxes, SideHustles, Business Model Canvases, Teams, and Positions.
It exposes one public endpoint (Position Status Interface) consumed by ConnectHub.

## Prerequisites

- Java 21 (JDK)
- Apache Maven (or use the included `./backend/mvnw` wrapper)
- Docker and Docker Compose (for containerised runs)
- A running Auth service at `http://localhost:8081` only if you run without the dev override compose file

## Run locally (native)

Requires a local PostgreSQL instance. Spring Boot Docker Compose integration
will auto-start the `compose.yaml` Postgres service when you run:

```bash
cd backend && ./mvnw spring-boot:run
```

The service starts on port **8082** (mapped from container port 8080).

## Run with Docker (development, recommended)

Builds the images and starts Postgres + LaunchPad + Frontend with dev auth bypass enabled:

```bash
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up --build
```

Services will be available at:

- Frontend SPA: `http://localhost:4173`
- LaunchPad API: `http://localhost:8082`
- Postgres: `localhost:5432`

In this mode, `docker-compose.dev.yaml` sets `SPRING_PROFILES_ACTIVE=dev`, so the external Auth service is not required for local development.

The frontend container serves SPA routes and proxies API traffic from `/api/launchpad/*` to the backend `/launchpad/*`. This prevents refreshes on `/launchpad/...` client routes from being mistaken as backend requests.

## Run with Docker (base compose only)

Use this only when you intentionally want normal JWT validation behavior:

```bash
docker compose -f docker-compose.yaml up --build
```

In this mode, protected endpoints require the Auth service to be reachable at `http://auth:8081` inside Docker.

## Run tests

Unit tests only (no database required):

```bash
cd backend && ./mvnw test
```

Integration tests (requires a running Postgres):

```bash
cd backend && ./mvnw test -Dgroups=integration \
  -DSPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/launchpad_db \
  -DSPRING_DATASOURCE_USERNAME=launchpad_user \
  -DSPRING_DATASOURCE_PASSWORD=launchpad_pass
```

## Environment variables

| Variable                                               | Default (local)         | Docker value                                   |
| ------------------------------------------------------ | ----------------------- | ---------------------------------------------- |
| `SPRING_DATASOURCE_URL`                                | (Spring Docker Compose) | `jdbc:postgresql://postgres:5432/launchpad_db` |
| `SPRING_DATASOURCE_USERNAME`                           | `launchpad_user`        | `launchpad_user`                               |
| `SPRING_DATASOURCE_PASSWORD`                           | `launchpad_pass`        | `launchpad_pass`                               |
| `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI` | `http://localhost:8081` | `http://auth:8081`                             |
| `SERVER_PORT`                                          | `8080`                  | `8080` (host-mapped to `8082`)                 |

## Cross-service dependencies

| Dependency   | Direction                  | Details                                                                                                                  |
| ------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Auth service | LaunchPad validates JWTs   | `issuer-uri` must point to the Auth service OIDC discovery endpoint. LaunchPad does NOT issue tokens.                    |
| ConnectHub   | ConnectHub calls LaunchPad | `GET /launchpad/positions/{positionId}/status` - public, no token required. Returns `"OPEN"`, `"FILLED"`, or `"CLOSED"`. |

## API documentation

- Static docs: [API_DOCS.md](API_DOCS.md)
- Interactive (Swagger UI, requires running service): `http://localhost:8082/swagger-ui.html`

## Known issues

- The Auth service is owned by Sub-Pack Q1 and is not included in this `compose.yaml`.
  When running `docker compose -f docker-compose.yaml up` from this directory, JWT validation for protected
  endpoints will fail because `http://auth:8081` is unreachable. The full-platform
  Docker Compose (integration sprint deliverable) must add the Auth service.
- LaunchPad performs JWT issuer discovery on startup. If Auth is unreachable at startup
  time inside Docker, LaunchPad may fail to start. Mitigation: add `depends_on: auth`
  in the full-platform compose file once Auth is available.
