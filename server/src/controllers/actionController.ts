import { Request, Response } from 'express';
import db from '../models/db';

export const getAllActions = (req: Request, res: Response): void => {
  const { activity_id, implementation_state } = req.query;
  
  let query = `
    SELECT a.*, actors.name as actor_name
    FROM actions a
    LEFT JOIN actors ON a.actor_id = actors.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (activity_id) {
    query += ' AND a.activity_id = ?';
    params.push(activity_id);
  }
  if (implementation_state) {
    const states = (implementation_state as string).split(',');
    query += ` AND a.implementation_state IN (${states.map(() => '?').join(',')})`;
    params.push(...states);
  }

  query += ' ORDER BY a.id';

  const actions = db.prepare(query).all(...params);
  res.json(actions);
};

export const getActionById = (req: Request, res: Response): void => {
  const action = db.prepare('SELECT * FROM actions WHERE id = ?').get(req.params.id);
  if (!action) {
    res.status(404).json({ error: 'Action not found' });
    return;
  }
  res.json(action);
};

export const createAction = (req: Request, res: Response): void => {
  const { uid, activity_id, actor_id, name, priority, implementation_state, description } = req.body;
  if (!uid || !activity_id || !name || !priority) {
    res.status(400).json({ error: 'uid, activity_id, name, and priority are required' });
    return;
  }
  if (!implementation_state || !['Full', 'Partial', 'None'].includes(implementation_state)) {
    res.status(400).json({ error: 'implementation_state is required and must be Full, Partial, or None' });
    return;
  }
  const activityExists = db.prepare('SELECT id FROM activities WHERE id = ?').get(activity_id);
  if (!activityExists) {
    res.status(400).json({ error: 'Activity not found' });
    return;
  }
  const stmt = db.prepare(
    'INSERT INTO actions (uid, activity_id, actor_id, name, priority, implementation_state, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(uid, activity_id, actor_id || null, name, priority, implementation_state, description || null);
  const action = db.prepare('SELECT * FROM actions WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(action);
};

export const updateAction = (req: Request, res: Response): void => {
  const { actor_id, name, priority, implementation_state, description } = req.body;
  const existing = db.prepare('SELECT * FROM actions WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Action not found' });
    return;
  }
  if (implementation_state && !['Full', 'Partial', 'None'].includes(implementation_state)) {
    res.status(400).json({ error: 'implementation_state must be Full, Partial, or None' });
    return;
  }
  const stmt = db.prepare(
    'UPDATE actions SET actor_id = ?, name = ?, priority = ?, implementation_state = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  stmt.run(actor_id || null, name, priority, implementation_state || 'None', description, req.params.id);
  const action = db.prepare('SELECT * FROM actions WHERE id = ?').get(req.params.id);
  res.json(action);
};

export const deleteAction = (req: Request, res: Response): void => {
  const existing = db.prepare('SELECT * FROM actions WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Action not found' });
    return;
  }
  db.prepare('DELETE FROM actions WHERE id = ?').run(req.params.id);
  res.status(204).send();
};

export const getActionDependencies = (req: Request, res: Response): void => {
  const dependencies = db.prepare(`
    SELECT ad.*, 
           (SELECT uid FROM actions WHERE id = ad.depends_on_action_id) as depends_on_uid,
           (SELECT name FROM actions WHERE id = ad.depends_on_action_id) as depends_on_name
    FROM action_dependencies ad
    WHERE ad.action_id = ?
  `).all(req.params.id);
  res.json(dependencies);
};

export const addActionDependency = (req: Request, res: Response): void => {
  const { depends_on_action_id } = req.body;
  const actionId = Number(req.params.id);
  
  if (!depends_on_action_id) {
    res.status(400).json({ error: 'depends_on_action_id is required' });
    return;
  }
  
  const targetId = Number(depends_on_action_id);
  const actionExists = db.prepare('SELECT id FROM actions WHERE id = ?').get(actionId);
  if (!actionExists) {
    res.status(400).json({ error: 'Action not found' });
    return;
  }
  const depExists = db.prepare('SELECT id FROM actions WHERE id = ?').get(targetId);
  if (!depExists) {
    res.status(400).json({ error: 'Dependency action not found' });
    return;
  }

  const existing = db.prepare(
    'SELECT id FROM action_dependencies WHERE action_id = ? AND depends_on_action_id = ?'
  ).get(actionId, targetId);
  if (existing) {
    res.status(400).json({ error: 'Dependency already exists' });
    return;
  }

  const hasCircular = checkCircularDependency(actionId, targetId);
  if (hasCircular) {
    res.status(400).json({ error: 'Cannot add dependency: would create circular dependency' });
    return;
  }

  const directReverse = db.prepare(
    'SELECT id FROM action_dependencies WHERE action_id = ? AND depends_on_action_id = ?'
  ).get(targetId, actionId);
  if (directReverse) {
    res.status(400).json({ error: 'Cannot add dependency: would create circular dependency' });
    return;
  }

  const stmt = db.prepare(
    'INSERT INTO action_dependencies (action_id, depends_on_action_id) VALUES (?, ?)'
  );
  stmt.run(actionId, targetId);
  res.status(201).json({ action_id: actionId, depends_on_action_id: targetId });
};

function checkCircularDependency(actionId: number, targetId: number, visited: Set<number> = new Set()): boolean {
  if (targetId === actionId) return true;
  if (visited.has(targetId)) return false;
  
  visited.add(targetId);
  
  const dependencies = db.prepare(
    'SELECT depends_on_action_id FROM action_dependencies WHERE action_id = ?'
  ).all(targetId) as { depends_on_action_id: number }[];
  
  for (const dep of dependencies) {
    if (checkCircularDependency(actionId, dep.depends_on_action_id, visited)) {
      return true;
    }
  }
  
  return false;
}

export const removeActionDependency = (req: Request, res: Response): void => {
  const { dependsOnId } = req.params;
  const existing = db.prepare(
    'SELECT * FROM action_dependencies WHERE action_id = ? AND depends_on_action_id = ?'
  ).get(req.params.id, dependsOnId);
  if (!existing) {
    res.status(404).json({ error: 'Dependency not found' });
    return;
  }
  db.prepare('DELETE FROM action_dependencies WHERE action_id = ? AND depends_on_action_id = ?').run(req.params.id, dependsOnId);
  res.status(204).send();
};

export const getPrerequisitesOf = (req: Request, res: Response): void => {
  const actionId = Number(req.params.id);
  
  const actionExists = db.prepare('SELECT id FROM actions WHERE id = ?').get(actionId);
  if (!actionExists) {
    res.status(404).json({ error: 'Action not found' });
    return;
  }

  const prerequisites = db.prepare(`
    SELECT ad.*, 
           a.uid as action_uid,
           a.name as action_name,
           a.priority as action_priority,
           act.uid as activity_uid,
           act.name as activity_name,
           m.uid as map_uid,
           m.name as map_name
    FROM action_dependencies ad
    JOIN actions a ON ad.action_id = a.id
    LEFT JOIN activities act ON a.activity_id = act.id
    LEFT JOIN maps m ON act.map_id = m.id
    WHERE ad.depends_on_action_id = ?
    ORDER BY m.name, act.name, a.name
  `).all(actionId);
  
  res.json(prerequisites);
};

export const getAllActionsWithContext = (_req: Request, res: Response): void => {
  const actions = db.prepare(`
    SELECT 
      a.*,
      act.uid as activity_uid,
      act.name as activity_name,
      act.description as activity_description,
      m.id as map_id,
      m.uid as map_uid,
      m.name as map_name,
      actors.name as actor_name
    FROM actions a
    LEFT JOIN activities act ON a.activity_id = act.id
    LEFT JOIN maps m ON act.map_id = m.id
    LEFT JOIN actors ON a.actor_id = actors.id
    ORDER BY m.name, act.name, a.name
  `).all();
  
  res.json(actions);
};