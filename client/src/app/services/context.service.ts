import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context, ContextWithMaps, Map } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContextService {
  private apiUrl = `${environment.apiUrl}/contexts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Context[]> {
    return this.http.get<Context[]>(this.apiUrl);
  }

  getById(id: number): Observable<Context> {
    return this.http.get<Context>(`${this.apiUrl}/${id}`);
  }

  getWithMaps(id: number): Observable<ContextWithMaps> {
    return this.http.get<ContextWithMaps>(`${this.apiUrl}/${id}`);
  }

  create(context: Partial<Context>): Observable<Context> {
    const uid = `context-${Date.now()}`;
    return this.http.post<Context>(this.apiUrl, { uid, ...context });
  }

  update(id: number, context: Partial<Context>): Observable<Context> {
    return this.http.put<Context>(`${this.apiUrl}/${id}`, context);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMaps(contextId: number): Observable<Map[]> {
    return this.http.get<Map[]>(`${this.apiUrl}/${contextId}/maps`);
  }

  addMap(contextId: number, mapId: number): Observable<{ context_id: number; map_id: number }> {
    return this.http.post<{ context_id: number; map_id: number }>(`${this.apiUrl}/${contextId}/maps`, { mapId });
  }

  removeMap(contextId: number, mapId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${contextId}/maps/${mapId}`);
  }
}
