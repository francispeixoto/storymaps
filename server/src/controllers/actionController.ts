import { Request, Response } from 'express';
import db from '../models/db';

export const getAllActions = (req: Request, res: Response): void => {
  const activityId = req.query.activity_id;
  if (activityId) {
    const actions = db.prepare('SELECT * FROM actions WHERE activity_id = ? ORDER BY id').all(activityId);
    res.json(actions);
    return;
  }
  const actions = db.prepare('SELECT * FROM actions ORDER BY id').all();
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
  const { uid, activity_id, name, actor, priority, description } = req.body;
  if (!uid || !activity_id || !name || !actor || !priority) {
    res.status(400).json({ error: 'uid, activity_id, name, actor, and priority are required' });
    return;
  }
  const activityExists = db.prepare('SELECT id FROM activities WHERE id = ?').get(activity_id);
  if (!activityExists) {
    res.status(400).json({ error: 'Activity not found' });
    return;
  }
  const stmt = db.prepare(
    'INSERT INTO actions (uid, activity_id, name, actor, priority, description) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(uid, activity_id, name, actor, priority, description || null);
  const action = db.prepare('SELECT * FROM actions WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(action);
};

export const updateAction = (req: Request, res: Response): void => {
  const { name, actor, priority, description } = req.body;
  const existing = db.prepare('SELECT * FROM actions WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Action not found' });
    return;
  }
  const stmt = db.prepare(
    'UPDATE actions SET name = ?, actor = ?, priority = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  stmt.run(name, actor, priority, description, req.params.id);
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
  if (!depends_on_action_id) {
    res.status(400).json({ error: 'depends_on_action_id is required' });
    return;
  }
  const actionExists = db.prepare('SELECT id FROM actions WHERE id = ?').get(req.params.id);
  if (!actionExists) {
    res.status(400).json({ error: 'Action not found' });
    return;
  }
  const depExists = db.prepare('SELECT id FROM actions WHERE id = ?').get(depends_on_action_id);
  if (!depExists) {
    res.status(400).json({ error: 'Dependency action not found' });
    return;
  }
  try {
    const stmt = db.prepare(
      'INSERT INTO action_dependencies (action_id, depends_on_action_id) VALUES (?, ?)'
    );
    stmt.run(req.params.id, depends_on_action_id);
    res.status(201).json({ action_id: req.params.id, depends_on_action_id });
  } catch {
    res.status(400).json({ error: 'Dependency already exists' });
  }
};

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