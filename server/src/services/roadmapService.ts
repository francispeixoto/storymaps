import db from '../models/db';
import { calculateHealth, MapHealth } from '../utils/health';

const PRIORITY_ORDER: Record<string, number> = {
  'Need': 3,
  'Want': 2,
  'Nice': 1
};

const IMPL_ORDER: Record<string, number> = {
  'None': 3,
  'Partial': 2,
  'Full': 1
};

export interface ActionBlocker {
  actionId: number;
  actionName: string;
  priority: 'Need' | 'Want' | 'Nice';
  blockingPriority: string;
  state: 'None' | 'Partial' | 'Full';
  status: 'blocked' | 'warning' | 'ready';
}

export interface RoadmapItem {
  level: 'context' | 'map' | 'activity' | 'action';
  id: number;
  uid: string;
  name: string;
  priority: 'Need' | 'Want' | 'Nice';
  implementationState: 'Full' | 'Partial' | 'None';
  health?: MapHealth;
  workRemaining: number;
  dependencyBlockCount: number;
  dependencyBlockers: ActionBlocker[];
  children: RoadmapItem[];
}

interface ActionRow {
  id: number;
  uid: string;
  name: string;
  priority: string;
  implementation_state: string;
  activity_id: number;
  activity_name: string;
  map_id: number;
  map_name: string;
  context_id: number;
  context_name: string;
}

interface ActivityRow {
  id: number;
  uid: string;
  name: string;
  priority: string;
  map_id: number;
  map_name: string;
  context_id: number;
  context_name: string;
}

function analyzeBlockers(actionId: number, actionPriority: string, dependencies: any[]): { blockers: ActionBlocker[]; blockCount: number } {
  const blockers: ActionBlocker[] = [];
  let blockCount = 0;

  for (const dep of dependencies) {
    const depPriority = dep.priority as 'Need' | 'Want' | 'Nice';
    const depState = dep.implementation_state as 'None' | 'Partial' | 'Full';
    
    let status: 'blocked' | 'warning' | 'ready' = 'ready';
    
    // Determine status based on priority and state
    if (PRIORITY_ORDER[depPriority] < PRIORITY_ORDER[actionPriority]) {
      // Lower priority dependency - always a problem
      status = depState === 'None' ? 'blocked' : 'warning';
    } else if (depState === 'None') {
      status = 'blocked';
    } else if (depState === 'Partial') {
      status = 'warning';
    }

    if (status !== 'ready') {
      blockCount++;
    }

    blockers.push({
      actionId: dep.id,
      actionName: dep.name,
      priority: depPriority,
      blockingPriority: `${actionPriority} → ${depPriority}`,
      state: depState,
      status
    });
  }

  return { blockers, blockCount };
}

