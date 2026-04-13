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
| MapListComponent | Displays list of all maps |
| MapEditorComponent | Create/edit map with activities and actions |
| MapViewerComponent | Visual story matrix display |
| ActivityCard | Card component for activity display |
| ActionItem | Action item with priority indicator |

### Services

| Service | Purpose |
|---------|---------|
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
| controllers/mapController.js | Map request handling |
| controllers/activityController.js | Activity request handling |
| controllers/actionController.js | Action request handling |
| models/db.js | SQLite connection and queries |
| middleware/validation.js | Request validation |

## Database

### Tables

- **maps**: Top-level story map themes
- **activities**: Value targets within maps
- **actions**: Executable steps within activities
- **action_dependencies**: Junction table for action dependencies

See [Database Schema](../tech-stack/database.md) for detailed schema.