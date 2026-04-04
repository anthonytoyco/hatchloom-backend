# LaunchPad Service - API Documentation

---

## Authentication

All endpoints require `Authorization: Bearer <token>` **except**:

| Endpoint                                       | Reason                                                    |
| ---------------------------------------------- | --------------------------------------------------------- |
| `GET /launchpad/positions/{positionId}/status` | Public - Position Status Interface consumed by ConnectHub |
| `GET /actuator/health`                         | Health probe - used by Docker health checks               |
| `GET /actuator/info`                           | Service info probe                                        |
| `GET /swagger-ui.html`, `/swagger-ui/**`       | Interactive API docs                                      |
| `GET /v3/api-docs`, `/v3/api-docs/**`          | OpenAPI JSON spec                                         |

Tokens are JWTs issued by the Auth service (`http://localhost:8081` locally, `http://auth-service:8080` in Docker). LaunchPad validates but does not issue tokens.

---

## Base URL

| Environment            | URL                                            |
| ---------------------- | ---------------------------------------------- |
| Local (Docker Compose) | `http://localhost:8082`                        |
| Production             | `https://launchpad.hatchloom.anthonytoyco.com` |

---

## Endpoints

---

### LaunchPad Home

#### `GET /launchpad/home/{userId}`

Returns the aggregated home view for a student (Facade pattern via `LaunchPadAggregator`).

**Path parameters**

| Name     | Type | Description           |
| -------- | ---- | --------------------- |
| `userId` | UUID | The student's user ID |

**Success response - 200 OK**

```json
{
  "inTheLabCount": 2,
  "liveVenturesCount": 1,
  "sandboxes": [
    {
      "id": "uuid",
      "title": "My Sandbox",
      "description": null,
      "createdAt": "2024-01-15T10:30:00"
    }
  ],
  "sideHustles": [
    {
      "id": "uuid",
      "title": "My Hustle",
      "description": null,
      "status": "LIVE_VENTURE",
      "hasOpenPositions": true,
      "createdAt": "2024-01-15T10:30:00"
    }
  ]
}
```

**Error responses**

| Code | Condition                       |
| ---- | ------------------------------- |
| 401  | Missing or invalid Bearer token |

---

### Sandbox Module

#### `POST /launchpad/sandboxes`

Creates a new Sandbox for a student.

**Request body**

```json
{
  "studentId": "uuid",
  "title": "string (required, max 255)",
  "description": "string (optional)"
}
```

| Field         | Type   | Required | Constraints        |
| ------------- | ------ | -------- | ------------------ |
| `studentId`   | UUID   | Yes      | -                  |
| `title`       | String | Yes      | max 255 characters |
| `description` | String | No       | -                  |

**Success response - 201 Created**

