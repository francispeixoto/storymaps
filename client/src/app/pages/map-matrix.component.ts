import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MapService } from '../services/map.service';
import { ActivityService } from '../services/activity.service';
import { ActionService } from '../services/action.service';
import { ActorService } from '../services/actor.service';
import { ConfirmDeleteDialogComponent } from '../components/confirm-delete-dialog.component';
import { Map, Activity, Action, Actor } from '../models';

@Component({
  selector: 'app-map-matrix',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmDeleteDialogComponent],
  template: `
    <div class="max-w-full mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold">{{ map?.name }}</h2>
          <p *ngIf="map?.description" class="text-gray-600 mt-1">{{ map?.description }}</p>
        </div>
        <div class="flex gap-2">
          <button
            (click)="showAddActivityModal = true"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Activity
          </button>
          <button
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

      <div *ngIf="map" class="matrix-container">
        <div class="matrix-scroll-content">
          <table class="matrix-table">
            <thead class="matrix-thead">
              <tr>
                <th class="matrix-corner"></th>
                <th *ngFor="let activity of activities" class="matrix-header-col">
                  <div class="flex items-center justify-between">
                    <span>{{ activity.name }}</span>
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        (click)="openEditActivityModal(activity)"
                        class="text-xs text-gray-400 hover:text-gray-600"
                        title="Edit activity"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                      </button>
                      <button
                        type="button"
                        (click)="openAddActionModal(activity.id)"
                        class="text-xs text-indigo-600 hover:text-indigo-800 ml-1"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
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
                      class="action-card cursor-pointer"
                      (click)="openEditActionModal(action)"
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

    <!-- Add Activity Modal -->
    <div *ngIf="showAddActivityModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">Add Activity</h3>
        <form [formGroup]="activityForm" (ngSubmit)="addActivityFromModal()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Activity Name *</label>
            <input type="text" formControlName="name" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Priority *</label>
            <select formControlName="priority" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border">
              <option value="Need">Need</option>
              <option value="Want">Want</option>
              <option value="Nice">Nice</option>
            </select>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" (click)="showAddActivityModal = false" class="px-3 py-2 border border-gray-300 text-gray-700 rounded">Cancel</button>
            <button type="submit" [disabled]="activityForm.invalid" class="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Add</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Action Modal -->
    <div *ngIf="showAddActionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">Add Action</h3>
        <form [formGroup]="actionForm" (ngSubmit)="addActionFromModal()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Action Name *</label>
            <input type="text" formControlName="name" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border" />
          </div>
          <div class="flex gap-2">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700">Actor</label>
              <div class="flex items-center gap-1">
                <select formControlName="actor_id" class="mt-1 block w-full rounded border-gray-300 px-2 py-2 border text-sm">
                  <option [ngValue]="null">Select actor...</option>
                  <option *ngFor="let actor of actors" [ngValue]="actor.id">{{ actor.name }}</option>
                </select>
                <button type="button" (click)="showNewActorModal = true" class="text-indigo-600 hover:text-indigo-800 text-xs">+ New</button>
              </div>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700">Priority *</label>
              <select formControlName="priority" class="mt-1 block w-full rounded border-gray-300 px-2 py-2 border text-sm">
                <option value="Need">Need</option>
                <option value="Want">Want</option>
                <option value="Nice">Nice</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea formControlName="description" rows="2" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border"></textarea>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" (click)="showAddActionModal = false" class="px-3 py-2 border border-gray-300 text-gray-700 rounded">Cancel</button>
            <button type="submit" [disabled]="actionForm.invalid" class="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Add</button>
          </div>
        </form>
      </div>
    </div>

    <!-- New Actor Modal -->
    <div *ngIf="showNewActorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">Add Actor</h3>
        <form [formGroup]="newActorForm" (ngSubmit)="addActorFromModal()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Actor Name *</label>
            <input type="text" formControlName="name" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border" />
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" (click)="showNewActorModal = false" class="px-3 py-2 border border-gray-300 text-gray-700 rounded">Cancel</button>
            <button type="submit" [disabled]="newActorForm.invalid" class="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Add</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Activity Modal -->
    <div *ngIf="showEditActivityModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">Edit Activity</h3>
        <form [formGroup]="editActivityForm" (ngSubmit)="updateActivityFromModal()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Activity Name *</label>
            <input type="text" formControlName="name" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Priority *</label>
            <select formControlName="priority" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border">
              <option value="Need">Need</option>
              <option value="Want">Want</option>
              <option value="Nice">Nice</option>
            </select>
          </div>
          <div class="flex justify-between items-center">
            <button type="button" (click)="confirmDeleteActivity()" class="text-sm text-red-600 hover:text-red-800">
              Delete Activity
            </button>
            <div class="flex gap-2">
              <button type="button" (click)="showEditActivityModal = false" class="px-3 py-2 border border-gray-300 text-gray-700 rounded">Cancel</button>
              <button type="submit" [disabled]="editActivityForm.invalid" class="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Action Modal -->
    <div *ngIf="showEditActionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">Edit Action</h3>
        <form [formGroup]="editActionForm" (ngSubmit)="updateActionFromModal()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Action Name *</label>
            <input type="text" formControlName="name" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border" />
          </div>
          <div class="flex gap-2">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700">Actor</label>
              <div class="flex items-center gap-1">
                <select formControlName="actor_id" class="mt-1 block w-full rounded border-gray-300 px-2 py-2 border text-sm">
                  <option [ngValue]="null">Select actor...</option>
                  <option *ngFor="let actor of actors" [ngValue]="actor.id">{{ actor.name }}</option>
                </select>
                <button type="button" (click)="showNewActorModal = true" class="text-indigo-600 hover:text-indigo-800 text-xs">+ New</button>
              </div>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700">Priority *</label>
              <select formControlName="priority" class="mt-1 block w-full rounded border-gray-300 px-2 py-2 border text-sm">
                <option value="Need">Need</option>
                <option value="Want">Want</option>
                <option value="Nice">Nice</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea formControlName="description" rows="2" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border"></textarea>
          </div>
          <div class="flex justify-between items-center">
            <button type="button" (click)="confirmDeleteAction()" class="text-sm text-red-600 hover:text-red-800">
              Delete Action
            </button>
            <div class="flex gap-2">
              <button type="button" (click)="showEditActionModal = false" class="px-3 py-2 border border-gray-300 text-gray-700 rounded">Cancel</button>
              <button type="submit" [disabled]="editActionForm.invalid" class="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <app-confirm-delete-dialog
      *ngIf="showDeleteConfirm"
      [itemName]="pendingDeleteItem?.name || ''"
      [itemType]="pendingDeleteItem?.type || 'action'"
      (confirmed)="onDeleteConfirmed()"
      (cancelled)="onDeleteCancelled()"
    ></app-confirm-delete-dialog>
  `
})
export class MapMatrixComponent implements OnInit {
  map: Map | null = null;
  activities: Activity[] = [];
  actions: Action[] = [];
  priorities = ['Need', 'Want', 'Nice'];
  mapId: number | null = null;

