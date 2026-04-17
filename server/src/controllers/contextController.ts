import { Request, Response } from 'express';
import db from '../models/db';
import { calculateHealth, MapHealth } from '../utils/health';

export const getAllContexts = (_req: Request, res: Response): void => {
  const contexts = db.prepare(`
    SELECT c.*, 
           (SELECT COUNT(*) FROM context_maps cm WHERE cm.context_id = c.id) as map_count
    FROM contexts c
    ORDER BY c.is_default DESC, c.name ASC
  `).all() as any[];

  const contextsWithHealth = contexts.map(context => {
    const actions = db.prepare(`
      SELECT a.priority, a.implementation_state
      FROM actions a
      JOIN activities act ON a.activity_id = act.id
      JOIN context_maps cm ON act.map_id = cm.map_id
      WHERE cm.context_id = ?
    `).all(context.id) as { priority: string; implementation_state: string }[];
    
    const health: MapHealth = calculateHealth(actions);
    return { ...context, health };
  });

  res.json(contextsWithHealth);
};

export const getContextById = (req: Request, res: Response): void => {
  const context = db.prepare(`
    SELECT c.*, 
           (SELECT COUNT(*) FROM context_maps cm WHERE cm.context_id = c.id) as map_count
    FROM contexts c
    WHERE c.id = ?
  `).get(req.params.id);
  if (!context) {
    res.status(404).json({ error: 'Context not found' });
    return;
  }
  res.json(context);
};

export const getContextWithMaps = (req: Request, res: Response): void => {
  const context = db.prepare('SELECT * FROM contexts WHERE id = ?').get(req.params.id);
  if (!context) {
    res.status(404).json({ error: 'Context not found' });
    return;
  }

  const maps = db.prepare(`
    SELECT m.*
    FROM maps m
    JOIN context_maps cm ON m.id = cm.map_id
    WHERE cm.context_id = ?
    ORDER BY m.name
  `).all(req.params.id) as any[];

  const mapsWithHealth = maps.map(map => {
    const actions = db.prepare(`
      SELECT a.priority, a.implementation_state
      FROM actions a
      JOIN activities act ON a.activity_id = act.id
      WHERE act.map_id = ?
    `).all(map.id) as { priority: string; implementation_state: string }[];
    
    const health: MapHealth = calculateHealth(actions);
    return { ...map, health };
  });

  const allActions = db.prepare(`
    SELECT a.priority, a.implementation_state
    FROM actions a
    JOIN activities act ON a.activity_id = act.id
    JOIN context_maps cm ON act.map_id = cm.map_id
    WHERE cm.context_id = ?
  `).all(req.params.id) as { priority: string; implementation_state: string }[];

  const contextHealth: MapHealth = calculateHealth(allActions);

  res.json({ ...context, maps: mapsWithHealth, health: contextHealth });
};

export const createContext = (req: Request, res: Response): void => {
  const { uid, name, description } = req.body;
  if (!uid || !name) {
    res.status(400).json({ error: 'uid and name are required' });
    return;
  }
  const stmt = db.prepare(
    'INSERT INTO contexts (uid, name, description) VALUES (?, ?, ?)'
  );
  const result = stmt.run(uid, name, description || null);
  const context = db.prepare('SELECT * FROM contexts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(context);
};

export const updateContext = (req: Request, res: Response): void => {
  const { name, description } = req.body;
  const existing = db.prepare('SELECT * FROM contexts WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Context not found' });
    return;
  }
  const stmt = db.prepare(
    'UPDATE contexts SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  stmt.run(name, description || null, req.params.id);
  const context = db.prepare('SELECT * FROM contexts WHERE id = ?').get(req.params.id);
  res.json(context);
};

export const deleteContext = (req: Request, res: Response): void => {
  const existing = db.prepare('SELECT * FROM contexts WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Context not found' });
    return;
  }
  if ((existing as any).is_default) {
    res.status(400).json({ error: 'Cannot delete the default context' });
    return;
  }
  db.prepare('DELETE FROM contexts WHERE id = ?').run(req.params.id);
  res.status(204).send();
};

export const getContextMaps = (req: Request, res: Response): void => {
  const context = db.prepare('SELECT id FROM contexts WHERE id = ?').get(req.params.id);
  if (!context) {
    res.status(404).json({ error: 'Context not found' });
    return;
  }
  const maps = db.prepare(`
    SELECT m.*
    FROM maps m
    JOIN context_maps cm ON m.id = cm.map_id
    WHERE cm.context_id = ?
    ORDER BY m.name
  `).all(req.params.id) as any[];

  const mapsWithHealth = maps.map(map => {
    const actions = db.prepare(`
      SELECT a.priority, a.implementation_state
      FROM actions a
      JOIN activities act ON a.activity_id = act.id
      WHERE act.map_id = ?
    `).all(map.id) as { priority: string; implementation_state: string }[];
    
    const health: MapHealth = calculateHealth(actions);
    return { ...map, health };
  });

  res.json(mapsWithHealth);
};

export const addMapToContext = (req: Request, res: Response): void => {
  const { mapId } = req.body;
  const contextId = Number(req.params.id);
  
  if (!mapId) {
    res.status(400).json({ error: 'mapId is required' });
    return;
  }

  const context = db.prepare('SELECT id FROM contexts WHERE id = ?').get(contextId);
  if (!context) {
    res.status(404).json({ error: 'Context not found' });
    return;
  }

  const map = db.prepare('SELECT id FROM maps WHERE id = ?').get(mapId);
  if (!map) {
    res.status(404).json({ error: 'Map not found' });
    return;
  }

  const existing = db.prepare(
    'SELECT * FROM context_maps WHERE context_id = ? AND map_id = ?'
  ).get(contextId, mapId);
  if (existing) {
    res.status(400).json({ error: 'Map is already in this context' });
    return;
  }

  db.prepare('INSERT INTO context_maps (context_id, map_id) VALUES (?, ?)').run(contextId, mapId);
  res.status(201).json({ context_id: contextId, map_id: mapId });
};

export const removeMapFromContext = (req: Request, res: Response): void => {
  const contextId = Number(req.params.id);
  const mapId = Number(req.params.mapId);

  const existing = db.prepare(
    'SELECT * FROM context_maps WHERE context_id = ? AND map_id = ?'
  ).get(contextId, mapId);
  if (!existing) {
    res.status(404).json({ error: 'Map is not in this context' });
    return;
  }

  db.prepare('DELETE FROM context_maps WHERE context_id = ? AND map_id = ?').run(contextId, mapId);
  res.status(204).send();
};
