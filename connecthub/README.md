# Connecthub

Connecthub is a microservice for the HatchLoom Inc education platform that serves the responsibility for users to be able to publish different kinds of posts (share, announcement, and achievement), but to also create classified posts, essentially job postings for any side hustles that they have active.

## API Documentation

The API documentation can be found at [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## Run Steps

### 1. Setup environment

Copy environment template and change environment variables to your choice.

```bash
cp .env.example .env
```

### 2. Build and start the services

Open Docker and run the following command to build and start the services.

```bash
docker-compose up -d --build
```

This command will build the Docker images, such as the Connecthub service and the Database service, and start the images inside the container.

The application will now be running on http://localhost:8080

### 3. Run Test Cases

Run unit tests:

```bash
cd backend
./mvnw test
```

Run integration and repository tests:

```bash
cd backend
./mvnw verify
```

`test` runs the fast unit/web slice tests. `verify` runs the integration/repository suites through Failsafe.

### 4. Stop the services

To stop the services, run the following command:

```bash
docker-compose down
```

---

## Requirements

- Java 25
- PostgreSQL 14
- Maven 3.9+
- Docker
- Docker Compose
