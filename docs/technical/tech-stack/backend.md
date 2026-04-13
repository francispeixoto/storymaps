# Backend

This document details the Express.js backend implementation.

## Project Setup

### Initialization

```bash
mkdir server && cd server
npm init -y
npm install express sqlite3 better-sqlite3 cors helmet
npm install -D typescript @types/node @types/express ts-node nodemon
npx tsc --init
```

### Directory Structure

```
server/
├── src/
│   ├── routes/
│   │   ├── mapRoutes.ts
│   │   ├── activityRoutes.ts
│   │   └── actionRoutes.ts
│   ├── controllers/
│   │   ├── mapController.ts
│   │   ├── activityController.ts
│   │   └── actionController.ts
│   ├── models/
│   │   └── db.ts
│   ├── services/
│   ├── middleware/
│   ├── config/
│   └── index.ts
├── data/                    # SQLite database storage
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```

## Core Files

### Entry Point (src/index.ts)

The server entry point initializes Express, middleware, routes, and creates the database on first run.

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initDatabase } from './models/db';
import mapRoutes from './routes/mapRoutes';
import activityRoutes from './routes/activityRoutes';
import actionRoutes from './routes/actionRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

initDatabase();

app.use('/api/maps', mapRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/actions', actionRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
```

### Database Model (src/models/db.ts)

The database model creates tables on first start using better-sqlite3:

```typescript
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dbDir, 'database.sqlite');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

export function initDatabase(): void {
  db.exec(`
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

    CREATE INDEX IF NOT EXISTS idx_activities_map_id ON activities(map_id);
    CREATE INDEX IF NOT EXISTS idx_actions_activity_id ON actions(activity_id);
    CREATE INDEX IF NOT EXISTS idx_maps_uid ON maps(uid);
    CREATE INDEX IF NOT EXISTS idx_activities_uid ON activities(uid);
    CREATE INDEX IF NOT EXISTS idx_actions_uid ON actions(uid);
    CREATE INDEX IF NOT EXISTS idx_action_dependencies_action_id ON action_dependencies(action_id);
  `);

  console.log('Database initialized');
}

export default db;
```

### Map Controller (src/controllers/mapController.ts)

```typescript
import { Request, Response } from 'express';
import db from '../models/db';

export const getAllMaps = (_req: Request, res: Response): void => {
  const maps = db.prepare('SELECT * FROM maps ORDER BY created_at DESC').all();
  res.json(maps);
};

export const getMapById = (req: Request, res: Response): void => {
  const map = db.prepare('SELECT * FROM maps WHERE id = ?').get(req.params.id);
  if (!map) {
    res.status(404).json({ error: 'Map not found' });
    return;
  }
  res.json(map);
};

export const createMap = (req: Request, res: Response): void => {
  const { uid, name, description } = req.body;
  if (!uid || !name) {
    res.status(400).json({ error: 'uid and name are required' });
    return;
  }
  const stmt = db.prepare(
    'INSERT INTO maps (uid, name, description) VALUES (?, ?, ?)'
  );
  const result = stmt.run(uid, name, description || null);
  const map = db.prepare('SELECT * FROM maps WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(map);
};

export const updateMap = (req: Request, res: Response): void => {
  const { name, description } = req.body;
  const existing = db.prepare('SELECT * FROM maps WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Map not found' });
    return;
  }
  const stmt = db.prepare(
    'UPDATE maps SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  stmt.run(name, description, req.params.id);
  const map = db.prepare('SELECT * FROM maps WHERE id = ?').get(req.params.id);
  res.json(map);
};

export const deleteMap = (req: Request, res: Response): void => {
  const existing = db.prepare('SELECT * FROM maps WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Map not found' });
    return;
  }
  db.prepare('DELETE FROM maps WHERE id = ?').run(req.params.id);
  res.status(204).send();
};
```

### Map Routes (routes/mapRoutes.ts)

```typescript
import { Router } from 'express';
import * as mapController from '../controllers/mapController';

const router = Router();

router.get('/', mapController.getAllMaps);
router.get('/:id', mapController.getMapById);
router.post('/', mapController.createMap);
router.put('/:id', mapController.updateMap);
router.delete('/:id', mapController.deleteMap);

export default router;
```

## Running the Backend

### Development

```bash
cd server
npm install
npm run dev
# Runs on http://localhost:3000
```

### Production

```bash
cd server
npm install
npm run build
npm run start
# Runs on http://localhost:3000
```

## Scripts (package.json)

```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```