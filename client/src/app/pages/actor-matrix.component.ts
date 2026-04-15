import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActorService } from '../services/actor.service';
import { MapService } from '../services/map.service';
import { Actor, ActorAction, Map } from '../models';

@Component({
  selector: 'app-actor-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-full mx-auto">
      <div class="mb-6">
        <div class="flex items-center gap-4">
          <h2 class="text-2xl font-bold">{{ actor?.name }}</h2>
          <div *ngIf="actor?.action_count && (actor?.action_count || 0) > 0" [class]="getSatisfactionClass(actor?.satisfaction)" class="flex items-center gap-1">
            <span class="text-xl font-bold">{{ actor?.satisfaction }}</span>
            <span class="text-sm">({{ getSatisfactionCategory(actor?.satisfaction) }})</span>
          </div>
        </div>
        <p *ngIf="actor?.description" class="text-gray-600 mt-1">{{ actor?.description }}</p>
        <p *ngIf="actor?.action_count" class="text-sm text-gray-500 mt-1">{{ actor?.action_count }} action{{ actor?.action_count !== 1 ? 's' : '' }}</p>
      </div>

      <div *ngIf="maps.length > 0" class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Map(s):</label>
        <div class="flex flex-wrap gap-2">
          <label *ngFor="let map of maps" class="flex items-center gap-1 px-3 py-1 rounded border cursor-pointer hover:bg-gray-50"
            [class.bg-indigo-50]="isMapSelected(map.id)"
            [class.border-indigo-500]="isMapSelected(map.id)"
            [class.border-gray-300]="!isMapSelected(map.id)">
            <input type="checkbox" [checked]="isMapSelected(map.id)" (change)="toggleMap(map.id)" class="sr-only" />
            <span class="text-sm">{{ map.name }}</span>
          </label>
        </div>
      </div>

      <div *ngIf="!actor" class="text-center py-8 text-gray-500">Loading...</div>

      <div *ngIf="actor && filteredActions.length === 0" class="text-center py-8 text-gray-500">
        No actions found for this actor.
      </div>

      <div *ngIf="actor && filteredActions.length > 0" class="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
        <table class="w-full min-w-[800px]">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="w-24 p-3 text-left text-sm font-medium text-gray-500"></th>
              <th *ngFor="let activity of uniqueActivities" class="p-3 text-left text-sm font-medium text-gray-900 border-l border-gray-200">
                {{ activity }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let priority of priorities" class="border-b border-gray-200 last:border-0">
              <td class="p-3">
                <span [class]="getPriorityClass(priority)" class="px-3 py-1 text-sm font-medium rounded">
                  {{ priority }}
                </span>
              </td>
              <td *ngFor="let activity of uniqueActivities" class="p-2 border-l border-gray-200 align-top">
                <div class="space-y-2 min-h-[60px]">
                  <div
                    *ngFor="let action of getActions(activity, priority)"
                    class="p-2 rounded bg-gray-50 border border-gray-200 text-sm"
                  >
                    <div class="flex items-center gap-2">
                      <span [class]="getImplementationStateDot(action.implementation_state)" class="w-2 h-2 rounded-full flex-shrink-0"></span>
                      <span class="font-medium flex-1">{{ action.name }}</span>
                      <span class="px-1.5 py-0.5 text-xs rounded bg-purple-100 text-purple-800">
                        {{ action.map_name }}
                      </span>
                    </div>
                    <p *ngIf="action.description" class="mt-1 text-gray-500 text-xs">{{ action.description }}</p>
                  </div>
                  <div *ngIf="getActions(activity, priority).length === 0" class="text-gray-300 text-sm">
                    -
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ActorMatrixComponent implements OnInit {
  actor: Actor | null = null;
  actions: ActorAction[] = [];
  maps: Map[] = [];
  selectedMapIds: number[] = [];
  priorities = ['Need', 'Want', 'Nice'];
  actorId: number | null = null;

  constructor(
    private actorService: ActorService,
    private mapService: MapService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.actorId = +params['id'];
        this.loadActor();
        this.loadMaps();
      }
    });
  }

  loadActor(): void {
    if (!this.actorId) return;
    this.actorService.getById(this.actorId).subscribe({
      next: (actor) => {
        this.actor = actor;
        this.loadActions();
      },
      error: (err) => console.error('Error loading actor:', err)
    });
  }

  loadMaps(): void {
    this.mapService.getAll().subscribe({
      next: (maps) => {
        this.maps = maps;
        this.selectedMapIds = maps.map(m => m.id);
      },
      error: (err) => console.error('Error loading maps:', err)
    });
  }

  loadActions(): void {
    if (!this.actorId) return;
    this.actorService.getActions(this.actorId).subscribe({
      next: (actions: ActorAction[]) => {
        this.actions = actions;
      },
      error: (err: any) => console.error('Error loading actions:', err)
    });
  }

  isMapSelected(mapId: number): boolean {
    return this.selectedMapIds.includes(mapId);
  }

  toggleMap(mapId: number): void {
    const index = this.selectedMapIds.indexOf(mapId);
    if (index > -1) {
      this.selectedMapIds.splice(index, 1);
    } else {
      this.selectedMapIds.push(mapId);
    }
  }

  get uniqueActivities(): string[] {
    const activities = new Set(this.filteredActions.map(a => a.activity_name));
    return Array.from(activities).sort();
  }

  get filteredActions(): ActorAction[] {
    return this.actions.filter(a => {
      const map = this.maps.find(m => m.name === a.map_name);
      return map && this.selectedMapIds.includes(map.id);
    });
  }

  getActions(activityName: string, priority: string): ActorAction[] {
    return this.filteredActions.filter(
      a => a.activity_name === activityName && a.priority === priority
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

  getSatisfactionClass(score: number | undefined): string {
    if (score === undefined) return 'text-gray-500';
    if (score >= 50) return 'text-green-600';
    if (score >= 0) return 'text-yellow-600';
    return 'text-red-600';
  }

  getSatisfactionCategory(score: number | undefined): string {
    if (score === undefined) return 'N/A';
    if (score >= 50) return 'Promoter';
    if (score >= 0) return 'Passive';
    return 'Detractor';
  }

  getImplementationStateDot(state: string): string {
    switch (state) {
      case 'Full': return 'bg-green-500';
      case 'Partial': return 'bg-yellow-500';
      case 'None': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }
}
