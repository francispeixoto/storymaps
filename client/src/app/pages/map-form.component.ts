import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MapService } from '../services/map.service';
import { ActivityService } from '../services/activity.service';
import { Map, Activity } from '../models';

@Component({
  selector: 'app-map-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">
          {{ mode === 'create' ? 'Create New Map' : mode === 'edit' ? 'Edit Map' : 'Map Details' }}
        </h2>
        <div class="flex gap-2" *ngIf="mode === 'view'">
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
      
      <!-- View Mode -->
      <div *ngIf="mode === 'view' && map" class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">{{ map.name }}</h3>
          <p *ngIf="map.description" class="mt-2 text-gray-600">{{ map.description }}</p>
          <p class="mt-4 text-sm text-gray-500">UID: {{ map.uid }}</p>
          <p class="text-sm text-gray-500">Created: {{ map.created_at | date:'medium' }}</p>
        </div>

        <!-- Activities Section -->
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Activities</h4>
          <div *ngIf="activities.length === 0" class="text-gray-500">No activities yet.</div>
          <div *ngFor="let activity of activities" class="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
            <div>
              <span class="font-medium">{{ activity.name }}</span>
              <span [class]="getPriorityClass(activity.priority)" class="ml-2 px-2 py-0.5 text-xs rounded">
                {{ activity.priority }}
              </span>
            </div>
            <span class="text-sm text-gray-400">{{ activity.uid }}</span>
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
          <div *ngFor="let activity of activities" class="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
            <div>
              <span class="font-medium">{{ activity.name }}</span>
              <span [class]="getPriorityClass(activity.priority)" class="ml-2 px-2 py-0.5 text-xs rounded">
                {{ activity.priority }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-400">{{ activity.uid }}</span>
              <button
                type="button"
                (click)="deleteActivity(activity.id)"
                class="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
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
    </div>
  `
})
export class MapFormComponent implements OnInit {
  mapForm!: FormGroup;
  activityForm!: FormGroup;
  submitting = false;
  submittingActivity = false;
  error = '';
  mode: 'create' | 'edit' | 'view' = 'create';
  map: Map | null = null;
  mapId: number | null = null;
  activities: Activity[] = [];
  showActivityForm = false;

  constructor(
    private fb: FormBuilder,
    private mapService: MapService,
    private activityService: ActivityService,
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

    this.route.data.subscribe(data => {
      this.mode = data['mode'] || 'create';
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.mapId = +params['id'];
        if (this.mode === 'create') {
          this.mode = 'view';
        }
        if (this.mode !== 'create') {
          this.loadMap();
          this.loadActivities();
        }
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
      next: (activities) => this.activities = activities,
      error: (err) => console.error('Error loading activities:', err)
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

  deleteActivity(id: number): void {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    
    this.activityService.delete(id).subscribe({
      next: () => this.loadActivities(),
      error: (err) => console.error('Error deleting activity:', err)
    });
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Need': return 'bg-red-100 text-red-800';
      case 'Want': return 'bg-blue-100 text-blue-800';
      case 'Nice': return 'bg-green-100 text-green-800';
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

  goBack(): void {
    this.router.navigate(['/']);
  }
}