  showAddActivityModal = false;
  showAddActionModal = false;
  showNewActorModal = false;
  showEditActivityModal = false;
  showEditActionModal = false;
  showDeleteConfirm = false;
  addActionToActivityId: number | null = null;

  activityForm!: FormGroup;
  actionForm!: FormGroup;
  newActorForm!: FormGroup;
  editActivityForm!: FormGroup;
  editActionForm!: FormGroup;

  pendingDeleteItem: { id: number; name: string; type: 'activity' | 'action' } | null = null;
  editingActivityId: number | null = null;
  editingActionId: number | null = null;

  actors: Actor[] = [];
  submittingActivity = false;
  submittingAction = false;

  constructor(
    private mapService: MapService,
    private activityService: ActivityService,
    private actionService: ActionService,
    private actorService: ActorService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activityForm = this.fb.group({
      name: ['', Validators.required],
      priority: ['Need', Validators.required]
    });
    this.actionForm = this.fb.group({
      name: ['', Validators.required],
      actor_id: [null],
      priority: ['Need', Validators.required],
      description: ['']
    });
    this.newActorForm = this.fb.group({
      name: ['', Validators.required]
    });
    this.editActivityForm = this.fb.group({
      name: ['', Validators.required],
      priority: ['Need', Validators.required]
    });
    this.editActionForm = this.fb.group({
      name: ['', Validators.required],
      actor_id: [null],
      priority: ['Need', Validators.required],
      description: ['']
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.mapId = +params['id'];
        this.loadMap();
        this.loadActors();
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

  loadActors(): void {
    this.actorService.getAll().subscribe({
      next: (actors) => this.actors = actors,
      error: (err) => console.error('Error loading actors:', err)
    });
  }

  loadActions(activities: Activity[]): void {
    this.actions = [];
    activities.forEach(activity => {
      this.actionService.getAll(activity.id).subscribe({
        next: (actions) => {
          this.actions = [...this.actions, ...actions];
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

  addActivityFromModal(): void {
    if (!this.mapId || this.activityForm.invalid) return;
    
    this.submittingActivity = true;
    const { name, priority } = this.activityForm.value;
    
    this.activityService.create({
      name,
      priority,
      map_id: this.mapId
    }).subscribe({
      next: () => {
        this.loadMap();
        this.activityForm.reset({ priority: 'Need' });
        this.showAddActivityModal = false;
        this.submittingActivity = false;
      },
      error: (err) => {
        console.error('Error adding activity:', err);
        this.submittingActivity = false;
      }
    });
  }

  openAddActionModal(activityId: number): void {
    this.addActionToActivityId = activityId;
    this.actionForm.reset({ actor_id: null, priority: 'Need' });
    this.showAddActionModal = true;
  }

  addActionFromModal(): void {
    if (!this.addActionToActivityId || this.actionForm.invalid) return;
    
    this.submittingAction = true;
    const { name, actor_id, priority, description } = this.actionForm.value;
    
    this.actionService.create({
      name,
      actor_id,
      priority,
      description,
      activity_id: this.addActionToActivityId
    }).subscribe({
      next: () => {
        this.loadMap();
        this.actionForm.reset({ actor_id: null, priority: 'Need' });
        this.showAddActionModal = false;
        this.addActionToActivityId = null;
        this.submittingAction = false;
      },
      error: (err) => {
        console.error('Error adding action:', err);
        this.submittingAction = false;
      }
    });
  }

  addActorFromModal(): void {
    if (this.newActorForm.invalid) return;
    
    const { name } = this.newActorForm.value;
    
    this.actorService.create({ name }).subscribe({
      next: () => {
        this.loadActors();
        this.newActorForm.reset({ name: '' });
        this.showNewActorModal = false;
      },
      error: (err) => console.error('Error adding actor:', err)
    });
  }

  goToEdit(): void {
    if (this.mapId) {
      this.router.navigate(['/maps', this.mapId, 'edit']);
    }
  }

  goBack(): void {
    if (this.mapId) {
      this.router.navigate(['/maps', this.mapId, 'activities']);
    }
  }

  openEditActivityModal(activity: Activity): void {
    this.editingActivityId = activity.id;
    this.editActivityForm.patchValue({
      name: activity.name,
      priority: activity.priority
    });
    this.showEditActivityModal = true;
  }

  updateActivityFromModal(): void {
    if (!this.editingActivityId || this.editActivityForm.invalid) return;

    const { name, priority } = this.editActivityForm.value;

    this.activityService.update(this.editingActivityId, { name, priority }).subscribe({
      next: () => {
        this.loadMap();
        this.showEditActivityModal = false;
        this.editingActivityId = null;
      },
      error: (err) => console.error('Error updating activity:', err)
    });
  }

  confirmDeleteActivity(): void {
    if (!this.editingActivityId) return;
    const activity = this.activities.find(a => a.id === this.editingActivityId);
    this.pendingDeleteItem = {
      id: this.editingActivityId,
      name: activity?.name || '',
      type: 'activity'
    };
    this.showEditActivityModal = false;
    this.showDeleteConfirm = true;
  }

  openEditActionModal(action: Action): void {
    this.editingActionId = action.id;
    this.editActionForm.patchValue({
      name: action.name,
      actor_id: action.actor_id || null,
      priority: action.priority,
      description: action.description || ''
    });
    this.showEditActionModal = true;
  }

  updateActionFromModal(): void {
    if (!this.editingActionId || this.editActionForm.invalid) return;

    const { name, actor_id, priority, description } = this.editActionForm.value;

    this.actionService.update(this.editingActionId, {
      name,
      actor_id: actor_id || null,
      priority,
      description
    }).subscribe({
      next: () => {
        this.loadMap();
        this.showEditActionModal = false;
        this.editingActionId = null;
      },
      error: (err) => console.error('Error updating action:', err)
    });
  }

  confirmDeleteAction(): void {
    if (!this.editingActionId) return;
    const action = this.actions.find(a => a.id === this.editingActionId);
    this.pendingDeleteItem = {
      id: this.editingActionId,
      name: action?.name || '',
      type: 'action'
    };
    this.showEditActionModal = false;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed(): void {
    if (!this.pendingDeleteItem) return;

    if (this.pendingDeleteItem.type === 'activity') {
      this.activityService.delete(this.pendingDeleteItem.id).subscribe({
        next: () => {
          this.loadMap();
          this.closeDeleteDialog();
        },
        error: (err) => console.error('Error deleting activity:', err)
      });
    } else {
      this.actionService.delete(this.pendingDeleteItem.id).subscribe({
        next: () => {
          this.loadMap();
          this.closeDeleteDialog();
        },
        error: (err) => console.error('Error deleting action:', err)
      });
    }
  }

  closeDeleteDialog(): void {
    this.showDeleteConfirm = false;
    this.pendingDeleteItem = null;
    this.editingActivityId = null;
    this.editingActionId = null;
  }

  onDeleteCancelled(): void {
    this.closeDeleteDialog();
  }
}