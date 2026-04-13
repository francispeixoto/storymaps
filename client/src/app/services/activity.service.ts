import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Activity } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = 'http://localhost:3000/api/activities';

  constructor(private http: HttpClient) {}

  getAll(mapId?: number): Observable<Activity[]> {
    const url = mapId ? `${this.apiUrl}?map_id=${mapId}` : this.apiUrl;
    return this.http.get<Activity[]>(url);
  }

  getById(id: number): Observable<Activity> {
    return this.http.get<Activity>(`${this.apiUrl}/${id}`);
  }

  create(activity: Partial<Activity>): Observable<Activity> {
    const uid = `maps-${(activity as any).map_id}-act-${Date.now()}`;
    return this.http.post<Activity>(this.apiUrl, { uid, ...activity });
  }

  update(id: number, activity: Partial<Activity>): Observable<Activity> {
    return this.http.put<Activity>(`${this.apiUrl}/${id}`, activity);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}