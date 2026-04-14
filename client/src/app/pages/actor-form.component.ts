import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActorService } from '../services/actor.service';
import { Actor } from '../models';

@Component({
  selector: 'app-actor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">
          {{ mode === 'create' ? 'Create New Actor' : mode === 'edit' ? 'Edit Actor' : 'Actor Details' }}
        </h2>
        <div class="flex gap-2" *ngIf="mode === 'view'">
          <button
            (click)="goToMatrix()"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Matrix
          </button>
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
      <div *ngIf="mode === 'view' && actor" class="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">{{ actor.name }}</h3>
        <p *ngIf="actor.description" class="mt-2 text-gray-600">{{ actor.description }}</p>
        <p class="mt-4 text-sm text-gray-500">UID: {{ actor.uid }}</p>
        <p class="text-sm text-gray-500">Created: {{ actor.created_at | date:'medium' }}</p>
      </div>

      <!-- Form Mode (Create/Edit) -->
      <form *ngIf="mode !== 'view'" [formGroup]="actorForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Actor Details</h3>
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Actor Name *</label>
            <input
              type="text"
              id="name"
              formControlName="name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              [class.border-red-500]="actorForm.get('name')?.invalid && actorForm.get('name')?.touched"
            />
            <p *ngIf="actorForm.get('name')?.invalid && actorForm.get('name')?.touched" class="mt-1 text-sm text-red-600">
              Actor name is required
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

        <div class="flex gap-4">
          <button
            type="submit"
            [disabled]="actorForm.invalid || submitting"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? 'Saving...' : (mode === 'edit' ? 'Update Actor' : 'Create Actor') }}
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
export class ActorFormComponent implements OnInit {
  actorForm!: FormGroup;
  submitting = false;
  error = '';
  mode: 'create' | 'edit' | 'view' = 'create';
  actor: Actor | null = null;
  actorId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private actorService: ActorService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.actorForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });

    this.route.data.subscribe(data => {
      this.mode = data['mode'] || 'create';
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.actorId = +params['id'];
        if (this.mode !== 'create') {
          this.loadActor();
        }
      }
    });
  }

  loadActor(): void {
    if (!this.actorId) return;
    this.actorService.getById(this.actorId).subscribe({
      next: (actor) => {
        this.actor = actor;
        if (this.mode === 'edit') {
          this.actorForm.patchValue({
            name: actor.name,
            description: actor.description || ''
          });
        }
      },
      error: (err) => {
        console.error('Error loading actor:', err);
        this.error = 'Failed to load actor';
      }
    });
  }

  onSubmit(): void {
    if (this.actorForm.invalid) return;

    this.submitting = true;
    this.error = '';
    const formValue = this.actorForm.value;

    if (this.mode === 'edit' && this.actorId) {
      this.actorService.update(this.actorId, formValue).subscribe({
        next: () => {
          this.router.navigate(['/actors']);
        },
        error: (err) => {
          console.error('Error updating actor:', err);
          this.error = 'Failed to update actor. Please try again.';
          this.submitting = false;
        }
      });
    } else {
      this.actorService.create(formValue).subscribe({
        next: () => {
          this.router.navigate(['/actors']);
        },
        error: (err) => {
          console.error('Error creating actor:', err);
          this.error = 'Failed to create actor. Please try again.';
          this.submitting = false;
        }
      });
    }
  }

  goToEdit(): void {
    if (this.actorId) {
      this.router.navigate(['/actors', this.actorId, 'edit']);
    }
  }

  goToMatrix(): void {
    if (this.actorId) {
      this.router.navigate(['/actors', this.actorId, 'matrix']);
    }
  }

  goBack(): void {
    this.router.navigate(['/actors']);
  }
}