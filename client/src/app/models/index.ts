export interface Map {
  id: number;
  uid: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  uid: string;
  map_id: number;
  name: string;
  priority: 'Need' | 'Want' | 'Nice';
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: number;
  uid: string;
  activity_id: number;
  name: string;
  actor: 'PM' | 'Developer' | 'DevOps';
  priority: 'Need' | 'Want' | 'Nice';
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