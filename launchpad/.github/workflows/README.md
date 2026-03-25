# LaunchPad CI Workflow

This directory contains GitHub Actions workflows for the Hatchloom repository.

## launchpad-ci.yml

Workflow file: [launchpad-ci.yml](launchpad-ci.yml)

### Trigger conditions

- Push to `main` when LaunchPad backend files change (`backend/src/**`, `backend/pom.xml`, `backend/Dockerfile`, etc.)
- Pull request to `main` when LaunchPad backend files change (`backend/src/**`, `backend/pom.xml`, `backend/Dockerfile`, etc.)

### Jobs

1. `test`

- Starts a PostgreSQL 16 service container
- Runs `./mvnw test` from `backend/`
- Uploads Surefire reports as artifacts (always)

1. `build-docker`

- Runs only on push to `main` after `test` passes
- Builds `Dockerfile` from `backend/`
- Pushes image tags to GHCR:
  - `ghcr.io/<owner>/hatchloom-launchpad:latest`
  - `ghcr.io/<owner>/hatchloom-launchpad:<commit-sha>`

### Notes

- The workflow is intentionally scoped to LaunchPad paths to avoid running for unrelated service changes.
- Auth service is not started in CI: LaunchPad tests run with an explicit issuer URI value in workflow environment variables.

## frontend-ci.yml

Workflow file: [frontend-ci.yml](frontend-ci.yml)

### Trigger conditions

- Push to `main` when frontend files change (`frontend/**`)
- Pull request to `main` when frontend files change (`frontend/**`)

### Jobs

1. `test`

- Sets up Node.js 22 with npm cache
- Runs `npm ci`, `npm run lint`, `npm run typecheck`, and `npm run build` from `frontend/`
- Uploads built frontend assets (`frontend/dist/**`) as artifacts (always)

1. `build-docker`

- Runs only on push to `main` after `test` passes
- Builds `Dockerfile` from `frontend/`
- Pushes image tags to GHCR:
  - `ghcr.io/<owner>/hatchloom-frontend:latest`
  - `ghcr.io/<owner>/hatchloom-frontend:<commit-sha>`
