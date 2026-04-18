# Components

This document details the individual components of the StoryMaps system.

## Frontend (Client)

### Structure

```
client/
├── src/
│   ├── app/
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # API communication services
│   │   ├── models/         # TypeScript interfaces
│   │   └── pages/          # Route-based pages
│   ├── assets/             # Static assets
│   └── styles/             # Tailwind configuration
├── angular.json            # Angular CLI configuration
├── tailwind.config.js      # Tailwind configuration
├── package.json
└── Dockerfile
```

### Key Components

| Component | Description |
|-----------|-------------|
| ContextsPageComponent | Displays list of all contexts with health scores |
| ContextFormComponent | Create/edit context form |
| ContextDetailComponent | Shows context details with associated maps |
| MapListComponent | Displays list of all maps |
| MapEditorComponent | Create/edit map with activities and actions |
| MatrixComponent | Visual story matrix display with priority columns |
| ActivityCard | Card component for activity display |
| ActionItem | Action item with priority indicator |

### Services

| Service | Purpose |
|---------|---------|
| ContextService | CRUD operations for contexts |
| MapService | CRUD operations for maps |
| ActivityService | CRUD operations for activities |
| ActionService | CRUD operations for actions |

## Backend (Server)

### Structure

```
server/
├── src/
│   ├── routes/            # Express route definitions
│   ├── controllers/       # Request handlers
│   ├── models/            # Database models (SQL queries)
│   ├── services/          # Business logic
│   ├── middleware/        # Express middleware
│   └── config/            # Configuration
├── database.sqlite        # SQLite database file
├── package.json
└── Dockerfile
```

### Key Modules

| Module | Responsibility |
|--------|----------------|
| routes/api.ts | API route definitions |
| controllers/contextController.js | Context request handling |
| controllers/mapController.js | Map request handling |
| controllers/activityController.js | Activity request handling |
| controllers/actionController.js | Action request handling |
| controllers/actorController.js | Actor request handling |
| models/db.js | SQLite connection and queries |
| middleware/validation.js | Request validation |

## Database

### Tables

- **contexts**: Top-level grouping for maps (e.g., "Shopping App", "Mobile App")
- **context_maps**: Junction table linking contexts to maps
- **maps**: Top-level story map themes
- **activities**: Value targets within maps
- **actions**: Executable steps within activities
- **actors**: User/role entities that perform actions
- **action_dependencies**: Junction table for action dependencies

See [Database Schema](../tech-stack/database.md) for detailed schema.