import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContextService } from '../services/context.service';
import { ToastService } from '../services/toast.service';
import { Context } from '../models';

@Component({
  selector: 'app-context-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">
          {{ mode === 'create' ? 'Create New Context' : 'Edit Context' }}
        </h2>
        <span *ngIf="context?.is_default" class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">system</span>
      </div>

      <form [formGroup]="contextForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Context Details</h3>
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Context Name *</label>
            <input
              type="text"
              id="name"
              formControlName="name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              [class.border-red-500]="contextForm.get('name')?.invalid && contextForm.get('name')?.touched"
            />
            <p *ngIf="contextForm.get('name')?.invalid && contextForm.get('name')?.touched" class="mt-1 text-sm text-red-600">
              Context name is required
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
            [disabled]="contextForm.invalid || submitting"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? 'Saving...' : (mode === 'edit' ? 'Update Context' : 'Create Context') }}
          </button>
          <button
            type="button"
            (click)="goBack()"
            class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <p *ngIf="error" class="text-sm text-red-600">{{ error }}</p>
      </form>
    </div>
  `
})
export class ContextFormComponent implements OnInit {
  contextForm!: FormGroup;
  submitting = false;
  error = '';
  mode: 'create' | 'edit' = 'create';
  context: Context | null = null;
  contextId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private contextService: ContextService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.contextForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });

    this.route.data.subscribe(data => {
      this.mode = data['mode'] || 'create';
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.contextId = +params['id'];
        if (this.mode !== 'create') {
          this.loadContext();
        }
      }
    });
  }

  loadContext(): void {
    if (!this.contextId) return;
    this.contextService.getById(this.contextId).subscribe({
      next: (context) => {
        this.context = context;
        if (this.mode === 'edit') {
          this.contextForm.patchValue({
            name: context.name,
            description: context.description || ''
          });
        }
      },
      error: (err) => {
        console.error('Error loading context:', err);
        this.error = 'Failed to load context';
      }
    });
  }

  onSubmit(): void {
    if (this.contextForm.invalid) return;

    this.submitting = true;
    this.error = '';
    const formValue = this.contextForm.value;

    if (this.mode === 'edit' && this.contextId) {
      this.contextService.update(this.contextId, formValue).subscribe({
        next: () => {
          this.toastService.showSuccess(`Context '${formValue.name}' updated successfully`);
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Error updating context:', err);
          this.error = 'Failed to update context. Please try again.';
          this.toastService.showError('Failed to update context');
          this.submitting = false;
        }
      });
    } else {
      this.contextService.create(formValue).subscribe({
        next: () => {
          this.toastService.showSuccess(`Context '${formValue.name}' created successfully`);
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Error creating context:', err);
          this.error = 'Failed to create context. Please try again.';
          this.toastService.showError('Failed to create context');
          this.submitting = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