export function getRoadmap(contextId?: number): RoadmapItem[] {
  // Get all actions with their hierarchy
  const actions = db.prepare(`
    SELECT 
      a.id, a.uid, a.name, a.priority, a.implementation_state,
      a.activity_id,
      act.name as activity_name,
      m.id as map_id, m.name as map_name,
      c.id as context_id, c.name as context_name
    FROM actions a
    JOIN activities act ON a.activity_id = act.id
    JOIN maps m ON act.map_id = m.id
    LEFT JOIN context_maps cm ON m.id = cm.map_id
    LEFT JOIN contexts c ON cm.context_id = c.id
    WHERE (? IS NULL) OR c.id = ?
  `).all(contextId ?? null, contextId ?? null) as ActionRow[];

  // Get all activities (including those with no actions)
  const activities = db.prepare(`
    SELECT 
      act.id, act.uid, act.name, act.priority,
      m.id as map_id, m.name as map_name,
      c.id as context_id, c.name as context_name
    FROM activities act
    JOIN maps m ON act.map_id = m.id
    LEFT JOIN context_maps cm ON m.id = cm.map_id
    LEFT JOIN contexts c ON cm.context_id = c.id
    WHERE (? IS NULL) OR c.id = ?
  `).all(contextId ?? null, contextId ?? null) as ActivityRow[];

  // Get dependencies for all relevant actions
  const actionIds = actions.map(a => a.id);
  const dependenciesMap: Map<number, any[]> = new Map();
  
  if (actionIds.length > 0) {
    const placeholders = actionIds.map(() => '?').join(',');
    const deps = db.prepare(`
      SELECT ad.action_id, a.id, a.uid, a.name, a.priority, a.implementation_state
      FROM action_dependencies ad
      JOIN actions a ON ad.depends_on_action_id = a.id
      WHERE ad.action_id IN (${placeholders})
    `).all(...actionIds) as any[];
    
    for (const dep of deps) {
      if (!dependenciesMap.has(dep.action_id)) {
        dependenciesMap.set(dep.action_id, []);
      }
      dependenciesMap.get(dep.action_id)!.push(dep);
    }
  }

  // Build action items with blockers
  const actionMap: Map<number, RoadmapItem> = new Map();
  const activityActionMap: Map<number, RoadmapItem[]> = new Map();
  const mapActivityMap: Map<number, RoadmapItem[]> = new Map();
  const contextMapMap: Map<number, RoadmapItem[]> = new Map();
  const contextMap: Map<number, RoadmapItem> = new Map();

  // Process actions
  for (const action of actions) {
    const deps = dependenciesMap.get(action.id) || [];
    const { blockers, blockCount } = analyzeBlockers(action.id, action.priority, deps);

    const isIncomplete = action.implementation_state !== 'Full';
    
    const item: RoadmapItem = {
      level: 'action',
      id: action.id,
      uid: action.uid,
      name: action.name,
      priority: action.priority as 'Need' | 'Want' | 'Nice',
      implementationState: action.implementation_state as 'Full' | 'Partial' | 'None',
      workRemaining: isIncomplete ? 1 : 0,
      dependencyBlockCount: blockCount,
      dependencyBlockers: blockers,
      children: []
    };

    actionMap.set(action.id, item);

    if (!activityActionMap.has(action.activity_id)) {
      activityActionMap.set(action.activity_id, []);
    }
    activityActionMap.get(action.activity_id)!.push(item);
  }

  // Get all maps with their activities
  const maps = db.prepare(`
    SELECT m.id, m.uid, m.name, c.id as context_id, c.name as context_name
    FROM maps m
    LEFT JOIN context_maps cm ON m.id = cm.map_id
    LEFT JOIN contexts c ON cm.context_id = c.id
    WHERE (? IS NULL) OR c.id = ?
  `).all(contextId ?? null, contextId ?? null) as any[];

  // Process activities (grouped by map)
  for (const activity of activities) {
    const activityActions = activityActionMap.get(activity.id) || [];
    const workRemaining = activityActions.reduce((sum, a) => sum + a.workRemaining, 0);
    const maxBlockCount = Math.max(0, ...activityActions.map(a => a.dependencyBlockCount));
    const maxPriority = activityActions.reduce((max: 'Need' | 'Want' | 'Nice', a) => 
      PRIORITY_ORDER[a.priority] > PRIORITY_ORDER[max] ? a.priority : max, 'Nice');
    const minImplState = activityActions.reduce((min: 'Full' | 'Partial' | 'None', a) => 
      IMPL_ORDER[a.implementationState] < IMPL_ORDER[min] ? a.implementationState : min, 'Full');

    const item: RoadmapItem = {
      level: 'activity',
      id: activity.id,
      uid: activity.uid,
      name: activity.name,
      priority: maxPriority,
      implementationState: minImplState,
      workRemaining,
      dependencyBlockCount: maxBlockCount,
      dependencyBlockers: [],
      children: activityActions
    };

    if (!mapActivityMap.has(activity.map_id)) {
      mapActivityMap.set(activity.map_id, []);
    }
    mapActivityMap.get(activity.map_id)!.push(item);
  }

  // Process maps
  for (const map of maps) {
    const mapActivities = mapActivityMap.get(map.id) || [];
    const workRemaining = mapActivities.reduce((sum, a) => sum + a.workRemaining, 0);
    const maxBlockCount = Math.max(0, ...mapActivities.map(a => a.dependencyBlockCount));
    const maxPriority = mapActivities.reduce((max: 'Need' | 'Want' | 'Nice', a) => 
      PRIORITY_ORDER[a.priority] > PRIORITY_ORDER[max] ? a.priority : max, 'Nice');
    const minImplState = mapActivities.reduce((min: 'Full' | 'Partial' | 'None', a) => 
      IMPL_ORDER[a.implementationState] < IMPL_ORDER[min] ? a.implementationState : min, 'Full');

    // Calculate map health from actions
    const mapActions = actions.filter(a => a.map_id === map.id);
    const health = mapActions.length > 0 ? calculateHealth(mapActions.map(a => ({
      priority: a.priority,
      implementation_state: a.implementation_state
    }))) : undefined;

    const item: RoadmapItem = {
      level: 'map',
      id: map.id,
      uid: map.uid,
      name: map.name,
      priority: maxPriority,
      implementationState: minImplState,
      health,
      workRemaining,
      dependencyBlockCount: maxBlockCount,
      dependencyBlockers: [],
      children: mapActivities
    };

    if (map.context_id) {
      if (!contextMapMap.has(map.context_id)) {
        contextMapMap.set(map.context_id, []);
      }
      contextMapMap.get(map.context_id)!.push(item);
    } else {
      // Handle maps without context
      if (!contextMapMap.has(0)) {
        contextMapMap.set(0, []);
      }
      contextMapMap.get(0)!.push(item);
    }

    // Store map reference
    if (!contextMap.has(map.context_id || 0)) {
      contextMap.set(map.context_id || 0, {
        level: 'context',
        id: map.context_id || 0,
        uid: 'default',
        name: map.context_name || 'Uncategorized',
        priority: 'Nice',
        implementationState: 'Full',
        workRemaining: 0,
        dependencyBlockCount: 0,
        dependencyBlockers: [],
        children: []
      });
    }
  }

  // Process contexts
  const contextItems: RoadmapItem[] = [];
  const allContexts = db.prepare(`
    SELECT id, uid, name FROM contexts
  `).all() as any[];

  for (const ctx of allContexts) {
    const ctxMaps = contextMapMap.get(ctx.id) || [];
    const workRemaining = ctxMaps.reduce((sum, m) => sum + m.workRemaining, 0);
    const maxBlockCount = Math.max(0, ...ctxMaps.map(m => m.dependencyBlockCount));
    const maxPriority = ctxMaps.reduce((max: 'Need' | 'Want' | 'Nice', m) => 
      PRIORITY_ORDER[m.priority] > PRIORITY_ORDER[max] ? m.priority : max, 'Nice');
    const minImplState = ctxMaps.reduce((min: 'Full' | 'Partial' | 'None', m) => 
      IMPL_ORDER[m.implementationState] < IMPL_ORDER[min] ? m.implementationState : min, 'Full');

    // Get all actions for this context to calculate health
    const contextActions = actions.filter(a => a.context_id === ctx.id);
    const health = contextActions.length > 0 ? calculateHealth(contextActions.map(a => ({
      priority: a.priority,
      implementation_state: a.implementation_state
    }))) : undefined;

    const item: RoadmapItem = {
      level: 'context',
      id: ctx.id,
      uid: ctx.uid,
      name: ctx.name,
      priority: maxPriority,
      implementationState: minImplState,
      health,
      workRemaining,
      dependencyBlockCount: maxBlockCount,
      dependencyBlockers: [],
      children: ctxMaps
    };

    contextItems.push(item);
  }

  // Sort children at each level
  const sortItems = (items: RoadmapItem[]): RoadmapItem[] => {
    return items
      .filter(item => item.workRemaining > 0 || item.children.some(c => c.workRemaining > 0))
      .sort((a, b) => {
        // Primary: blockers first
        if (b.dependencyBlockCount !== a.dependencyBlockCount) {
          return b.dependencyBlockCount - a.dependencyBlockCount;
        }
        // Secondary: priority (Need > Want > Nice)
        if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority]) {
          return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
        }
        // Tertiary: implementation state (None > Partial > Full)
        if (IMPL_ORDER[a.implementationState] !== IMPL_ORDER[b.implementationState]) {
          return IMPL_ORDER[a.implementationState] - IMPL_ORDER[b.implementationState];
        }
        // Quaternary: health score (ascending)
        const aScore = a.health?.score ?? 100;
        const bScore = b.health?.score ?? 100;
        return aScore - bScore;
      })
      .map(item => ({
        ...item,
        children: sortItems(item.children)
      }));
  };

  return sortItems(contextItems);
}