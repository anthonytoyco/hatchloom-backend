# User Service

User Service microservice for the Hatchloom platform.

## Quick Start

Start all services (database, backend, and frontend) with Docker:
```
docker-compose up -d --build
```

The service will be available at http://localhost:8080
The front end will be available at http://localhost:3000

To run the backend natively (e.g. during development), start only the database first:
```
docker-compose up -d postgres
```
Then run the application:
```
./mvnw spring-boot:run
```
## Documentation

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference and usage examples.

## Requirements

Java 25+
Maven 3.9+
PostgreSQL 15 (via Docker)
Docker and Docker Compose

