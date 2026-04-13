import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MapService } from '../services/map.service';
import { Map } from '../models';

@Component({
  selector: 'app-map-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
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
      <div *ngIf="mode === 'view' && map" class="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">{{ map.name }}</h3>
        <p *ngIf="map.description" class="mt-2 text-gray-600">{{ map.description }}</p>
        <p class="mt-4 text-sm text-gray-500">UID: {{ map.uid }}</p>
        <p class="text-sm text-gray-500">Created: {{ map.created_at | date:'medium' }}</p>
      </div>

      <!-- Form Mode (Create/Edit) -->
      <form *ngIf="mode !== 'view'" [formGroup]="mapForm" (ngSubmit)="onSubmit()" class="space-y-6">
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

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            formControlName="description"
            rows="4"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
          ></textarea>
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
  submitting = false;
  error = '';
  mode: 'create' | 'edit' | 'view' = 'create';
  map: Map | null = null;
  mapId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private mapService: MapService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.mapForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
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