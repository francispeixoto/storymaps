import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Action, ActionDependency, ActionWithContext } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActionService {
  private apiUrl = `${environment.apiUrl}/actions`;

  constructor(private http: HttpClient) {}

  getAll(activityId?: number, implementationState?: string[]): Observable<Action[]> {
    let url = this.apiUrl;
    const params: string[] = [];
    if (activityId) params.push(`activity_id=${activityId}`);
    if (implementationState && implementationState.length > 0) {
      params.push(`implementation_state=${implementationState.join(',')}`);
    }
    if (params.length > 0) url += '?' + params.join('&');
    return this.http.get<Action[]>(url);
  }

  getAllWithContext(): Observable<ActionWithContext[]> {
    return this.http.get<ActionWithContext[]>(`${this.apiUrl}/all-with-context`);
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

  getPrerequisitesOf(actionId: number): Observable<ActionWithContext[]> {
    return this.http.get<ActionWithContext[]>(`${this.apiUrl}/${actionId}/prerequisites-of`);
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