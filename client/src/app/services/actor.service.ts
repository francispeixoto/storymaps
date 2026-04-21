import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Actor, ActorAction } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActorService {
  private apiUrl = `${environment.apiUrl}/actors`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Actor[]> {
    return this.http.get<Actor[]>(this.apiUrl);
  }

  getById(id: number): Observable<Actor> {
    return this.http.get<Actor>(`${this.apiUrl}/${id}`);
  }

  getActions(id: number): Observable<ActorAction[]> {
    return this.http.get<ActorAction[]>(`${this.apiUrl}/${id}/actions`);
  }

  create(actor: Partial<Actor>): Observable<Actor> {
    const uid = `actor-${Date.now()}`;
    return this.http.post<Actor>(this.apiUrl, { uid, ...actor });
  }

  update(id: number, actor: Partial<Actor>): Observable<Actor> {
    return this.http.put<Actor>(`${this.apiUrl}/${id}`, actor);
  }

  delete(id: number, reassignTo?: number): Observable<void> {
    if (reassignTo !== undefined) {
      return this.http.delete<void>(`${this.apiUrl}/${id}`, { body: { reassignTo } });
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}