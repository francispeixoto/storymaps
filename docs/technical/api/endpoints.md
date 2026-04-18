# API Documentation

This section documents the REST API endpoints for StoryMaps.

## Overview

- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`

## Endpoints

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

### Maps

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/maps` | Get all maps |
| GET | `/maps/:id` | Get map by ID |
| POST | `/maps` | Create new map |
| PUT | `/maps/:id` | Update map |
| DELETE | `/maps/:id` | Delete map |

### Contexts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contexts` | Get all contexts |
| GET | `/contexts/:id` | Get context by ID |
| GET | `/contexts/:id/full` | Get context with all maps |
| POST | `/contexts` | Create new context |
| PUT | `/contexts/:id` | Update context |
| DELETE | `/contexts/:id` | Delete context |
| GET | `/contexts/:id/maps` | Get maps in context |
| POST | `/contexts/:id/maps` | Add map to context |
| DELETE | `/contexts/:id/maps/:mapId` | Remove map from context |

### Activities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/activities` | Get all activities (optionally filter by map_id) |
| GET | `/activities/:id` | Get activity by ID |
| POST | `/activities` | Create new activity |
| PUT | `/activities/:id` | Update activity |
| DELETE | `/activities/:id` | Delete activity |

### Actors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/actors` | Get all actors |
| GET | `/actors/:id` | Get actor by ID |
| POST | `/actors` | Create new actor |
| PUT | `/actors/:id` | Update actor |
| DELETE | `/actors/:id` | Delete actor |

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

## Context Endpoints

### GET /contexts

Get all contexts. Each context includes calculated health score across all its maps.

**Response** (200):
```json
[
  {
    "id": 1,
    "uid": "context-001",
    "name": "Shopping App",
    "description": "E-commerce platform",
    "is_default": 0,
    "created_at": "2026-04-13T10:00:00.000Z",
    "updated_at": "2026-04-13T10:00:00.000Z",
    "health": {
      "score": 68,
      "totalActions": 25,
      "fullCount": 10,
      "partialCount": 8,
      "noneCount": 7,
      "byPriority": {
        "Need": { "full": 5, "partial": 3, "none": 2, "total": 10, "score": 65 },
        "Want": { "full": 4, "partial": 3, "none": 3, "total": 10, "score": 55 },
        "Nice": { "full": 1, "partial": 2, "none": 2, "total": 5, "score": 40 }
      }
    }
  }
]
```

### GET /contexts/:id

Get context by ID.

**Response** (200):
```json
{
  "id": 1,
  "uid": "context-001",
  "name": "Shopping App",
  "description": "E-commerce platform",
  "is_default": 0,
  "created_at": "2026-04-13T10:00:00.000Z",
  "updated_at": "2026-04-13T10:00:00.000Z",
  "health": {
    "score": 68,
    "totalActions": 25,
    "fullCount": 10,
    "partialCount": 8,
    "noneCount": 7
  }
}
```

### GET /contexts/:id/full

Get context with all its associated maps. Each map includes its own health score.

**Response** (200):
```json
{
  "id": 1,
  "uid": "context-001",
  "name": "Shopping App",
  "description": "E-commerce platform",
  "is_default": 0,
  "created_at": "2026-04-13T10:00:00.000Z",
  "updated_at": "2026-04-13T10:00:00.000Z",
  "health": {
    "score": 68,
    "totalActions": 25
  },
  "maps": [
    {
      "id": 1,
      "uid": "maps-001",
      "name": "Cart",
      "description": "Shopping cart functionality",
      "health": {
        "score": 85,
        "totalActions": 10
      }
    },
    {
      "id": 2,
      "uid": "maps-002",
      "name": "Checkout",
      "description": "Payment flow",
      "health": {
        "score": 45,
        "totalActions": 15
      }
    }
  ]
}
```

### POST /contexts

Create a new context.

**Request**:
```json
{
  "name": "Mobile App",
  "description": "iOS and Android apps"
}
```

**Response** (201):
```json
{
  "id": 2,
  "uid": "context-002",
  "name": "Mobile App",
  "description": "iOS and Android apps",
  "is_default": 0,
  "created_at": "2026-04-13T10:00:00.000Z",
  "updated_at": "2026-04-13T10:00:00.000Z"
}
```

### PUT /contexts/:id

Update a context.

**Request**:
```json
{
  "name": "Mobile App (Updated)",
  "description": "Updated description"
}
```

**Response** (200):
```json
{
  "id": 2,
  "uid": "context-002",
  "name": "Mobile App (Updated)",
  "description": "Updated description",
  "is_default": 0,
  "created_at": "2026-04-13T10:00:00.000Z",
  "updated_at": "2026-04-13T11:00:00.000Z"
}
```

### DELETE /contexts/:id

Delete a context. Removes associations but does not delete maps.

