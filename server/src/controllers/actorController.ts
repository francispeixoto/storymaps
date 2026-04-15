import { Request, Response } from 'express';
import db from '../models/db';

interface ActorWithSatisfaction {
  id: number;
  uid: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  satisfaction: number;
  action_count: number;
}

function calculateSatisfaction(actorId: number): { score: number; actionCount: number } {
  const actions = db.prepare(`
    SELECT priority, implementation_state 
    FROM actions 
    WHERE actor_id = ?
  `).all(actorId) as { priority: string; implementation_state: string }[];

  if (actions.length === 0) {
    return { score: 0, actionCount: 0 };
  }

  const priorityWeights: Record<string, number> = {
    'Need': 3,
    'Want': 2,
    'Nice': 1
  };

  let totalWeight = 0;
  let promotersWeight = 0;
  let detractorsWeight = 0;

  for (const action of actions) {
    const weight = priorityWeights[action.priority] || 1;
    totalWeight += weight;

    if (action.implementation_state === 'Full') {
      promotersWeight += weight;
    } else if (action.implementation_state === 'None') {
      detractorsWeight += weight;
    }
  }

  if (totalWeight === 0) {
    return { score: 0, actionCount: actions.length };
  }

  const score = ((promotersWeight / totalWeight) - (detractorsWeight / totalWeight)) * 100;
  return { score: Math.round(score), actionCount: actions.length };
}

export const getAllActors = (_req: Request, res: Response): void => {
  const actors = db.prepare('SELECT * FROM actors ORDER BY name').all() as any[];
  
  const actorsWithSatisfaction: ActorWithSatisfaction[] = actors.map(actor => {
    const { score, actionCount } = calculateSatisfaction(actor.id);
    return {
      ...actor,
      satisfaction: score,
      action_count: actionCount
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
  const { score, actionCount } = calculateSatisfaction(actorId);
  const actorWithSatisfaction: ActorWithSatisfaction = {
    ...actor,
    satisfaction: score,
    action_count: actionCount
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
  
  const actorWithSatisfaction: ActorWithSatisfaction = {
    ...actor,
    satisfaction: 0,
    action_count: 0
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
  const { score, actionCount } = calculateSatisfaction(actorId);
  const actorWithSatisfaction: ActorWithSatisfaction = {
    ...actor,
    satisfaction: score,
    action_count: actionCount
  };
  res.json(actorWithSatisfaction);
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