import { Request, Response } from 'express';
import db from '../models/db';
import { calculateHealth, MapHealth } from '../utils/health';

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

  const actions = db.prepare(`
    SELECT a.priority, a.implementation_state
    FROM actions a
    JOIN activities act ON a.activity_id = act.id
    WHERE act.map_id = ?
  `).all(req.params.id) as { priority: string; implementation_state: string }[];

  const health: MapHealth = calculateHealth(actions);
  res.json({ ...map, health });
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