**Response**: 204 No Content

### GET /contexts/:id/maps

Get all maps in a context.

**Response** (200):
```json
[
  {
    "id": 1,
    "uid": "maps-001",
    "name": "Cart",
    "description": "Shopping cart functionality"
  }
]
```

### POST /contexts/:id/maps

Add an existing map to a context.

**Request**:
```json
{
  "map_id": 2
}
```

**Response** (201):
```json
{
  "context_id": 1,
  "map_id": 2
}
```

### DELETE /contexts/:id/maps/:mapId

Remove a map from a context. Does not delete the map.

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
  "name": "Create new map"
}
```

**Response** (201):
```json
{
  "id": 1,
  "uid": "maps-001_act_001",
  "map_id": 1,
  "name": "Create new map",
  "created_at": "2026-04-13T10:00:00.000Z",
  "updated_at": "2026-04-13T10:00:00.000Z"
}
```

### PUT /activities/:id

Update an activity.

**Request**:
```json
{
  "name": "Create new map (Updated)"
}
```

**Response** (200):
```json
{
  "id": 1,
  "uid": "maps-001_act_001",
  "map_id": 1,
  "name": "Create new map (Updated)",
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

Get all actions, optionally filtered by activity_id and/or implementation_state. Includes `actor_name` from join with actors table.

**Query Parameters**:
- `activity_id` (optional): Filter by activity
- `implementation_state` (optional): Filter by implementation state (comma-separated values: Full,Partial,None)

**Example**: `GET /actions?activity_id=1&implementation_state=Full,Partial`

**Response** (200):
```json
[
  {
    "id": 1,
    "uid": "maps-001_act_001_act_001",
    "activity_id": 1,
    "actor_id": 1,
    "name": "Define map name",
    "actor_name": "PM",
    "priority": "Need",
    "implementation_state": "Full",
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
  "actor_id": 1,
  "name": "Define map name",
  "priority": "Need",
  "implementation_state": "Full",
  "description": "The user defines a unique name"
}
```

**Response** (201):
```json
{
  "id": 1,
  "uid": "maps-001_act_001_act_001",
  "activity_id": 1,
  "actor_id": 1,
  "name": "Define map name",
  "actor_name": "PM",
  "priority": "Need",
  "implementation_state": "Full",
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
  "actor_id": 2,
  "name": "Define map name (Updated)",
  "priority": "Want",
  "implementation_state": "Partial"
}
```

**Response** (200):
```json
{
  "id": 1,
  "uid": "maps-001_act_001_act_001",
  "activity_id": 1,
  "actor_id": 2,
  "name": "Define map name (Updated)",
  "actor_name": "Developer",
  "priority": "Want",
  "implementation_state": "Partial",
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

## Actor Endpoints

### GET /actors

Get all actors. Each actor includes calculated satisfaction score and action count.

**Response** (200):
```json
[
  {
    "id": 1,
    "uid": "actor-001",
    "name": "PM",
    "description": "Product Manager",
    "created_at": "2026-04-13T10:00:00.000Z",
    "updated_at": "2026-04-13T10:00:00.000Z",
    "satisfaction": 75,
    "action_count": 12
  }
]
```

### GET /actors/:id

Get actor by ID. Includes calculated satisfaction score and action count.

**Response** (200):
```json
{
  "id": 1,
  "uid": "actor-001",
  "name": "PM",
  "description": "Product Manager",
  "created_at": "2026-04-13T10:00:00.000Z",
  "updated_at": "2026-04-13T10:00:00.000Z",
  "satisfaction": 75,
  "action_count": 12
}
```

### POST /actors

Create a new actor.

**Request**:
```json
{
  "uid": "actor-001",
  "name": "PM",
  "description": "Product Manager"
}
```

**Response** (201):
```json
{
  "id": 1,
  "uid": "actor-001",
  "name": "PM",
  "description": "Product Manager",
  "created_at": "2026-04-13T10:00:00.000Z",
  "updated_at": "2026-04-13T10:00:00.000Z",
  "satisfaction": 0,
  "action_count": 0
}
```

### PUT /actors/:id

Update an actor.

**Request**:
```json
{
  "name": "Product Manager",
  "description": "Updated description"
}
```

**Response** (200):
```json
{
  "id": 1,
  "uid": "actor-001",
  "name": "Product Manager",
  "description": "Updated description",
  "created_at": "2026-04-13T10:00:00.000Z",
  "updated_at": "2026-04-13T11:00:00.000Z",
  "satisfaction": 75,
  "action_count": 12
}
```

### DELETE /actors/:id

Delete an actor. Actions using this actor will have their actor_id set to NULL.

**Response**: 204 No Content

---

## Health Check

### GET /health

Health check endpoint.

**Response** (200):
```json
{
  "status": "ok"
}
```

---

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |