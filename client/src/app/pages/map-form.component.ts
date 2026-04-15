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
  selector: 'app-map-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmDeleteDialogComponent],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">
          {{ mode === 'create' ? 'Create New Map' : mode === 'edit' ? 'Edit Map' : 'Map Details' }}
        </h2>
        <div class="flex gap-2" *ngIf="mode === 'view'">
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
      
      <!-- View Mode -->
      <div *ngIf="mode === 'view' && map" class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">{{ map.name }}</h3>
          <p *ngIf="map.description" class="mt-2 text-gray-600">{{ map.description }}</p>
          <p class="mt-4 text-sm text-gray-500">UID: {{ map.uid }}</p>
          <p class="text-sm text-gray-500">Created: {{ map.created_at | date:'medium' }}</p>
        </div>

        <!-- Activities Section (View Mode) -->
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-medium text-gray-900">Activities</h4>
          </div>
          <div *ngIf="activities.length === 0" class="text-gray-500">No activities yet. Click "Add Activity" to create one.</div>
          <div *ngFor="let activity of activities" class="border-b border-gray-200 last:border-0 py-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="toggleActivityActions(activity.id)"
                  class="text-sm text-gray-500 hover:text-gray-700"
                >
                  {{ expandedActivityId === activity.id ? '▼' : '▶' }}
                </button>
                <span class="font-medium">{{ activity.name }}</span>
                <span [class]="getPriorityClass(activity.priority)" class="px-2 py-0.5 text-xs rounded">
                  {{ activity.priority }}
                </span>
              </div>
              <button
                type="button"
                (click)="openAddActionModal(activity.id)"
                class="text-sm text-indigo-600 hover:text-indigo-800"
              >
                + Add Action
              </button>
            </div>
            <!-- Actions List (collapsed by default) -->
            <div *ngIf="expandedActivityId === activity.id" class="mt-2 ml-6 pl-4 border-l-2 border-gray-200">
              <div *ngFor="let action of getActivityActions(activity.id)" class="flex items-center justify-between py-1 text-sm">
                <div class="flex items-center gap-2">
                  <span>{{ action.name }}</span>
                  <span class="px-2 py-0.5 text-xs rounded bg-gray-100">{{ action.actor_name || '-' }}</span>
                </div>
                <span [class]="getPriorityClass(action.priority)" class="px-2 py-0.5 text-xs rounded">{{ action.priority }}</span>
              </div>
              <div *ngIf="getActivityActions(activity.id).length === 0" class="text-gray-400 text-sm py-1">No actions</div>
            </div>
          </div>
        </div>

        <!-- Add Activity Modal (View Mode) -->
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

        <!-- Add Action Modal (View Mode) -->
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
      </div>

      <!-- Form Mode (Create/Edit) -->
      <form *ngIf="mode !== 'view'" [formGroup]="mapForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Map Details</h3>
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Map Name *</label>
            <input
              type="text"
              id="name"
              formControlName="name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              [class.border-red-500]="mapForm.get('name')?.invalid && mapForm.get('name')?.touched"
            />
            <p *ngIf="mapForm.get('name')?.invalid && mapForm.get('name')?.touched" class="mt-1 text-sm text-red-600">
              Map name is required
            </p>
          </div>

          <div class="mt-4">
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              formControlName="description"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            ></textarea>
          </div>
        </div>

        <!-- Activities Section (Edit mode only) -->
        <div *ngIf="mode === 'edit'" class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Activities</h3>
            <button
              type="button"
              (click)="showActivityForm = !showActivityForm"
              class="text-sm text-indigo-600 hover:text-indigo-800"
            >
              {{ showActivityForm ? 'Cancel' : '+ Add Activity' }}
            </button>
          </div>

          <!-- Add Activity Form -->
          <div *ngIf="showActivityForm" class="mb-4 p-4 bg-gray-50 rounded-lg">
            <form [formGroup]="activityForm" (ngSubmit)="addActivity()" class="space-y-4">
              <div>
                <label for="activityName" class="block text-sm font-medium text-gray-700">Activity Name *</label>
                <input
                  type="text"
                  id="activityName"
                  formControlName="name"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>
              <div>
                <label for="priority" class="block text-sm font-medium text-gray-700">Priority *</label>
                <select
                  id="priority"
                  formControlName="priority"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                >
                  <option value="Need">Need</option>
                  <option value="Want">Want</option>
                  <option value="Nice">Nice</option>
                </select>
              </div>
              <button
                type="submit"
                [disabled]="activityForm.invalid || submittingActivity"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {{ submittingActivity ? 'Adding...' : 'Add Activity' }}
              </button>
            </form>
          </div>

          <!-- Activity List -->
          <div *ngIf="activities.length === 0" class="text-gray-500">No activities yet. Add your first activity above.</div>
          <div *ngFor="let activity of activities" class="border-b border-gray-200 last:border-0">
            <div class="flex items-center justify-between py-2">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="toggleActivityActions(activity.id)"
                  class="text-sm text-gray-500 hover:text-gray-700"
                >
                  {{ expandedActivityId === activity.id ? '▼' : '▶' }}
                </button>
                <span class="font-medium">{{ activity.name }}</span>
                <span [class]="getPriorityClass(activity.priority)" class="px-2 py-0.5 text-xs rounded">
                  {{ activity.priority }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-400">{{ activity.uid }}</span>
                <button
                  type="button"
                  (click)="deleteActivity(activity.id, activity.name)"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            <!-- Actions inside activity (edit mode) -->
            <div *ngIf="expandedActivityId === activity.id" class="ml-6 pl-4 border-l-2 border-gray-200 pb-2">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-500">Actions ({{ getActivityActions(activity.id).length }})</span>
                <button
                  type="button"
                  (click)="showAddActionForm(activity.id)"
                  class="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  {{ addActionToActivityId === activity.id ? 'Cancel' : '+ Add Action' }}
                </button>
              </div>
              <!-- Add Action Form -->
              <div *ngIf="addActionToActivityId === activity.id" class="mb-2 p-2 bg-gray-50 rounded text-sm">
                <form [formGroup]="actionForm" (ngSubmit)="addAction(activity.id)" class="space-y-2">
                  <input
                    type="text"
                    formControlName="name"
                    placeholder="Action name *"
                    class="w-full rounded border-gray-300 px-2 py-1 text-sm"
                  />
                  <div class="flex gap-2">
                    <div class="flex items-center gap-1">
                      <select formControlName="actor_id" class="rounded border-gray-300 px-2 py-1 text-sm">
                        <option [ngValue]="null">Select actor...</option>
                        <option *ngFor="let actor of actors" [ngValue]="actor.id">{{ actor.name }}</option>
                      </select>
                      <button type="button" (click)="showNewActorModal = true" class="text-indigo-600 hover:text-indigo-800 text-xs">+ New</button>
                    </div>
                    <select formControlName="priority" class="rounded border-gray-300 px-2 py-1 text-sm">
                      <option value="Need">Need</option>
                      <option value="Want">Want</option>
                      <option value="Nice">Nice</option>
                    </select>
                  </div>
                  <textarea
                    formControlName="description"
                    placeholder="Description (optional)"
                    rows="2"
                    class="w-full rounded border-gray-300 px-2 py-1 text-sm"
                  ></textarea>
                  <button
                    type="submit"
                    [disabled]="actionForm.invalid || submittingAction"
                    class="px-2 py-1 bg-indigo-600 text-white text-xs rounded"
                  >
                    {{ submittingAction ? 'Adding...' : 'Add' }}
                  </button>
                </form>
              </div>
              <!-- Actions List -->
              <div *ngFor="let action of getActivityActions(activity.id)" class="flex items-center justify-between py-1 text-sm border-b border-gray-100 last:border-0">
                <div class="flex items-center gap-2">
                  <span>{{ action.name }}</span>
                  <span class="px-1.5 py-0.5 text-xs rounded bg-gray-100">{{ action.actor_name || '-' }}</span>
                  <span [class]="getPriorityClass(action.priority)" class="px-1.5 py-0.5 text-xs rounded">{{ action.priority }}</span>
                </div>
                <button
                  type="button"
                  (click)="deleteAction(action.id, activity.id, action.name)"
                  class="text-red-600 hover:text-red-800 text-xs"
                >
                  Delete
                </button>
              </div>
              <div *ngIf="getActivityActions(activity.id).length === 0" class="text-gray-400 text-sm py-1">No actions</div>
            </div>
          </div>
        </div>

        <div class="flex gap-4">
          <button
            type="submit"
            [disabled]="mapForm.invalid || submitting"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? 'Saving...' : (mode === 'edit' ? 'Update Map' : 'Create Map') }}
          </button>
          <button
            type="button"
            (click)="goBack()"
            class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>

        <p *ngIf="error" class="text-sm text-red-600">{{ error }}</p>
      </form>

      <!-- New Actor Modal -->
      <div *ngIf="showNewActorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h3 class="text-lg font-medium mb-4">Create New Actor</h3>
          <form [formGroup]="newActorForm" (ngSubmit)="createActorAndSelect()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Actor Name *</label>
              <input type="text" formControlName="name" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea formControlName="description" rows="2" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border"></textarea>
            </div>
            <div class="flex justify-end gap-2">
              <button type="button" (click)="showNewActorModal = false" class="px-3 py-2 border border-gray-300 text-gray-700 rounded">Cancel</button>
              <button type="submit" [disabled]="newActorForm.invalid || submittingNewActor" class="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">
                {{ submittingNewActor ? 'Creating...' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <app-confirm-delete-dialog
        *ngIf="showDeleteConfirm"
        [itemName]="pendingDeleteItem?.name || ''"
        [itemType]="pendingDeleteItem?.type || 'action'"
        (confirmed)="onDeleteConfirmed()"
        (cancelled)="onDeleteCancelled()"
      ></app-confirm-delete-dialog>
    </div>
  `
})
export class MapFormComponent implements OnInit {
  mapForm!: FormGroup;
  activityForm!: FormGroup;
  actionForm!: FormGroup;
  submitting = false;
  submittingActivity = false;
  submittingAction = false;
  error = '';
  mode: 'create' | 'edit' | 'view' = 'create';
  map: Map | null = null;
  mapId: number | null = null;
  activities: Activity[] = [];
  actionsByActivity: { [activityId: number]: Action[] } = {};
  expandedActivityId: number | null = null;
  showActivityForm = false;
  showAddActivityModal = false;
  addActionToActivityId: number | null = null;
  showAddActionModal = false;
  actors: Actor[] = [];
  showNewActorModal = false;
  newActorForm!: FormGroup;
  submittingNewActor = false;
  showDeleteConfirm = false;
  pendingDeleteItem: { id: number; activityId?: number; name: string; type: 'activity' | 'action' } | null = null;

  constructor(
    private fb: FormBuilder,
    private mapService: MapService,
    private activityService: ActivityService,
    private actionService: ActionService,
    private actorService: ActorService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.mapForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });

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
      name: ['', Validators.required],
      description: ['']
    });

    this.loadActors();

    this.route.data.subscribe(data => {
      this.mode = data['mode'] || 'create';
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.mapId = +params['id'];
        this.loadMap();
        this.loadActivities();
      }
    });
  }

  loadMap(): void {
    if (!this.mapId) return;
    this.mapService.getById(this.mapId).subscribe({
      next: (map) => {
        this.map = map;
        if (this.mode === 'edit') {
          this.mapForm.patchValue({
            name: map.name,
            description: map.description || ''
          });
        }
      },
      error: (err) => {
        console.error('Error loading map:', err);
        this.error = 'Failed to load map';
      }
    });
  }

  loadActivities(): void {
    if (!this.mapId) return;
    this.activityService.getAll(this.mapId).subscribe({
      next: (activities) => {
        this.activities = activities;
        this.loadActionsForActivities(activities);
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

  createActorAndSelect(): void {
    if (this.newActorForm.invalid) return;
    
    this.submittingNewActor = true;
    const { name, description } = this.newActorForm.value;
    
    this.actorService.create({ name, description }).subscribe({
      next: (actor) => {
        this.actors = [...this.actors, actor];
        this.actionForm.patchValue({ actor_id: actor.id });
        this.showNewActorModal = false;
        this.newActorForm.reset({ name: '', description: '' });
        this.submittingNewActor = false;
      },
      error: (err) => {
        console.error('Error creating actor:', err);
        this.submittingNewActor = false;
      }
    });
  }

  loadActionsForActivities(activities: Activity[]): void {
    activities.forEach(activity => {
      this.actionService.getAll(activity.id).subscribe({
        next: (actions) => {
          this.actionsByActivity[activity.id] = actions;
        },
        error: (err) => console.error('Error loading actions:', err)
      });
    });
  }

  getActivityActions(activityId: number): Action[] {
    return this.actionsByActivity[activityId] || [];
  }

  toggleActivityActions(activityId: number): void {
    this.expandedActivityId = this.expandedActivityId === activityId ? null : activityId;
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
        this.loadActivities();
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
        this.loadActivities();
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

  addActivity(): void {
    if (!this.mapId || this.activityForm.invalid) return;
    
    this.submittingActivity = true;
    const { name, priority } = this.activityForm.value;
    
    this.activityService.create({
      name,
      priority,
      map_id: this.mapId
    }).subscribe({
      next: () => {
        this.loadActivities();
        this.activityForm.reset({ priority: 'Need' });
        this.showActivityForm = false;
        this.submittingActivity = false;
      },
      error: (err) => {
        console.error('Error adding activity:', err);
        this.submittingActivity = false;
      }
    });
  }

  deleteActivity(id: number, name: string): void {
    this.pendingDeleteItem = { id, name, type: 'activity' };
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed(): void {
    if (!this.pendingDeleteItem) return;

    if (this.pendingDeleteItem.type === 'activity') {
      this.activityService.delete(this.pendingDeleteItem.id).subscribe({
        next: () => {
          this.loadActivities();
          this.closeDeleteDialog();
        },
        error: (err) => console.error('Error deleting activity:', err)
      });
    } else if (this.pendingDeleteItem.type === 'action') {
      this.actionService.delete(this.pendingDeleteItem.id).subscribe({
        next: () => {
          if (this.pendingDeleteItem?.activityId) {
            const actions = this.actionsByActivity[this.pendingDeleteItem.activityId] || [];
            this.actionsByActivity[this.pendingDeleteItem.activityId] = actions.filter(a => a.id !== this.pendingDeleteItem!.id);
          }
          this.closeDeleteDialog();
        },
        error: (err) => console.error('Error deleting action:', err)
      });
    }
  }

  closeDeleteDialog(): void {
    this.showDeleteConfirm = false;
    this.pendingDeleteItem = null;
  }

  onDeleteCancelled(): void {
    this.closeDeleteDialog();
  }

  showAddActionForm(activityId: number): void {
    this.addActionToActivityId = this.addActionToActivityId === activityId ? null : activityId;
    if (this.addActionToActivityId === activityId) {
      this.actionForm.reset({ actor_id: null, priority: 'Need' });
    }
  }

  addAction(activityId: number): void {
    if (this.actionForm.invalid) return;
    
    this.submittingAction = true;
    const { name, actor_id, priority, description } = this.actionForm.value;
    
    this.actionService.create({
      name,
      actor_id: actor_id || null,
      priority,
      description,
      activity_id: activityId
    }).subscribe({
      next: () => {
        this.loadActionsForActivities(this.activities);
        this.actionForm.reset({ actor_id: null, priority: 'Need' });
        this.addActionToActivityId = null;
        this.submittingAction = false;
      },
      error: (err) => {
        console.error('Error adding action:', err);
        this.submittingAction = false;
      }
    });
  }

  deleteAction(actionId: number, activityId: number, name: string): void {
    this.pendingDeleteItem = { id: actionId, activityId, name, type: 'action' };
    this.showDeleteConfirm = true;
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Need': return 'bg-red-100 text-red-800';
      case 'Want': return 'bg-blue-100 text-blue-800';
      case 'Nice': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getActorClass(actor: string): string {
    switch (actor) {
      case 'PM': return 'bg-purple-100 text-purple-800';
      case 'Developer': return 'bg-yellow-100 text-yellow-800';
      case 'DevOps': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  onSubmit(): void {
    if (this.mapForm.invalid) return;

    this.submitting = true;
    this.error = '';
    const formValue = this.mapForm.value;
    
    if (this.mode === 'edit' && this.mapId) {
      this.mapService.update(this.mapId, formValue).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Error updating map:', err);
          this.error = 'Failed to update map. Please try again.';
          this.submitting = false;
        }
      });
    } else {
      this.mapService.create(formValue).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Error creating map:', err);
          this.error = 'Failed to create map. Please try again.';
          this.submitting = false;
        }
      });
    }
  }

  goToEdit(): void {
    if (this.mapId) {
      this.router.navigate(['/maps', this.mapId, 'edit']);
    }
  }

  goToMatrix(): void {
    if (this.mapId) {
      this.router.navigate(['/maps', this.mapId, 'matrix']);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}