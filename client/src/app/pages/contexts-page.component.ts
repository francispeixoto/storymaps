import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContextService } from '../services/context.service';
import { ToastService } from '../services/toast.service';
import { ConfirmDeleteDialogComponent } from '../components/confirm-delete-dialog.component';
import { Context } from '../models';

@Component({
  selector: 'app-contexts-page',
  standalone: true,
  imports: [CommonModule, ConfirmDeleteDialogComponent],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-semibold">Select a Context</h2>
          <p class="text-sm text-gray-500 mt-1">Choose a context to view and manage your story maps</p>
        </div>
        <button
          (click)="goToCreate()"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create Context
        </button>
      </div>

      <div *ngIf="contexts.length === 0 && !loading" class="text-center py-12">
        <p class="text-gray-600 mb-4">No contexts found.</p>
      </div>

      <div *ngIf="contexts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          *ngFor="let context of contexts"
          class="bg-white rounded-lg shadow p-4 border border-gray-200 hover:border-indigo-500 transition-colors cursor-pointer"
          [class.border-blue-500]="context.is_default"
          (click)="viewContext(context)"
        >
          <div class="flex items-start">
            <div class="flex-1" (click)="viewContext(context)">
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-medium text-gray-900">{{ context.name }}</h3>
                <span *ngIf="context.is_default" class="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800">system</span>
              </div>
              <p *ngIf="context.description" class="mt-1 text-sm text-gray-500">{{ context.description }}</p>
              <p class="mt-2 text-sm text-gray-500">{{ context.map_count || 0 }} map{{ (context.map_count || 0) !== 1 ? 's' : '' }}</p>
            </div>
            <div [class]="getScoreClass(context.health?.score)" class="text-right flex-shrink-0 ml-3">
              <span class="text-lg font-bold">{{ context.health?.score ?? 0 }}</span>
              <span class="text-xs ml-1">{{ getImplementationLabel(context.health?.score) }}</span>
            </div>
            <div class="flex gap-2 ml-2" *ngIf="!context.is_default" (click)="$event.stopPropagation()">
              <button
                (click)="goToEdit(context)"
                class="text-gray-400 hover:text-gray-600"
                title="Edit"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
              </button>
              <button
                (click)="confirmDelete(context)"
                class="text-gray-400 hover:text-red-600"
                title="Delete"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-confirm-delete-dialog
      *ngIf="showDeleteConfirm"
      [itemName]="pendingDeleteContext?.name || ''"
      itemType="context"
      (confirmed)="onDeleteConfirmed()"
      (cancelled)="onDeleteCancelled()"
    ></app-confirm-delete-dialog>
  `
})
export class ContextsPageComponent implements OnInit {
  contexts: Context[] = [];
  loading = true;
  showDeleteConfirm = false;
  pendingDeleteContext: Context | null = null;

  constructor(
    private contextService: ContextService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadContexts();
  }

  loadContexts(): void {
    this.loading = true;
    this.contextService.getAll().subscribe({
      next: (contexts) => {
        this.contexts = contexts;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading contexts:', err);
        this.loading = false;
      }
    });
  }

  viewContext(context: Context): void {
    this.router.navigate(['/contexts', context.id]);
  }

  goToCreate(): void {
    this.router.navigate(['/contexts/create']);
  }

  goToEdit(context: Context): void {
    this.router.navigate(['/contexts', context.id, 'edit']);
  }

  confirmDelete(context: Context): void {
    this.pendingDeleteContext = context;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed(): void {
    if (!this.pendingDeleteContext) return;

    this.contextService.delete(this.pendingDeleteContext.id).subscribe({
      next: () => {
        this.toastService.showSuccess(`Context '${this.pendingDeleteContext!.name}' deleted successfully`);
        this.showDeleteConfirm = false;
        this.pendingDeleteContext = null;
        this.loadContexts();
      },
      error: (err) => {
        console.error('Error deleting context:', err);
        this.toastService.showError('Failed to delete context');
        this.showDeleteConfirm = false;
        this.pendingDeleteContext = null;
      }
    });
  }

  onDeleteCancelled(): void {
    this.showDeleteConfirm = false;
    this.pendingDeleteContext = null;
  }

  getScoreClass(score: number | undefined): string {
    if (score === undefined) return 'text-gray-500';
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getImplementationLabel(score: number | undefined): string {
    if (score === undefined) return 'Empty';
    if (score >= 75) return 'Well Implemented';
    if (score >= 50) return 'Partially Implemented';
    return 'Needs Work';
  }
}
