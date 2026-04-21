import { Request, Response } from 'express';
import db from '../models/db';
import { calculateHealth, MapHealth } from '../utils/health';

export const getAllActivities = (req: Request, res: Response): void => {
  const mapId = req.query.map_id;
  if (mapId) {
    const activities = db.prepare('SELECT * FROM activities WHERE map_id = ? ORDER BY id').all(mapId) as Array<{ id: number }>;
    const activitiesWithHealth = activities.map(activity => {
      const actions = db.prepare(`
        SELECT a.priority, a.implementation_state
        FROM actions a
        WHERE a.activity_id = ?
      `).all(activity.id) as { priority: string; implementation_state: string }[];
      const health: MapHealth = calculateHealth(actions);
      return { ...activity, health };
    });
    res.json(activitiesWithHealth);
    return;
  }
  const activities = db.prepare('SELECT * FROM activities ORDER BY id').all();
  res.json(activities);
};

export const getActivityById = (req: Request, res: Response): void => {
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  if (!activity) {
    res.status(404).json({ error: 'Activity not found' });
    return;
  }

  const actions = db.prepare(`
    SELECT a.priority, a.implementation_state
    FROM actions a
    WHERE a.activity_id = ?
  `).all(req.params.id) as { priority: string; implementation_state: string }[];

  const health: MapHealth = calculateHealth(actions);
  res.json({ ...activity, health });
};

export const createActivity = (req: Request, res: Response): void => {
  const { uid, map_id, name, description } = req.body;
  if (!uid || !map_id || !name) {
    res.status(400).json({ error: 'uid, map_id, and name are required' });
    return;
  }
  const mapExists = db.prepare('SELECT id FROM maps WHERE id = ?').get(map_id);
  if (!mapExists) {
    res.status(400).json({ error: 'Map not found' });
    return;
  }
  const stmt = db.prepare(
    'INSERT INTO activities (uid, map_id, name, description) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(uid, map_id, name, description || null);
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(activity);
};

export const updateActivity = (req: Request, res: Response): void => {
  const { name, description } = req.body;
  const existing = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Activity not found' });
    return;
  }
  const stmt = db.prepare(
    'UPDATE activities SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  stmt.run(name, description || null, req.params.id);
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  res.json(activity);
};

export const deleteActivity = (req: Request, res: Response): void => {
  const existing = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Activity not found' });
    return;
  }
  db.prepare('DELETE FROM activities WHERE id = ?').run(req.params.id);
  res.status(204).send();
};