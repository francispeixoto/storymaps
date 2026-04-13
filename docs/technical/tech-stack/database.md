# Database

This document details the SQLite database schema for StoryMaps.

## Schema

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
    name TEXT NOT NULL,
    actor TEXT CHECK(actor IN ('PM', 'Developer', 'DevOps')),
    priority TEXT CHECK(priority IN ('Need', 'Want', 'Nice')),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);
```

- **uid**: Unique identifier from story map (e.g., 'maps-001_act_001_act_001')
- **activity_id**: Foreign key to parent activity
- **actor**: Must be 'PM', 'Developer', or 'DevOps'
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
maps (1) ─────< activities (N)
activities (1) ─────< actions (N)
actions (N) ─────< action_dependencies (M) ─────< actions (N)
```

## Initialization Script

The database can be initialized with the following script:

```sql
-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Create tables
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
    name TEXT NOT NULL,
    actor TEXT CHECK(actor IN ('PM', 'Developer', 'DevOps')),
    priority TEXT CHECK(priority IN ('Need', 'Want', 'Nice')),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS action_dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_id INTEGER NOT NULL,
    depends_on_action_id INTEGER NOT NULL,
    FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE,
    FOREIGN KEY (depends_on_action_id) REFERENCES actions(id) ON DELETE CASCADE,
    UNIQUE(action_id, depends_on_action_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_activities_map_id ON activities(map_id);
CREATE INDEX IF NOT EXISTS idx_actions_activity_id ON actions(activity_id);
CREATE INDEX IF NOT EXISTS idx_maps_uid ON maps(uid);
CREATE INDEX IF NOT EXISTS idx_activities_uid ON activities(uid);
CREATE INDEX IF NOT EXISTS idx_actions_uid ON actions(uid);
CREATE INDEX IF NOT EXISTS idx_action_dependencies_action_id ON action_dependencies(action_id);
```

## Sample Queries

### Get map with all activities and actions

```sql
SELECT 
    m.id as map_id, m.uid as map_uid, m.name as map_name,
    a.id as activity_id, a.uid as activity_uid, a.name as activity_name, a.priority,
    act.id as action_id, act.uid as action_uid, act.name as action_name, 
    act.actor, act.priority as action_priority, act.description
FROM maps m
JOIN activities a ON a.map_id = m.id
JOIN actions act ON act.activity_id = a.id
WHERE m.id = ?
ORDER BY a.id, act.id;
```

### Get action dependencies

```sql
SELECT 
    a.name as action_name,
    dep.name as depends_on_name
FROM action_dependencies ad
JOIN actions a ON a.id = ad.action_id
JOIN actions dep ON dep.id = ad.depends_on_action_id
WHERE ad.action_id = ?;
```