export interface Map {
  id: number;
  uid: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Actor {
  id: number;
  uid: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  satisfaction?: number;
  action_count?: number;
}

export interface Activity {
  id: number;
  uid: string;
  map_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: number;
  uid: string;
  activity_id: number;
  actor_id?: number;
  actor_name?: string;
  name: string;
  priority: 'Need' | 'Want' | 'Nice';
  implementation_state: 'Full' | 'Partial' | 'None';
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ActionDependency {
  id: number;
  action_id: number;
  depends_on_action_id: number;
  depends_on_uid?: string;
  depends_on_name?: string;
}

export interface ActorAction {
  id: number;
  uid: string;
  activity_id: number;
  actor_id?: number;
  name: string;
  priority: 'Need' | 'Want' | 'Nice';
  implementation_state: 'Full' | 'Partial' | 'None';
  description?: string;
  created_at: string;
  updated_at: string;
  activity_uid: string;
  activity_name: string;
  map_uid: string;
  map_name: string;
}