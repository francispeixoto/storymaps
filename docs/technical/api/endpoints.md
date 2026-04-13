# API Documentation

This section documents the REST API endpoints for StoryMaps.

## Overview

- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`

## Endpoints

### Maps

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/maps` | Get all maps |
| GET | `/maps/:id` | Get map by ID |
| POST | `/maps` | Create new map |
| PUT | `/maps/:id` | Update map |
| DELETE | `/maps/:id` | Delete map |

### Activities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/activities` | Get all activities (optionally filter by map_id) |
| GET | `/activities/:id` | Get activity by ID |
| POST | `/activities` | Create new activity |
| PUT | `/activities/:id` | Update activity |
| DELETE | `/activities/:id` | Delete activity |

### Actions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/actions` | Get all actions (optionally filter by activity_id) |
| GET | `/actions/:id` | Get action by ID |
| POST | `/actions` | Create new action |
| PUT | `/actions/:id` | Update action |
| DELETE | `/actions/:id` | Delete action |

### Dependencies

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/actions/:id/dependencies` | Get dependencies for an action |
| POST | `/actions/:id/dependencies` | Add dependency |
| DELETE | `/actions/:id/dependencies/:dependsOnId` | Remove dependency |

---

## Map Endpoints

### GET /maps

Get all maps.

**Response** (200):
```json
[
  {
    "id": 1,
    "uid": "maps-001",
    "name": "Map Management",
    "description": "Core CRUD operations",
    "created_at": "2026-04-13T10:00:00.000Z",
    "updated_at": "2026-04-13T10:00:00.000Z"
  }
]
```

### GET /maps/:id

Get map by ID.

**Response** (200):
```json
{
  "id": 1,
  "uid": "maps-001",
  "name": "Map Management",
  "description": "Core CRUD operations",
  "created_at": "2026-04-13T10:00:00.000Z",
  "updated_at": "2026-04-13T10:00:00.000Z"
}
```

### POST /maps

Create a new map.

**Request**:
```json
{
  "uid": "maps-001",
  "name": "Map Management",
  "description": "Core CRUD operations"
}
```

**Response** (201):
```json
{
  "id": 1,
  "uid": "maps-001",
  "name": "Map Management",
  "description": "Core CRUD operations",
  "created_at": "2026-04-13T10:00:00.000Z",
  "updated_at": "2026-04-13T10:00:00.000Z"
}
```

### PUT /maps/:id

Update a map.

**Request**:
```json
{
  "name": "Map Management (Updated)",
  "description": "Updated description"
}
```

**Response** (200):
```json
{
  "id": 1,
  "uid": "maps-001",
  "name": "Map Management (Updated)",
  "description": "Updated description",
  "created_at": "2026-04-13T10:00:00.000Z",
  "updated_at": "2026-04-13T11:00:00.000Z"
}
```

### DELETE /maps/:id

Delete a map. Cascades to delete associated activities and actions.

**Response**: 204 No Content

---

## Activity Endpoints

### GET /activities

Get all activities, optionally filtered by map_id.

**Query Parameters**:
- `map_id` (optional): Filter by map

**Example**: `GET /activities?map_id=1`

**Response** (200):
```json
[
  {
    "id": 1,
    "uid": "maps-001_act_001",
    "map_id": 1,
    "name": "Create new map",
    "priority": "Need",
    "created_at": "2026-04-13T10:00:00.000Z",
    "updated_at": "2026-04-13T10:00:00.000Z"
  }
]
```

### POST /activities

Create a new activity.

**Request**:
```json
{
  "uid": "maps-001_act_001",
  "map_id": 1,
  "name": "Create new map",
  "priority": "Need"
}
```

**Response** (201):
```json
{
  "id": 1,
  "uid": "maps-001_act_001",
  "map_id": 1,
  "name": "Create new map",
  "priority": "Need",
  "created_at": "2026-04-13T10:00:00.000Z",
  "updated_at": "2026-04-13T10:00:00.000Z"
}
```

### PUT /activities/:id

Update an activity.

**Request**:
```json
{
  "name": "Create new map (Updated)",
  "priority": "Want"
}
```

**Response** (200):
```json
{
  "id": 1,
  "uid": "maps-001_act_001",
  "map_id": 1,
  "name": "Create new map (Updated)",
  "priority": "Want",
  "created_at": "2026-04-13T10:00:00.000Z",
  "updated_at": "2026-04-13T11:00:00.000Z"
}
```

### DELETE /activities/:id

Delete an activity. Cascades to delete associated actions.

**Response**: 204 No Content

---

## Action Endpoints

### GET /actions

Get all actions, optionally filtered by activity_id.

**Query Parameters**:
- `activity_id` (optional): Filter by activity

**Example**: `GET /actions?activity_id=1`

**Response** (200):
```json
[
  {
    "id": 1,
    "uid": "maps-001_act_001_act_001",
    "activity_id": 1,
    "name": "Define map name",
    "actor": "PM",
    "priority": "Need",
    "description": "The user defines a unique name",
    "created_at": "2026-04-13T10:00:00.000Z",
    "updated_at": "2026-04-13T10:00:00.000Z"
  }
]
```

### POST /actions

Create a new action.

**Request**:
```json
{
  "uid": "maps-001_act_001_act_001",
  "activity_id": 1,
  "name": "Define map name",
  "actor": "PM",
  "priority": "Need",
  "description": "The user defines a unique name"
}
```

**Response** (201):
```json
{
  "id": 1,
  "uid": "maps-001_act_001_act_001",
  "activity_id": 1,
  "name": "Define map name",
  "actor": "PM",
  "priority": "Need",
  "description": "The user defines a unique name",
  "created_at": "2026-04-13T10:00:00.000Z",
  "updated_at": "2026-04-13T10:00:00.000Z"
}
```

### PUT /actions/:id

Update an action.

**Request**:
```json
{
  "name": "Define map name (Updated)",
  "priority": "Want"
}
```

**Response** (200):
```json
{
  "id": 1,
  "uid": "maps-001_act_001_act_001",
  "activity_id": 1,
  "name": "Define map name (Updated)",
  "actor": "PM",
  "priority": "Want",
  "description": "The user defines a unique name",
  "created_at": "2026-04-13T10:00:00.000Z",
  "updated_at": "2026-04-13T11:00:00.000Z"
}
```

### DELETE /actions/:id

Delete an action. Cascades to delete associated dependencies.

**Response**: 204 No Content

---

## Dependency Endpoints

### GET /actions/:id/dependencies

Get dependencies for an action.

**Response** (200):
```json
[
  {
    "id": 2,
    "action_id": 1,
    "depends_on_action_id": 2,
    "depends_on": {
      "id": 2,
      "uid": "maps-001_act_001_act_002",
      "name": "Add description"
    }
  }
]
```

### POST /actions/:id/dependencies

Add a dependency to an action.

**Request**:
```json
{
  "depends_on_action_id": 2
}
```

**Response** (201):
```json
{
  "id": 1,
  "action_id": 1,
  "depends_on_action_id": 2
}
```

### DELETE /actions/:id/dependencies/:dependsOnId

Remove a dependency.

**Response**: 204 No Content

---

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |