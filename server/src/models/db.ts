import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dbDir, 'database.sqlite');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db: any = new Database(dbPath);

db.pragma('foreign_keys = ON');

export function initDatabase(): void {
  db.exec(`
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

    CREATE INDEX IF NOT EXISTS idx_activities_map_id ON activities(map_id);
    CREATE INDEX IF NOT EXISTS idx_actions_activity_id ON actions(activity_id);
    CREATE INDEX IF NOT EXISTS idx_maps_uid ON maps(uid);
    CREATE INDEX IF NOT EXISTS idx_activities_uid ON activities(uid);
    CREATE INDEX IF NOT EXISTS idx_actions_uid ON actions(uid);
    CREATE INDEX IF NOT EXISTS idx_action_dependencies_action_id ON action_dependencies(action_id);
  `);

  // Migration: add actors table and actor_id column if missing
  try {
    const hasActorsTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='actors'").get();
    if (!hasActorsTable) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS actors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uid TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    const hasActorId = db.prepare("PRAGMA table_info(actions)").all().some((col: any) => col.name === 'actor_id');
    if (!hasActorId) {
      db.exec('ALTER TABLE actions ADD COLUMN actor_id INTEGER REFERENCES actors(id) ON DELETE SET NULL');
    }
  } catch (e) {
    // Ignore migration errors
  }

  // Migration: drop priority column from activities if exists
  try {
    const activityCols = db.prepare("PRAGMA table_info(activities)").all() as any[];
    const hasPriorityCol = activityCols.some((col: any) => col.name === 'priority');
    if (hasPriorityCol) {
      db.exec('ALTER TABLE activities DROP COLUMN priority');
    }
  } catch (e) {
    // Ignore migration errors
  }

  console.log('Database initialized');
}

export default db;