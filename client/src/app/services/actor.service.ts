import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Actor } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ActorService {
  private apiUrl = 'http://localhost:3000/api/actors';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Actor[]> {
    return this.http.get<Actor[]>(this.apiUrl);
  }

  getById(id: number): Observable<Actor> {
    return this.http.get<Actor>(`${this.apiUrl}/${id}`);
  }

  create(actor: Partial<Actor>): Observable<Actor> {
    const uid = `actor-${Date.now()}`;
    return this.http.post<Actor>(this.apiUrl, { uid, ...actor });
  }

  update(id: number, actor: Partial<Actor>): Observable<Actor> {
    return this.http.put<Actor>(`${this.apiUrl}/${id}`, actor);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}