```json
{
  "id": "uuid",
  "studentId": "uuid",
  "title": "My Sandbox",
  "description": "A place to experiment",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

**Error responses**

| Code | Condition                                      |
| ---- | ---------------------------------------------- |
| 400  | Missing `studentId` or blank/oversized `title` |
| 401  | Missing or invalid Bearer token                |

---

#### `GET /launchpad/sandboxes/{sandboxId}`

Returns a single Sandbox by ID.

**Path parameters**

| Name        | Type | Description    |
| ----------- | ---- | -------------- |
| `sandboxId` | UUID | The Sandbox ID |

**Success response - 200 OK**

```json
{
  "id": "uuid",
  "studentId": "uuid",
  "title": "My Sandbox",
  "description": "A place to experiment",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

**Error responses**

| Code | Condition                       |
| ---- | ------------------------------- |
| 401  | Missing or invalid Bearer token |
| 404  | Sandbox not found               |

---

#### `PUT /launchpad/sandboxes/{sandboxId}`

Updates a Sandbox's title and/or description.

**Path parameters**

| Name        | Type | Description    |
| ----------- | ---- | -------------- |
| `sandboxId` | UUID | The Sandbox ID |

**Request body**

```json
{
  "title": "string (required, max 255)",
  "description": "string (optional)"
}
```

**Success response - 200 OK**

```json
{
  "id": "uuid",
  "studentId": "uuid",
  "title": "Updated Title",
  "description": "Updated description",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T11:00:00"
}
```

**Error responses**

| Code | Condition                       |
| ---- | ------------------------------- |
| 400  | Blank or oversized `title`      |
| 401  | Missing or invalid Bearer token |
| 404  | Sandbox not found               |

---

#### `DELETE /launchpad/sandboxes/{sandboxId}`

Deletes a Sandbox.

Cascade behavior:

- Deletes all associated `SandboxTools`
- Deletes all `SideHustles` linked to that sandbox
- SideHustle deletion then cascades to `BusinessModelCanvas`, `Team`, `TeamMembers`, and `Positions`

**Path parameters**

| Name        | Type | Description    |
| ----------- | ---- | -------------- |
| `sandboxId` | UUID | The Sandbox ID |

**Success response - 204 No Content**

**Error responses**

| Code | Condition                       |
| ---- | ------------------------------- |
| 401  | Missing or invalid Bearer token |
| 404  | Sandbox not found               |

---

#### `GET /launchpad/sandboxes?studentId={userId}`

Returns all Sandboxes owned by a student.

**Query parameters**

| Name        | Type | Required | Description           |
| ----------- | ---- | -------- | --------------------- |
| `studentId` | UUID | Yes      | The student's user ID |

**Success response - 200 OK**

```json
[
  {
    "id": "uuid",
    "studentId": "uuid",
    "title": "My Sandbox",
    "description": null,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

**Error responses**

| Code | Condition                       |
| ---- | ------------------------------- |
| 401  | Missing or invalid Bearer token |

---

### SandboxTool Module

#### `POST /launchpad/sandboxes/{sandboxId}/tools`

Adds a tool to a Sandbox.

**Path parameters**

| Name        | Type | Description           |
| ----------- | ---- | --------------------- |
| `sandboxId` | UUID | The parent Sandbox ID |

**Request body**

```json
{
  "toolType": "string (required, max 100)",
  "data": "string (optional)"
}
```

| Field      | Type   | Required | Constraints                    |
| ---------- | ------ | -------- | ------------------------------ |
| `toolType` | String | Yes      | max 100 characters             |
| `data`     | String | No       | Arbitrary JSON or text payload |

**Success response - 201 Created**

```json
{
  "id": "uuid",
  "sandboxId": "uuid",
  "toolType": "CANVAS",
  "data": "{\"key\": \"value\"}",
  "createdAt": "2024-01-15T10:30:00"
}
```

**Error responses**

| Code | Condition                       |
| ---- | ------------------------------- |
| 400  | Blank or oversized `toolType`   |
| 401  | Missing or invalid Bearer token |
| 404  | Sandbox not found               |

---

#### `GET /launchpad/sandboxes/{sandboxId}/tools`

Returns all tools for a Sandbox.

**Path parameters**

| Name        | Type | Description           |
| ----------- | ---- | --------------------- |
| `sandboxId` | UUID | The parent Sandbox ID |

**Success response - 200 OK**

```json
[
  {
    "id": "uuid",
    "sandboxId": "uuid",
    "toolType": "CANVAS",
    "data": null,
    "createdAt": "2024-01-15T10:30:00"
  }
]
```

**Error responses**

| Code | Condition                       |
| ---- | ------------------------------- |
| 401  | Missing or invalid Bearer token |
| 404  | Sandbox not found               |

---

#### `PUT /launchpad/sandboxes/{sandboxId}/tools/{toolId}`

Updates the data payload of a SandboxTool.

**Path parameters**

| Name        | Type | Description           |
| ----------- | ---- | --------------------- |
| `sandboxId` | UUID | The parent Sandbox ID |
| `toolId`    | UUID | The SandboxTool ID    |

**Request body**

```json
{
  "data": "string (optional)"
}
```

**Success response - 200 OK**

```json
{
  "id": "uuid",
  "sandboxId": "uuid",
  "toolType": "CANVAS",
  "data": "{\"updated\": true}",
  "createdAt": "2024-01-15T10:30:00"
}
```

**Error responses**

| Code | Condition                        |
| ---- | -------------------------------- |
| 401  | Missing or invalid Bearer token  |
| 404  | Sandbox or SandboxTool not found |

---

#### `DELETE /launchpad/sandboxes/{sandboxId}/tools/{toolId}`

Removes a tool from a Sandbox.

**Path parameters**

| Name        | Type | Description           |
| ----------- | ---- | --------------------- |
| `sandboxId` | UUID | The parent Sandbox ID |
| `toolId`    | UUID | The SandboxTool ID    |

**Success response - 204 No Content**

**Error responses**

| Code | Condition                        |
| ---- | -------------------------------- |
| 401  | Missing or invalid Bearer token  |
| 404  | Sandbox or SandboxTool not found |

---

### SideHustle Module

#### `POST /launchpad/sidehustles`

Creates a new SideHustle using the Factory Method pattern. Auto-creates an empty BMC and Team.

**Request body**

```json
{
  "studentId": "uuid",
  "sandboxId": "uuid",
  "title": "string (required, max 255)",
  "description": "string (optional)",
  "type": "IN_THE_LAB | LIVE_VENTURE"
}
```

| Field         | Type             | Required | Constraints                                       |
| ------------- | ---------------- | -------- | ------------------------------------------------- |
| `studentId`   | UUID             | Yes      | -                                                 |
| `sandboxId`   | UUID             | Yes      | Must reference an existing Sandbox: 400 if absent |
| `title`       | String           | Yes      | max 255 characters                                |
| `description` | String           | No       | -                                                 |
| `type`        | SideHustleStatus | Yes      | `IN_THE_LAB` or `LIVE_VENTURE`                    |

**Success response - 201 Created**

```json
{
  "id": "uuid",
  "studentId": "uuid",
  "sandboxId": "uuid",
  "title": "My Hustle",
  "description": "Building something cool",
  "status": "IN_THE_LAB",
  "hasOpenPositions": false,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

**Error responses**

| Code | Condition                                                                                 |
| ---- | ----------------------------------------------------------------------------------------- |
| 400  | Missing/blank `title`, missing `sandboxId`, missing/invalid `type`, or `studentId` absent |
| 401  | Missing or invalid Bearer token                                                           |
| 404  | Referenced `sandboxId` does not exist                                                     |

---

#### `GET /launchpad/sidehustles/{sideHustleId}`

Returns a single SideHustle by ID.

**Path parameters**

| Name           | Type | Description       |
| -------------- | ---- | ----------------- |
| `sideHustleId` | UUID | The SideHustle ID |

**Success response - 200 OK**

```json
{
  "id": "uuid",
  "studentId": "uuid",
  "sandboxId": "uuid",
  "title": "My Hustle",
  "description": "Building something cool",
  "status": "LIVE_VENTURE",
  "hasOpenPositions": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-16T09:00:00"
}
```

**Error responses**

| Code | Condition                       |
| ---- | ------------------------------- |
| 401  | Missing or invalid Bearer token |
| 404  | SideHustle not found            |

---

#### `PUT /launchpad/sidehustles/{sideHustleId}`

Updates a SideHustle's title and/or description (metadata only).

**Path parameters**

| Name           | Type | Description       |
| -------------- | ---- | ----------------- |
| `sideHustleId` | UUID | The SideHustle ID |

**Request body**

```json
{
  "title": "string (required, max 255)",
  "description": "string (optional)"
}
```

**Success response - 200 OK**

```json
{
  "id": "uuid",
  "studentId": "uuid",
  "sandboxId": "uuid",
  "title": "Updated Hustle Title",
  "description": "Updated description",
  "status": "IN_THE_LAB",
  "hasOpenPositions": false,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-16T09:00:00"
}
```

**Error responses**

| Code | Condition                       |
| ---- | ------------------------------- |
| 400  | Blank or oversized `title`      |
| 401  | Missing or invalid Bearer token |
| 404  | SideHustle not found            |

---

#### `DELETE /launchpad/sidehustles/{sideHustleId}`

Deletes a SideHustle. Cascades to its BMC, Team, TeamMembers, and Positions.

**Path parameters**

| Name           | Type | Description       |
| -------------- | ---- | ----------------- |
| `sideHustleId` | UUID | The SideHustle ID |

**Success response - 204 No Content**

**Error responses**

| Code | Condition                       |
| ---- | ------------------------------- |
| 401  | Missing or invalid Bearer token |
| 404  | SideHustle not found            |

---

#### `GET /launchpad/sidehustles?studentId={userId}`

Returns all SideHustles owned by a student.

**Query parameters**

| Name        | Type | Required | Description           |
| ----------- | ---- | -------- | --------------------- |
| `studentId` | UUID | Yes      | The student's user ID |

**Success response - 200 OK**

```json
[
  {
    "id": "uuid",
    "studentId": "uuid",
    "sandboxId": "uuid",
    "title": "My Hustle",
    "description": null,
    "status": "IN_THE_LAB",
    "hasOpenPositions": false,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

**Error responses**

| Code | Condition                       |
| ---- | ------------------------------- |
| 401  | Missing or invalid Bearer token |

---

### Business Model Canvas (BMC) Module

#### `GET /launchpad/sidehustles/{sideHustleId}/bmc`

Returns the full Business Model Canvas for a SideHustle.

**Path parameters**

| Name           | Type | Description              |
| -------------- | ---- | ------------------------ |
| `sideHustleId` | UUID | The parent SideHustle ID |

**Success response - 200 OK**

```json
{
  "id": "uuid",
  "sideHustleId": "uuid",
  "keyPartners": null,
  "keyActivities": null,
  "keyResources": null,
  "valuePropositions": "We solve X for Y",
  "customerRelationships": null,
  "channels": null,
  "customerSegments": "Students aged 18-25",
  "costStructure": null,
  "revenueStreams": null
}
```

**Error responses**

| Code | Condition                       |
| ---- | ------------------------------- |
| 401  | Missing or invalid Bearer token |
| 404  | SideHustle not found            |

---

#### `PATCH /launchpad/sidehustles/{sideHustleId}/bmc`

Updates a single BMC section. The caller must own the SideHustle (validated via JWT subject).

**Path parameters**

| Name           | Type | Description              |
| -------------- | ---- | ------------------------ |
| `sideHustleId` | UUID | The parent SideHustle ID |

**Request body**

```json
{
  "section": "value_propositions",
  "content": "We solve X for Y by doing Z"
}
```

| Field     | Type   | Required | Constraints                                        |
| --------- | ------ | -------- | -------------------------------------------------- |
| `section` | String | Yes      | Must be one of the 9 valid keys (case-insensitive) |
| `content` | String | No       | Replaces the current section content               |

**Valid section keys:**

| Key                      | Description            |
| ------------------------ | ---------------------- |
| `key_partners`           | Key Partners           |
| `key_activities`         | Key Activities         |
| `key_resources`          | Key Resources          |
| `value_propositions`     | Value Propositions     |
| `customer_relationships` | Customer Relationships |
| `channels`               | Channels               |
| `customer_segments`      | Customer Segments      |
| `cost_structure`         | Cost Structure         |
| `revenue_streams`        | Revenue Streams        |

**Success response - 200 OK** - full BMC object (same schema as GET)

**Error responses**

| Code | Condition                                   |
| ---- | ------------------------------------------- |
| 400  | Blank `section` or unrecognised section key |
| 401  | Missing or invalid Bearer token             |
| 403  | Caller does not own the SideHustle          |
| 404  | SideHustle not found                        |

---

### Team Module

#### `POST /launchpad/sidehustles/{sideHustleId}/team/members`

Adds a member to the SideHustle team. The caller must own the SideHustle (validated via JWT subject).

**Path parameters**

| Name           | Type | Description              |
| -------------- | ---- | ------------------------ |
| `sideHustleId` | UUID | The parent SideHustle ID |

**Request body**

```json
{
  "userId": "uuid",
  "role": "string (optional)"
}
```

| Field    | Type   | Required | Constraints                 |
| -------- | ------ | -------- | --------------------------- |
| `userId` | UUID   | Yes      | The user to add to the team |
| `role`   | String | No       | Free-text role label        |

**Success response - 201 Created**

```json
{
  "id": "uuid",
  "teamId": "uuid",
  "studentId": "uuid",
  "role": "Developer",
  "joinedAt": "2024-01-15T10:30:00"
}
```

**Error responses**

| Code | Condition                          |
| ---- | ---------------------------------- |
| 400  | Missing `userId`                   |
| 401  | Missing or invalid Bearer token    |
| 403  | Caller does not own the SideHustle |
| 404  | SideHustle not found               |

---

#### `GET /launchpad/sidehustles/{sideHustleId}/team/members`

Returns all members of the SideHustle team.

**Path parameters**

| Name           | Type | Description              |
| -------------- | ---- | ------------------------ |
| `sideHustleId` | UUID | The parent SideHustle ID |

**Success response - 200 OK**

```json
[
  {
    "id": "uuid",
    "teamId": "uuid",
    "studentId": "uuid",
    "role": "Developer",
    "joinedAt": "2024-01-15T10:30:00"
  }
]
```

**Error responses**

| Code | Condition                       |
| ---- | ------------------------------- |
| 401  | Missing or invalid Bearer token |
| 404  | SideHustle not found            |

---

#### `DELETE /launchpad/sidehustles/{sideHustleId}/team/members/{userId}`

Removes a member from the SideHustle team.

**Path parameters**

| Name           | Type | Description                         |
| -------------- | ---- | ----------------------------------- |
| `sideHustleId` | UUID | The parent SideHustle ID            |
| `userId`       | UUID | The user ID of the member to remove |

**Success response - 204 No Content**

**Error responses**

| Code | Condition                           |
| ---- | ----------------------------------- |
| 401  | Missing or invalid Bearer token     |
| 404  | SideHustle or team member not found |

---

### Position Module

#### `POST /launchpad/sidehustles/{sideHustleId}/positions`

Creates a new Position for a SideHustle. Positions start with status `OPEN`. The caller must own the SideHustle (validated via JWT subject).

**Path parameters**

| Name           | Type | Description              |
| -------------- | ---- | ------------------------ |
| `sideHustleId` | UUID | The parent SideHustle ID |

**Request body**

```json
{
  "title": "string (required, max 255)",
  "description": "string (optional)"
}
```

**Success response - 200 OK**

```json
{
  "id": "uuid",
  "sideHustleId": "uuid",
  "title": "Backend Developer",
  "description": "Responsible for API development",
  "status": "OPEN"
}
```

**Error responses**

| Code | Condition                          |
| ---- | ---------------------------------- |
| 400  | Blank or oversized `title`         |
| 401  | Missing or invalid Bearer token    |
| 403  | Caller does not own the SideHustle |
| 404  | SideHustle not found               |

---

#### `GET /launchpad/sidehustles/{sideHustleId}/positions`

Returns all Positions for a SideHustle.

**Path parameters**

| Name           | Type | Description              |
| -------------- | ---- | ------------------------ |
| `sideHustleId` | UUID | The parent SideHustle ID |

**Success response - 200 OK**

```json
[
  {
    "id": "uuid",
    "sideHustleId": "uuid",
    "title": "Backend Developer",
    "description": null,
    "status": "OPEN"
  }
]
```

**Error responses**

| Code | Condition                       |
| ---- | ------------------------------- |
| 401  | Missing or invalid Bearer token |
| 404  | SideHustle not found            |

---

#### `PUT /launchpad/sidehustles/{sideHustleId}/positions/{positionId}/status`

Transitions a Position to a new status (State pattern). Valid transitions:

| From     | To       | Allowed             |
| -------- | -------- | ------------------- |
| `OPEN`   | `FILLED` | Yes                 |
| `OPEN`   | `CLOSED` | Yes                 |
| `FILLED` | any      | No - terminal state |
| `CLOSED` | any      | No - terminal state |

**Path parameters**

| Name           | Type | Description              |
| -------------- | ---- | ------------------------ |
| `sideHustleId` | UUID | The parent SideHustle ID |
| `positionId`   | UUID | The Position ID          |

**Request body**

```json
{
  "status": "FILLED"
}
```

| Field    | Type           | Required | Constraints                   |
| -------- | -------------- | -------- | ----------------------------- |
| `status` | PositionStatus | Yes      | `OPEN`, `FILLED`, or `CLOSED` |

**Success response - 200 OK**

```json
{
  "id": "uuid",
  "sideHustleId": "uuid",
  "title": "Backend Developer",
  "description": null,
  "status": "FILLED"
}
```

**Error responses**

| Code | Condition                                                   |
| ---- | ----------------------------------------------------------- |
| 400  | Missing `status` or invalid transition (e.g. FILLED → OPEN) |
| 401  | Missing or invalid Bearer token                             |
| 403  | Caller does not own the SideHustle                          |
| 404  | Position not found                                          |

---

#### `GET /launchpad/positions/{positionId}/status` PUBLIC

**Position Status Interface - consumed by ConnectHub Classifieds Module.**

Returns the plain-text status of a Position. **No authentication required.** This endpoint must remain public and unauthenticated so ConnectHub containers can call it without a user token.

**Path parameters**

| Name         | Type | Description     |
| ------------ | ---- | --------------- |
| `positionId` | UUID | The Position ID |

**Success response - 200 OK**

```
OPEN
```

Response body is a plain string: `OPEN`, `FILLED`, or `CLOSED`.

**Error responses**

| Code | Condition                                                      |
| ---- | -------------------------------------------------------------- |
| 404  | Position not found (no 401 - this endpoint is unauthenticated) |

---

## Error Response Format

Spring Boot returns errors in the following default format:

```json
{
  "timestamp": "2024-01-15T10:30:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "sandboxId is required to create a SideHustle",
  "path": "/launchpad/sidehustles"
}
```

---

## Cross-Service Contract

ConnectHub's Classifieds Module calls:

```
GET /launchpad/positions/{positionId}/status
```

This endpoint returns a plain string: `"OPEN"`, `"FILLED"`, or `"CLOSED"`.

It **must** remain public and unauthenticated so ConnectHub containers can reach it without a user token (Design Doc §4.1, §4.2). Verify with:

```bash
curl http://localhost:8082/launchpad/positions/<any-uuid>/status
# Must return 404, NOT 401
```

---

## Swagger UI

When the service is running, interactive API docs are available at:

| Environment | URL                                                            |
| ----------- | -------------------------------------------------------------- |
| Local       | `http://localhost:8082/swagger-ui.html`                        |
| Production  | `https://launchpad.hatchloom.anthonytoyco.com/swagger-ui.html` |

OpenAPI JSON spec:

| Environment | URL                                                        |
| ----------- | ---------------------------------------------------------- |
| Local       | `http://localhost:8082/v3/api-docs`                        |
| Production  | `https://launchpad.hatchloom.anthonytoyco.com/v3/api-docs` |
