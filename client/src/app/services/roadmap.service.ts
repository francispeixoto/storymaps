import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoadmapItem } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoadmapService {
  private apiUrl = `${environment.apiUrl}/roadmap`;

  constructor(private http: HttpClient) {}

  getRoadmap(contextId?: number, minPriority?: string, status?: string): Observable<{ roadmap: RoadmapItem[] }> {
    let params = new HttpParams();
    
    if (contextId) {
      params = params.set('contextId', contextId.toString());
    }
    if (minPriority) {
      params = params.set('minPriority', minPriority);
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<{ roadmap: RoadmapItem[] }>(this.apiUrl, { params });
  }
}