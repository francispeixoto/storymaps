import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Map } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private apiUrl = 'http://localhost:3000/api/maps';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Map[]> {
    return this.http.get<Map[]>(this.apiUrl);
  }

  getById(id: number): Observable<Map> {
    return this.http.get<Map>(`${this.apiUrl}/${id}`);
  }

  create(map: Partial<Map>): Observable<Map> {
    return this.http.post<Map>(this.apiUrl, map);
  }

  update(id: number, map: Partial<Map>): Observable<Map> {
    return this.http.put<Map>(`${this.apiUrl}/${id}`, map);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}