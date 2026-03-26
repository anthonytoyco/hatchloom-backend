# HatchLoom Backend

HatchLoom is an education platform monorepo composed of three microservices and their frontends, orchestrated together via Docker Compose.

## Services

| Service | Description | API Port | Frontend Port |
|---|---|---|---|
| [user-service](./user-service/) | Authentication and user profile management | 8081 | 3000 |
| [launchpad](./launchpad/) | Student entrepreneurship workspace (Sandboxes, SideHustles, BMCs, Teams) | 8082 | 4173 |
| [connecthub](./connecthub/) | Social feed, posts, classified listings, and messaging | 8083 | 5173 |

A pgAdmin instance is also available at **http://localhost:5050** for database management.

## Prerequisites

- Docker and Docker Compose
- Java 21+ (for running services locally without Docker)
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

| URL | Service |
|---|---|
| http://localhost:3000 | User Service Frontend |
| http://localhost:4173 | LaunchPad Frontend |
| http://localhost:5173 | ConnectHub Frontend |
| http://localhost:8081 | User Service API |
| http://localhost:8082 | LaunchPad API |
| http://localhost:8083 | ConnectHub API |
| http://localhost:5050 | pgAdmin |

## Running Services Individually

Each service can be run independently. See the README in each service directory for details:

- [user-service/README.md](./user-service/README.md)
- [launchpad/README.md](./launchpad/README.md)
- [connecthub/README.md](./connecthub/README.md)

## API Documentation

- [User Service API](./user-service/API_DOCUMENTATION.md)
- [LaunchPad API](./launchpad/API_DOCS.md)
- [ConnectHub API](./connecthub/API_DOCUMENTATION.md)
