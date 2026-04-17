export interface MapHealth {
  score: number;
  totalActions: number;
  fullCount: number;
  partialCount: number;
  noneCount: number;
  byPriority: {
    Need: { full: number; partial: number; none: number; total: number; score: number };
    Want: { full: number; partial: number; none: number; total: number; score: number };
    Nice: { full: number; partial: number; none: number; total: number; score: number };
  };
}

export interface ActionRow {
  priority: string;
  implementation_state: string;
}

const PRIORITY_WEIGHTS: Record<string, number> = {
  'Need': 3,
  'Want': 2,
  'Nice': 1
};

const IMPL_WEIGHTS: Record<string, number> = {
  'Full': 1.0,
  'Partial': 0.5,
  'None': 0.0
};

export function calculateHealth(actions: ActionRow[]): MapHealth {
  const defaultPriorityResult = { full: 0, partial: 0, none: 0, total: 0, score: 0 };
  
  const health: MapHealth = {
    score: 0,
    totalActions: 0,
    fullCount: 0,
    partialCount: 0,
    noneCount: 0,
    byPriority: {
      Need: { ...defaultPriorityResult },
      Want: { ...defaultPriorityResult },
      Nice: { ...defaultPriorityResult }
    }
  };

  if (actions.length === 0) {
    return health;
  }

  health.totalActions = actions.length;

  let totalWeight = 0;
  let weightedScore = 0;

  for (const action of actions) {
    const priorityWeight = PRIORITY_WEIGHTS[action.priority] || 1;
    const implWeight = IMPL_WEIGHTS[action.implementation_state] || 0;
    
    totalWeight += priorityWeight;
    weightedScore += priorityWeight * implWeight;

    const priority = action.priority as keyof typeof health.byPriority;
    if (health.byPriority[priority]) {
      health.byPriority[priority].total++;
      
      switch (action.implementation_state) {
        case 'Full':
          health.fullCount++;
          health.byPriority[priority].full++;
          break;
        case 'Partial':
          health.partialCount++;
          health.byPriority[priority].partial++;
          break;
        case 'None':
          health.noneCount++;
          health.byPriority[priority].none++;
          break;
      }
    }
  }

  if (totalWeight > 0) {
    health.score = Math.round((weightedScore / totalWeight) * 100);
  }

  for (const priority of ['Need', 'Want', 'Nice'] as const) {
    const p = health.byPriority[priority];
    if (p.total > 0) {
      let pWeight = 0;
      let pScore = 0;
      pWeight += p.full * 1;
      pWeight += p.partial * 0.5;
      pWeight += p.none * 0;
      pScore = (pWeight / p.total) * 100;
      p.score = Math.round(pScore);
    }
  }

  return health;
}
