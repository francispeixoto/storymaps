import { Request, Response } from 'express';
import db from '../models/db';

export const getAllActors = (_req: Request, res: Response): void => {
  const actors = db.prepare('SELECT * FROM actors ORDER BY name').all();
  res.json(actors);
};

export const getActorById = (req: Request, res: Response): void => {
  const actor = db.prepare('SELECT * FROM actors WHERE id = ?').get(req.params.id);
  if (!actor) {
    res.status(404).json({ error: 'Actor not found' });
    return;
  }
  res.json(actor);
};

export const createActor = (req: Request, res: Response): void => {
  const { uid, name, description } = req.body;
  if (!uid || !name) {
    res.status(400).json({ error: 'uid and name are required' });
    return;
  }
  const stmt = db.prepare(
    'INSERT INTO actors (uid, name, description) VALUES (?, ?, ?)'
  );
  const result = stmt.run(uid, name, description || null);
  const actor = db.prepare('SELECT * FROM actors WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(actor);
};

export const updateActor = (req: Request, res: Response): void => {
  const { name, description } = req.body;
  const existing = db.prepare('SELECT * FROM actors WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Actor not found' });
    return;
  }
  const stmt = db.prepare(
    'UPDATE actors SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  stmt.run(name, description, req.params.id);
  const actor = db.prepare('SELECT * FROM actors WHERE id = ?').get(req.params.id);
  res.json(actor);
};

export const deleteActor = (req: Request, res: Response): void => {
  const existing = db.prepare('SELECT * FROM actors WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Actor not found' });
    return;
  }
  db.prepare('DELETE FROM actors WHERE id = ?').run(req.params.id);
  res.status(204).send();
};