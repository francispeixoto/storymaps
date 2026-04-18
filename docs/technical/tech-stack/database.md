# Database

This document details the SQLite database schema for StoryMaps.

## Schema

### Actors Table

```sql
CREATE TABLE actors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

- **uid**: Unique identifier (e.g., 'actor-001')
- **name**: Actor name (managed via UI, no enum constraint)
- **description**: Optional actor description
- **Timestamps**: Auto-managed creation and update times

### Maps Table

```sql
CREATE TABLE maps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

- **uid**: Unique identifier from story map (e.g., 'maps-001')
- **name**: Map title
- **description**: Optional map description
- **Timestamps**: Auto-managed creation and update times

### Activities Table

```sql
CREATE TABLE activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT UNIQUE NOT NULL,
    map_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    priority TEXT CHECK(priority IN ('Need', 'Want', 'Nice')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE
);
```

- **uid**: Unique identifier from story map (e.g., 'maps-001_act_001')
- **map_id**: Foreign key to parent map
- **priority**: Must be 'Need', 'Want', or 'Nice'
- **Cascade**: Deleting a map deletes all its activities

### Actions Table

```sql
CREATE TABLE actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT UNIQUE NOT NULL,
    activity_id INTEGER NOT NULL,
    actor_id INTEGER,
    name TEXT NOT NULL,
    priority TEXT CHECK(priority IN ('Need', 'Want', 'Nice')),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES actors(id) ON DELETE SET NULL
);
```

- **uid**: Unique identifier from story map (e.g., 'maps-001_act_001_act_001')
- **activity_id**: Foreign key to parent activity
- **actor_id**: Foreign key to actor (nullable, allows actions without assigned actor)
- **priority**: Must be 'Need', 'Want', or 'Nice'
- **description**: Optional action description

### Action Dependencies Junction Table

```sql
CREATE TABLE action_dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_id INTEGER NOT NULL,
    depends_on_action_id INTEGER NOT NULL,
    FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE,
    FOREIGN KEY (depends_on_action_id) REFERENCES actions(id) ON DELETE CASCADE,
    UNIQUE(action_id, depends_on_action_id)
);
```

- **action_id**: The dependent action
- **depends_on_action_id**: The action being depended on
- **Unique constraint**: Prevents duplicate dependencies

### Contexts Table

```sql
CREATE TABLE contexts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

- **uid**: Unique identifier (e.g., 'context-001')
- **name**: Context name (e.g., 'Shopping App', 'Mobile App')
- **description**: Optional context description
- **is_default**: Flag for default context (1 = default, 0 = not default)
- **Timestamps**: Auto-managed creation and update times

### Context Maps Junction Table

```sql
CREATE TABLE context_maps (
    context_id INTEGER NOT NULL,
    map_id INTEGER NOT NULL,
    PRIMARY KEY (context_id, map_id),
    FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE,
    FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE
);
```

- **context_id**: Foreign key to context
- **map_id**: Foreign key to map
- **Primary key**: Composite key ensures unique context-map pairs
- **Cascade**: Deleting context or map removes the association

### Indexes

```sql
CREATE INDEX idx_activities_map_id ON activities(map_id);
CREATE INDEX idx_actions_activity_id ON actions(activity_id);
CREATE INDEX idx_maps_uid ON maps(uid);
CREATE INDEX idx_activities_uid ON activities(uid);
CREATE INDEX idx_actions_uid ON actions(uid);
CREATE INDEX idx_action_dependencies_action_id ON action_dependencies(action_id);
```

## Relationships

```
contexts (1) ─────< context_maps (M) >───── (1) maps
actors (1) ─────< actions (N)
maps (1) ─────< activities (N)
activities (1) ─────< actions (N)
actions (N) ─────< action_dependencies (M) ─────< actions (N)
```

## Migrations

For existing databases, the following migrations add the actors table and actor_id column:

```sql
-- Create actors table if missing
CREATE TABLE IF NOT EXISTS actors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add actor_id column to actions if missing
ALTER TABLE actions ADD COLUMN actor_id INTEGER REFERENCES actors(id) ON DELETE SET NULL;
```

For existing databases, the following migration adds the contexts layer:

```sql
-- Create contexts table if missing
CREATE TABLE IF NOT EXISTS contexts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create context_maps junction table if missing
CREATE TABLE IF NOT EXISTS context_maps (
    context_id INTEGER NOT NULL,
    map_id INTEGER NOT NULL,
    PRIMARY KEY (context_id, map_id),
    FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE,
    FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE
);

