import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MapService } from '../services/map.service';

@Component({
  selector: 'app-map-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">Create New Map</h2>
      
      <form [formGroup]="mapForm" (ngSubmit)="onSubmit()" class="space-y-6">
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
            {{ submitting ? 'Creating...' : 'Create Map' }}
          </button>
          <button
            type="button"
            (click)="cancel()"
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
export class MapCreateComponent implements OnInit {
  mapForm!: FormGroup;
  submitting = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private mapService: MapService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.mapForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  onSubmit(): void {
    if (this.mapForm.invalid) return;

    this.submitting = true;
    this.error = '';
    const formValue = this.mapForm.value;
    
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

  cancel(): void {
    this.router.navigate(['/']);
  }
}