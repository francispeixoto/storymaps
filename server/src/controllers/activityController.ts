import { Request, Response } from 'express';
import db from '../models/db';

export const getAllActivities = (req: Request, res: Response): void => {
  const mapId = req.query.map_id;
  if (mapId) {
    const activities = db.prepare('SELECT * FROM activities WHERE map_id = ? ORDER BY id').all(mapId);
    res.json(activities);
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
  res.json(activity);
};

export const createActivity = (req: Request, res: Response): void => {
  const { uid, map_id, name, priority } = req.body;
  if (!uid || !map_id || !name || !priority) {
    res.status(400).json({ error: 'uid, map_id, name, and priority are required' });
    return;
  }
  const mapExists = db.prepare('SELECT id FROM maps WHERE id = ?').get(map_id);
  if (!mapExists) {
    res.status(400).json({ error: 'Map not found' });
    return;
  }
  const stmt = db.prepare(
    'INSERT INTO activities (uid, map_id, name, priority) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(uid, map_id, name, priority);
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(activity);
};

export const updateActivity = (req: Request, res: Response): void => {
  const { name, priority } = req.body;
  const existing = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Activity not found' });
    return;
  }
  const stmt = db.prepare(
    'UPDATE activities SET name = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  stmt.run(name, priority, req.params.id);
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