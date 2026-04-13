# Data Flow

This document describes how data flows through the StoryMaps system.

## Request Lifecycle

### Create a Map

```
1. User fills map form in Angular UI
2. MapService sends POST /api/maps with JSON body
3. Express router maps to mapController.create()
4. Controller validates request body
5. Model inserts into SQLite maps table
6. Model returns inserted record
7. Controller sends 201 response with created map
8. Angular updates UI with new map
```

### Read Maps

```
1. User navigates to map list page
2. MapService sends GET /api/maps
3. Express router maps to mapController.getAll()
4. Model selects all from maps table
5. Controller sends 200 response with map array
6. Angular displays map list
```

### Update Activity

```
1. User edits activity in map editor
2. ActivityService sends PUT /api/activities/:id with JSON body
3. Express router maps to activityController.update()
4. Controller validates request body
5. Model updates SQLite activities table
6. Model returns updated record
7. Controller sends 200 response
8. Angular updates UI
```

### Delete with Cascade

```
1. User deletes a map
2. MapService sends DELETE /api/maps/:id
3. Express router maps to mapController.delete()
4. Model deletes from maps table (CASCADE removes activities/actions)
5. Controller sends 204 No Content response
6. Angular refreshes map list
```

## Data Relationships

```
Map ──1:M──> Activity ──1:M──> Action ──M:M──> Action (via dependencies)
```

When a parent is deleted, SQLite CASCADE automatically removes children.

## Error Handling

```
1. Database error → 500 Internal Server Error
2. Validation error → 400 Bad Request
3. Not found → 404 Not Found
4. Controller catches errors and returns appropriate response
```

## Client-Server Communication

All communication is stateless HTTP:

- Content-Type: application/json
- Body: JSON for POST/PUT
- Response: JSON for successful operations