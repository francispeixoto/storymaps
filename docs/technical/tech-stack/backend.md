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
│   │   └── mapService.ts
│   ├── middleware/
│   │   └── validation.ts
│   ├── config/
│   │   └── index.ts
│   └── index.ts
├── database.sqlite
├── package.json
└── tsconfig.json
```

## Core Files

### Entry Point (index.ts)

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mapRoutes from './routes/mapRoutes';
import activityRoutes from './routes/activityRoutes';
import actionRoutes from './routes/actionRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/maps', mapRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/actions', actionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
```

### Database Model (models/db.ts)

```typescript
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export default db;
```

### Map Controller (controllers/mapController.ts)

```typescript
import { Request, Response } from 'express';
import db from '../models/db';

export const getAllMaps = (req: Request, res: Response) => {
  const maps = db.prepare('SELECT * FROM maps ORDER BY created_at DESC').all();
  res.json(maps);
};

export const getMapById = (req: Request, res: Response) => {
  const map = db.prepare('SELECT * FROM maps WHERE id = ?').get(req.params.id);
  if (!map) {
    return res.status(404).json({ error: 'Map not found' });
  }
  res.json(map);
};

export const createMap = (req: Request, res: Response) => {
  const { uid, name, description } = req.body;
  const stmt = db.prepare(
    'INSERT INTO maps (uid, name, description) VALUES (?, ?, ?)'
  );
  const result = stmt.run(uid, name, description);
  const map = db.prepare('SELECT * FROM maps WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(map);
};

export const updateMap = (req: Request, res: Response) => {
  const { name, description } = req.body;
  const stmt = db.prepare(
    'UPDATE maps SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  stmt.run(name, description, req.params.id);
  const map = db.prepare('SELECT * FROM maps WHERE id = ?').get(req.params.id);
  res.json(map);
};

export const deleteMap = (req: Request, res: Response) => {
  const stmt = db.prepare('DELETE FROM maps WHERE id = ?');
  stmt.run(req.params.id);
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
npm run dev
# Runs on http://localhost:3000
```

### Production

```bash
npm run build
node dist/index.js
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