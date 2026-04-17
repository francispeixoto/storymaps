import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ContextService } from '../services/context.service';
import { ToastService } from '../services/toast.service';
import { ConfirmDeleteDialogComponent } from '../components/confirm-delete-dialog.component';
import { MapSelectorModalComponent } from '../components/map-selector-modal.component';
import { MatrixComponent } from './matrix.component';
import { Context, Map } from '../models';

@Component({
  selector: 'app-context-detail',
  standalone: true,
  imports: [CommonModule, ConfirmDeleteDialogComponent, MapSelectorModalComponent, MatrixComponent],
  template: `
    <div *ngIf="context">
      <div class="flex justify-between items-center mb-6">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-2xl font-bold">{{ context.name }}</h2>
            <span *ngIf="context.is_default" class="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800">system</span>
          </div>
          <p *ngIf="context.description" class="text-gray-600 mt-1">{{ context.description }}</p>
        </div>
        <div class="flex gap-2">
          <button
            *ngIf="!context.is_default"
            (click)="goToEdit()"
            class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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

      <div *ngIf="context.health && context.health.totalActions > 0" class="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <div class="flex items-center justify-between mb-3">
          <span class="font-medium text-indigo-900">Context Health</span>
          <span [class]="getScoreClass(context.health.score) + ' text-lg font-bold'">
            {{ context.health.score }}
          </span>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-3">
          <div *ngFor="let priority of ['Need', 'Want', 'Nice']" class="bg-white rounded p-2">
            <div class="text-xs text-gray-500 mb-1">{{ priority }}</div>
            <div class="flex items-center gap-1 text-xs">
              <span class="text-green-600">{{ context.health.byPriority[priority].full }}F</span>
              <span class="text-yellow-600">{{ context.health.byPriority[priority].partial }}P</span>
              <span class="text-red-600">{{ context.health.byPriority[priority].none }}N</span>
            </div>
            <div class="mt-1 h-2 bg-gray-200 rounded overflow-hidden">
              <div 
                class="h-full bg-indigo-500 transition-all"
                [style.width.%]="getPriorityProgress(context.health.byPriority[priority])"
              ></div>
            </div>
          </div>
        </div>
        <div class="text-xs text-gray-600">
          Overall: {{ context.health.fullCount }} Full / {{ context.health.partialCount }} Partial / {{ context.health.noneCount }} None ({{ context.health.totalActions }} total)
        </div>
      </div>

      <div class="mb-4">
        <button
          (click)="showMapSelector = true"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Map
        </button>
      </div>

      <div *ngIf="maps.length === 0" class="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p class="text-gray-600 mb-4">No maps in this context yet.</p>
        <button
          (click)="showMapSelector = true"
          class="text-indigo-600 hover:text-indigo-800"
        >
          Add your first map
        </button>
      </div>

      <div class="space-y-6">
        <div *ngFor="let map of maps" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div 
            class="flex justify-between items-center px-4 py-3 bg-gray-50 cursor-pointer"
            (click)="toggleMapExpanded(map.id)"
          >
            <div class="flex items-center gap-3">
              <span class="text-gray-400">{{ expandedMapId === map.id ? '▼' : '▶' }}</span>
              <h3 class="font-medium">{{ map.name }}</h3>
              <span [class]="getScoreClass(map.health?.score)" class="font-medium">
                {{ map.health?.score || 0 }}
              </span>
              <span class="text-xs text-gray-500">
                {{ map.health?.fullCount || 0 }}F / {{ map.health?.partialCount || 0 }}P / {{ map.health?.noneCount || 0 }}N
              </span>
            </div>
            <button
              (click)="removeMap(map); $event.stopPropagation()"
              class="text-gray-400 hover:text-red-600"
              title="Remove from context"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div *ngIf="expandedMapId === map.id" class="p-4">
            <div *ngIf="map.health && map.health.totalActions > 0" class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Implementation by Priority</h4>
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-gray-500 text-xs">
                    <th class="pb-2">Priority</th>
                    <th class="pb-2">Full</th>
                    <th class="pb-2">Partial</th>
                    <th class="pb-2">None</th>
                    <th class="pb-2 w-32">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let priority of ['Need', 'Want', 'Nice']" class="border-t border-gray-200">
                    <td class="py-2 font-medium">{{ priority }}</td>
                    <td class="py-2">
                      <span *ngIf="map.health!.byPriority[priority].full > 0" class="text-green-600">
                        {{ map.health!.byPriority[priority].full }}
                      </span>
                      <span *ngIf="map.health!.byPriority[priority].full === 0" class="text-gray-400">-</span>
                    </td>
                    <td class="py-2">
                      <span *ngIf="map.health!.byPriority[priority].partial > 0" class="text-yellow-600">
                        {{ map.health!.byPriority[priority].partial }}
                      </span>
                      <span *ngIf="map.health!.byPriority[priority].partial === 0" class="text-gray-400">-</span>
                    </td>
                    <td class="py-2">
                      <span *ngIf="map.health!.byPriority[priority].none > 0" class="text-red-600">
                        {{ map.health!.byPriority[priority].none }}
                      </span>
                      <span *ngIf="map.health!.byPriority[priority].none === 0" class="text-gray-400">-</span>
                    </td>
                    <td class="py-2">
                      <div class="flex items-center gap-2">
                        <div class="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                          <div 
                            class="h-full bg-indigo-500 transition-all"
                            [style.width.%]="getPriorityProgress(map.health!.byPriority[priority])"
                          ></div>
                        </div>
                        <span class="text-xs text-gray-500 w-8">{{ map.health!.byPriority[priority].score }}%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <app-matrix [mapId]="map.id"></app-matrix>
          </div>
        </div>
      </div>
    </div>

    <app-map-selector-modal
      *ngIf="showMapSelector && context"
      [contextId]="context.id"
      (mapAdded)="onMapAdded($event)"
      (mapCreated)="onMapCreated($event)"
      (close)="showMapSelector = false"
    ></app-map-selector-modal>

    <app-confirm-delete-dialog
      *ngIf="showRemoveConfirm"
      [itemName]="pendingRemoveMap?.name || ''"
      itemType="map"
      (confirmed)="onRemoveConfirmed()"
      (cancelled)="onRemoveCancelled()"
    ></app-confirm-delete-dialog>
  `
})
export class ContextDetailComponent implements OnInit {
  context: Context | null = null;
  maps: Map[] = [];
  expandedMapId: number | null = null;
  showMapSelector = false;
  showRemoveConfirm = false;
  pendingRemoveMap: Map | null = null;

