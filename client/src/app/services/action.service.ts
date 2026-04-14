import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Action, ActionDependency } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActionService {
  private apiUrl = `${environment.apiUrl}/actions`;

  constructor(private http: HttpClient) {}

  getAll(activityId?: number): Observable<Action[]> {
    const url = activityId ? `${this.apiUrl}?activity_id=${activityId}` : this.apiUrl;
    return this.http.get<Action[]>(url);
  }

  getById(id: number): Observable<Action> {
    return this.http.get<Action>(`${this.apiUrl}/${id}`);
  }

  create(action: Partial<Action>): Observable<Action> {
    const uid = `maps-${(action as any).activity_id}-act-${Date.now()}`;
    return this.http.post<Action>(this.apiUrl, { uid, ...action });
  }

  update(id: number, action: Partial<Action>): Observable<Action> {
    return this.http.put<Action>(`${this.apiUrl}/${id}`, action);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getDependencies(actionId: number): Observable<ActionDependency[]> {
    return this.http.get<ActionDependency[]>(`${this.apiUrl}/${actionId}/dependencies`);
  }

  addDependency(actionId: number, dependsOnActionId: number): Observable<ActionDependency> {
    return this.http.post<ActionDependency>(`${this.apiUrl}/${actionId}/dependencies`, {
      depends_on_action_id: dependsOnActionId
    });
  }

  removeDependency(actionId: number, dependsOnActionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${actionId}/dependencies/${dependsOnActionId}`);
  }
}