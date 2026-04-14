import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MapService } from '../services/map.service';
import { ActivityService } from '../services/activity.service';
import { ActionService } from '../services/action.service';
import { Map, Activity, Action } from '../models';

@Component({
  selector: 'app-map-matrix',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-full mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold">{{ map?.name }}</h2>
          <p *ngIf="map?.description" class="text-gray-600 mt-1">{{ map?.description }}</p>
        </div>
        <div class="flex gap-2">
          <button
            (click)="goToEdit()"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Edit
          </button>
          <button
            (click)="goBack()"
            class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>

      <div *ngIf="map" class="matrix-container">
        <div class="matrix-scroll-content">
          <table class="matrix-table">
            <thead class="matrix-thead">
              <tr>
                <th class="matrix-corner"></th>
                <th *ngFor="let activity of activities" class="matrix-header-col">
                  {{ activity.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let priority of priorities" class="matrix-row">
                <td class="matrix-row-header">
                  <span [class]="getPriorityClass(priority)" class="px-3 py-1 text-sm font-medium rounded">
                    {{ priority }}
                  </span>
                </td>
                <td *ngFor="let activity of activities" class="matrix-cell">
                  <div class="space-y-2 min-h-[60px]">
                    <div
                      *ngFor="let action of getActions(activity.id, priority)"
                      class="action-card"
                    >
                      <div class="flex items-center justify-between">
                        <span class="font-medium">{{ action.name }}</span>
                        <span class="ml-2 px-1.5 py-0.5 text-xs rounded bg-gray-100">
                          {{ action.actor_name || '-' }}
                        </span>
                      </div>
                      <p *ngIf="action.description" class="mt-1 text-gray-500 text-xs">{{ action.description }}</p>
                    </div>
                    <div *ngIf="getActions(activity.id, priority).length === 0" class="text-gray-300 text-sm">
                      -
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="!map" class="text-center py-8 text-gray-500">
        Loading...
      </div>
    </div>
  `
})
export class MapMatrixComponent implements OnInit {
  map: Map | null = null;
  activities: Activity[] = [];
  actions: Action[] = [];
  priorities = ['Need', 'Want', 'Nice'];
  mapId: number | null = null;

  constructor(
    private mapService: MapService,
    private activityService: ActivityService,
    private actionService: ActionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.mapId = +params['id'];
        this.loadMap();
      }
    });
  }

  loadMap(): void {
    if (!this.mapId) return;
    this.mapService.getById(this.mapId).subscribe({
      next: (map) => this.map = map,
      error: (err) => console.error('Error loading map:', err)
    });
    this.activityService.getAll(this.mapId).subscribe({
      next: (activities) => {
        this.activities = activities;
        this.loadActions(activities);
      },
      error: (err) => console.error('Error loading activities:', err)
    });
  }

  loadActions(activities: Activity[]): void {
    let loaded = 0;
    activities.forEach(activity => {
      this.actionService.getAll(activity.id).subscribe({
        next: (actions) => {
          this.actions = [...this.actions, ...actions];
          loaded++;
        },
        error: (err) => console.error('Error loading actions:', err)
      });
    });
  }

  getActions(activityId: number, priority: string): Action[] {
    return this.actions.filter(
      a => a.activity_id === activityId && a.priority === priority
    );
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Need': return 'bg-red-100 text-red-800';
      case 'Want': return 'bg-blue-100 text-blue-800';
      case 'Nice': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  goToEdit(): void {
    if (this.mapId) {
      this.router.navigate(['/maps', this.mapId, 'edit']);
    }
  }

  goBack(): void {
    if (this.mapId) {
      this.router.navigate(['/maps', this.mapId]);
    }
  }
}