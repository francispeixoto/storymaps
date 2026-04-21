import { Request, Response } from 'express';
import db from '../models/db';
import { calculateHealth, MapHealth } from '../utils/health';

interface ActorWithSatisfaction {
  id: number;
  uid: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  satisfaction: number;
  action_count: number;
  health?: MapHealth;
}

function getHealthData(actorId: number): MapHealth {
  const actions = db.prepare(`
    SELECT priority, implementation_state 
    FROM actions 
    WHERE actor_id = ?
  `).all(actorId) as { priority: string; implementation_state: string }[];

  return calculateHealth(actions);
}

export const getAllActors = (_req: Request, res: Response): void => {
  const actors = db.prepare('SELECT * FROM actors ORDER BY name').all() as any[];
  
  const actorsWithSatisfaction: ActorWithSatisfaction[] = actors.map(actor => {
    const health = getHealthData(actor.id);
    return {
      ...actor,
      satisfaction: health.score,
      action_count: health.totalActions,
      health
    };
  });
  
  res.json(actorsWithSatisfaction);
};

export const getActorById = (req: Request, res: Response): void => {
  const actor = db.prepare('SELECT * FROM actors WHERE id = ?').get(req.params.id);
  if (!actor) {
    res.status(404).json({ error: 'Actor not found' });
    return;
  }

  const actorId = Number(req.params.id);
  const health = getHealthData(actorId);
  const actorWithSatisfaction: ActorWithSatisfaction = {
    ...actor,
    satisfaction: health.score,
    action_count: health.totalActions,
    health
  };
  
  res.json(actorWithSatisfaction);
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
  
  const health = getHealthData(Number(result.lastInsertRowid));
  const actorWithSatisfaction: ActorWithSatisfaction = {
    ...actor,
    satisfaction: health.score,
    action_count: health.totalActions,
    health
  };
  res.status(201).json(actorWithSatisfaction);
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
  
  const actorId = Number(req.params.id);
  const health = getHealthData(actorId);
  const actorWithSatisfaction: ActorWithSatisfaction = {
    ...actor,
    satisfaction: health.score,
    action_count: health.totalActions,
    health
  };
  res.json(actorWithSatisfaction);
};

export const deleteActor = (req: Request, res: Response): void => {
  const existing = db.prepare('SELECT * FROM actors WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Actor not found' });
    return;
  }

  const actorId = Number(req.params.id);
  const { reassignTo } = req.body;

  if (reassignTo) {
    const newActorId = Number(reassignTo);
    const targetExists = db.prepare('SELECT id FROM actors WHERE id = ?').get(newActorId);
    if (!targetExists) {
      res.status(400).json({ error: 'Target actor not found' });
      return;
    }
    if (newActorId === actorId) {
      res.status(400).json({ error: 'Cannot reassign to same actor' });
      return;
    }
    db.prepare('UPDATE actions SET actor_id = ? WHERE actor_id = ?').run(newActorId, actorId);
  }

  db.prepare('DELETE FROM actors WHERE id = ?').run(actorId);
  res.status(204).send();
};

export const getActorActions = (req: Request, res: Response): void => {
  const actorId = Number(req.params.id);
  const actor = db.prepare('SELECT * FROM actors WHERE id = ?').get(actorId);
  if (!actor) {
    res.status(404).json({ error: 'Actor not found' });
    return;
  }

  const actions = db.prepare(`
    SELECT 
      a.id, a.uid, a.activity_id, a.actor_id, a.name, a.priority, a.implementation_state, a.description,
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