  constructor(
    private contextService: ContextService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadContext(+params['id']);
      }
    });
  }

  loadContext(id: number): void {
    this.contextService.getWithMaps(id).subscribe({
      next: (context) => {
        this.context = context;
        this.maps = context.maps || [];
        if (this.maps.length > 0 && this.expandedMapId === null) {
          this.expandedMapId = this.maps[0].id;
        }
      },
      error: (err) => {
        console.error('Error loading context:', err);
        this.router.navigate(['/']);
      }
    });
  }

  toggleMapExpanded(mapId: number): void {
    this.expandedMapId = this.expandedMapId === mapId ? null : mapId;
  }

  getScoreClass(score: number | undefined): string {
    if (score === undefined || score === null) return 'text-gray-500';
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 25) return 'text-orange-500';
    return 'text-red-600';
  }

  getPriorityProgress(priorityStats: { full: number; partial: number; none: number; total: number; score: number }): number {
    if (priorityStats.total === 0) return 0;
    return priorityStats.score;
  }

  onMapAdded(mapId: number): void {
    if (!this.context) return;
    this.contextService.addMap(this.context.id, mapId).subscribe({
      next: () => {
        this.toastService.showSuccess('Map added to context');
        this.loadContext(this.context!.id);
        this.showMapSelector = false;
      },
      error: (err) => {
        console.error('Error adding map:', err);
        this.toastService.showError('Failed to add map');
      }
    });
  }

  onMapCreated(mapId: number): void {
    this.loadContext(this.context!.id);
    this.expandedMapId = mapId;
    this.showMapSelector = false;
    this.toastService.showSuccess('Map created and added to context');
  }

  removeMap(map: Map): void {
    this.pendingRemoveMap = map;
    this.showRemoveConfirm = true;
  }

  onRemoveConfirmed(): void {
    if (!this.context || !this.pendingRemoveMap) return;
    this.contextService.removeMap(this.context.id, this.pendingRemoveMap.id).subscribe({
      next: () => {
        this.toastService.showSuccess(`Map '${this.pendingRemoveMap!.name}' removed from context`);
        this.showRemoveConfirm = false;
        this.pendingRemoveMap = null;
        this.loadContext(this.context!.id);
      },
      error: (err) => {
        console.error('Error removing map:', err);
        this.toastService.showError('Failed to remove map');
        this.showRemoveConfirm = false;
        this.pendingRemoveMap = null;
      }
    });
  }

  onRemoveCancelled(): void {
    this.showRemoveConfirm = false;
    this.pendingRemoveMap = null;
  }

  goToEdit(): void {
    if (this.context) {
      this.router.navigate(['/contexts', this.context.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
