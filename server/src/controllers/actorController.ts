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

export const getActorActions = (req: Request, res: Response): void => {
  const actorId = req.params.id;
  const actor = db.prepare('SELECT * FROM actors WHERE id = ?').get(actorId);
  if (!actor) {
    res.status(404).json({ error: 'Actor not found' });
    return;
  }

  const actions = db.prepare(`
    SELECT 
      a.id, a.uid, a.activity_id, a.actor_id, a.name, a.priority, a.description,
      a.created_at, a.updated_at,
      act.uid as activity_uid, act.name as activity_name,
      m.uid as map_uid, m.name as map_name
    FROM actions a
    LEFT JOIN activities act ON a.activity_id = act.id
    LEFT JOIN maps m ON act.map_id = m.id
    WHERE a.actor_id = ?
    ORDER BY m.name, act.name, a.priority
  `).all(actorId);

  res.json(actions);
};