-- Create indexes for context_maps
CREATE INDEX IF NOT EXISTS idx_context_maps_context_id ON context_maps(context_id);
CREATE INDEX IF NOT EXISTS idx_context_maps_map_id ON context_maps(map_id);

-- Create default context if none exists
INSERT INTO contexts (uid, name, is_default)
SELECT 'default-' || CAST(id AS TEXT), name, 1
FROM maps WHERE id = (SELECT id FROM maps LIMIT 1);
```

## Initialization Script

The database can be initialized with the following script:

```sql
-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Create tables
CREATE TABLE IF NOT EXISTS actors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT UNIQUE NOT NULL,
    map_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    priority TEXT CHECK(priority IN ('Need', 'Want', 'Nice')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT UNIQUE NOT NULL,
    activity_id INTEGER NOT NULL,
    actor_id INTEGER,
    name TEXT NOT NULL,
    priority TEXT CHECK(priority IN ('Need', 'Want', 'Nice')),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES actors(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS action_dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_id INTEGER NOT NULL,
    depends_on_action_id INTEGER NOT NULL,
    FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE,
    FOREIGN KEY (depends_on_action_id) REFERENCES actions(id) ON DELETE CASCADE,
    UNIQUE(action_id, depends_on_action_id)
);

CREATE TABLE IF NOT EXISTS contexts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS context_maps (
    context_id INTEGER NOT NULL,
    map_id INTEGER NOT NULL,
    PRIMARY KEY (context_id, map_id),
    FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE,
    FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_activities_map_id ON activities(map_id);
CREATE INDEX IF NOT EXISTS idx_actions_activity_id ON actions(activity_id);
CREATE INDEX IF NOT EXISTS idx_maps_uid ON maps(uid);
CREATE INDEX IF NOT EXISTS idx_activities_uid ON activities(uid);
CREATE INDEX IF NOT EXISTS idx_actions_uid ON actions(uid);
CREATE INDEX IF NOT EXISTS idx_action_dependencies_action_id ON action_dependencies(action_id);
CREATE INDEX IF NOT EXISTS idx_context_maps_context_id ON context_maps(context_id);
CREATE INDEX IF NOT EXISTS idx_context_maps_map_id ON context_maps(map_id);
```

## Sample Queries

### Get map with all activities, actions, and actors

```sql
SELECT 
    m.id as map_id, m.uid as map_uid, m.name as map_name,
    a.id as activity_id, a.uid as activity_uid, a.name as activity_name, a.priority,
    act.id as action_id, act.uid as action_uid, act.name as action_name, 
    actr.name as actor_name, act.priority as action_priority, act.description
FROM maps m
JOIN activities a ON a.map_id = m.id
JOIN actions act ON act.activity_id = a.id
LEFT JOIN actors actr ON act.actor_id = actr.id
WHERE m.id = ?
ORDER BY a.id, act.id;
```

### Get action dependencies with actor names

```sql
SELECT 
    a.name as action_name,
    dep.name as depends_on_name
FROM action_dependencies ad
JOIN actions a ON a.id = ad.action_id
JOIN actions dep ON dep.id = ad.depends_on_action_id
WHERE ad.action_id = ?;
```

### Get actions grouped by priority for matrix view

```sql
SELECT 
    a.name as activity_name,
    act.name as action_name,
    actr.name as actor_name,
    act.priority
FROM activities a
JOIN actions act ON act.activity_id = a.id
LEFT JOIN actors actr ON act.actor_id = actr.id
WHERE a.map_id = ?
ORDER BY act.priority, a.name;
```

### Get context with all its maps

```sql
SELECT 
    c.id as context_id, c.name as context_name, c.description as context_description,
    m.id as map_id, m.name as map_name, m.description as map_description
FROM contexts c
LEFT JOIN context_maps cm ON cm.context_id = c.id
LEFT JOIN maps m ON m.id = cm.map_id
WHERE c.id = ?
ORDER BY m.name;
```