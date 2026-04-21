import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ActorService } from '../services/actor.service';
import { ToastService } from '../services/toast.service';
import { Actor, ActorAction } from '../models';

@Component({
  selector: 'app-actors-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">Actors</h2>
        <button
          (click)="showNewActorModal = true"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create Actor
        </button>
      </div>

      <div *ngIf="actors.length > 0" class="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Overall Implementation:</span>
          <span [class]="getScoreClass(globalSatisfaction)">
            {{ globalSatisfaction }} - {{ getImplementationLabel(globalSatisfaction) }}
          </span>
        </div>
      </div>

      <div *ngIf="actors.length === 0" class="text-center py-12">
        <p class="text-gray-600 mb-4">No actors yet. Create your first actor!</p>
      </div>

      <div *ngIf="actors.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a
          *ngFor="let actor of actors"
          [routerLink]="['/actors', actor.id]"
          class="block bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer transition-colors"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ actor.name }}</h3>
              <p *ngIf="actor.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ actor.description }}</p>
            </div>
            <div *ngIf="actor.action_count && actor.action_count > 0" [class]="getScoreClass(actor.satisfaction)">
              <span class="text-lg font-bold">{{ actor.satisfaction }}</span>
              <span class="text-xs ml-1">{{ getImplementationLabel(actor.satisfaction) }}</span>
            </div>
          </div>
          <p class="mt-2 text-xs text-gray-400 dark:text-gray-500">UID: {{ actor.uid }}</p>
          <p *ngIf="actor.action_count" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ actor.action_count }} action{{ actor.action_count !== 1 ? 's' : '' }}
          </p>
          <div (click)="$event.preventDefault(); $event.stopPropagation()" class="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              (click)="openEditModal(actor)"
              class="text-xs text-gray-500 hover:text-indigo-600"
            >
              Edit
            </button>
            <button
              (click)="openDeleteModal(actor)"
              class="text-xs text-gray-500 hover:text-red-600"
            >
              Delete
            </button>
          </div>
        </a>
      </div>
    </div>

    <!-- New Actor Modal -->
    <div *ngIf="showNewActorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4 dark:text-white">New Actor</h3>
        <form [formGroup]="newActorForm" (ngSubmit)="createActor()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Name *</label>
            <input type="text" formControlName="name" class="mt-1 block w-full rounded border-gray-300 dark:border-gray-600 px-3 py-2 border bg-white dark:bg-gray-700 dark:text-gray-100" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
            <textarea formControlName="description" rows="2" class="mt-1 block w-full rounded border-gray-300 dark:border-gray-600 px-3 py-2 border bg-white dark:bg-gray-700 dark:text-gray-100"></textarea>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" (click)="showNewActorModal = false" class="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded">Cancel</button>
            <button type="submit" [disabled]="newActorForm.invalid" class="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Create</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Actor Modal -->
    <div *ngIf="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4 dark:text-white">Edit Actor</h3>
        <form [formGroup]="editActorForm" (ngSubmit)="updateActor()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Name *</label>
            <input type="text" formControlName="name" class="mt-1 block w-full rounded border-gray-300 dark:border-gray-600 px-3 py-2 border bg-white dark:bg-gray-700 dark:text-gray-100" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
            <textarea formControlName="description" rows="2" class="mt-1 block w-full rounded border-gray-300 dark:border-gray-600 px-3 py-2 border bg-white dark:bg-gray-700 dark:text-gray-100"></textarea>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" (click)="showEditModal = false" class="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded">Cancel</button>
            <button type="submit" [disabled]="editActorForm.invalid" class="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Actor Modal with Reassignment -->
    <div *ngIf="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-medium mb-4 dark:text-white">Delete Actor: {{ deletingActor?.name }}</h3>
        
        <div *ngIf="actorActions.length > 0" class="mb-4">
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">{{ actorActions.length }} action{{ actorActions.length !== 1 ? 's' : '' }} will be reassigned:</p>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <div *ngFor="let action of actorActions" class="p-2 bg-gray-50 dark:bg-gray-900 rounded text-sm">
              <div class="font-medium">{{ action.name }}</div>
              <div class="text-xs text-gray-500">{{ action.map_name }} / {{ action.activity_name }}</div>
              <div *ngIf="action.description" class="text-xs text-gray-400 mt-1 truncate">
                {{ action.description.length > 150 ? action.description.slice(0, 150) + '...' : action.description }}
              </div>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Reassign actions to:</label>
          <div class="flex gap-2">
            <select [(ngModel)]="selectedReassignActorId" class="flex-1 rounded border-gray-300 dark:border-gray-600 px-3 py-2 border bg-white dark:bg-gray-700 dark:text-gray-100 text-sm">
              <option [ngValue]="null">Select actor...</option>
              <option *ngFor="let actor of availableActors" [ngValue]="actor.id">{{ actor.name }}</option>
            </select>
            <button type="button" (click)="showNewActorModal = true" class="text-indigo-600 hover:text-indigo-800 text-sm whitespace-nowrap">+ New</button>
          </div>
        </div>

        <div class="flex justify-between">
          <button type="button" (click)="cancelDelete()" class="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded">Cancel</button>
          <button 
            type="button" 
            (click)="confirmDelete()" 
            [disabled]="actorActions.length > 0 && !selectedReassignActorId"
            class="px-3 py-2 bg-red-600 text-white rounded disabled:opacity-50"
          >
            Delete Actor
          </button>
        </div>
      </div>
    </div>
  `
})
export class ActorsPageComponent implements OnInit {
  actors: Actor[] = [];
  globalSatisfaction = 0;

  showNewActorModal = false;
  showEditModal = false;
  showDeleteModal = false;

  deletingActor: Actor | null = null;
  actorActions: ActorAction[] = [];
  selectedReassignActorId: number | null = null;

  newActorForm!: FormGroup;
  editActorForm!: FormGroup;

  constructor(
    private actorService: ActorService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadActors();
  }

  initForms(): void {
    this.newActorForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
    this.editActorForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  loadActors(): void {
    this.actorService.getAll().subscribe({
      next: (actors) => {
        this.actors = actors;
        this.calculateGlobalSatisfaction();
      },
      error: (err) => console.error('Error loading actors:', err)
    });
  }

  calculateGlobalSatisfaction(): void {
    const actorsWithActions = this.actors.filter(a => a.action_count && a.action_count > 0);
    if (actorsWithActions.length === 0) {
      this.globalSatisfaction = 0;
      return;
    }
    const sum = actorsWithActions.reduce((acc, a) => acc + (a.satisfaction || 0), 0);
    this.globalSatisfaction = Math.round(sum / actorsWithActions.length);
  }

  getScoreClass(score: number | undefined): string {
    if (score === undefined) return 'text-gray-500';
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getImplementationLabel(score: number | undefined): string {
    if (score === undefined) return 'N/A';
    if (score >= 75) return 'Well Implemented';
    if (score >= 50) return 'Partially Implemented';
    return 'Needs Work';
  }

  get availableActors(): Actor[] {
    return this.actors.filter(a => a.id !== this.deletingActor?.id);
  }

  openEditModal(actor: Actor): void {
    this.editActorForm.patchValue({
      name: actor.name,
      description: actor.description || ''
    });
    (this as any).editingActorId = actor.id;
    this.showEditModal = true;
  }

  updateActor(): void {
    const actorId = (this as any).editingActorId;
    if (!actorId || this.editActorForm.invalid) return;

    const { name, description } = this.editActorForm.value;
    this.actorService.update(actorId, { name, description }).subscribe({
      next: () => {
        this.toastService.showSuccess('Actor updated successfully');
        this.showEditModal = false;
        this.loadActors();
      },
      error: (err) => {
        console.error('Error updating actor:', err);
        this.toastService.showError('Failed to update actor');
      }
    });
  }

  openDeleteModal(actor: Actor): void {
    this.deletingActor = actor;
    this.actorActions = [];
    this.selectedReassignActorId = null;
    this.showDeleteModal = true;

    this.actorService.getActions(actor.id).subscribe({
      next: (actions) => {
        this.actorActions = actions;
      },
      error: (err) => console.error('Error loading actor actions:', err)
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.deletingActor = null;
    this.actorActions = [];
    this.selectedReassignActorId = null;
  }

  confirmDelete(): void {
    if (!this.deletingActor) return;

    const actorId = this.deletingActor.id;
    const reassignTo = this.selectedReassignActorId || undefined;

    this.actorService.delete(actorId, reassignTo).subscribe({
      next: () => {
        this.toastService.showSuccess('Actor deleted successfully');
        this.cancelDelete();
        this.loadActors();
      },
      error: (err) => {
        console.error('Error deleting actor:', err);
        this.toastService.showError('Failed to delete actor');
      }
    });
  }

  createActor(): void {
    if (this.newActorForm.invalid) return;

    const { name, description } = this.newActorForm.value;
    this.actorService.create({ name, description }).subscribe({
      next: (actor) => {
        this.toastService.showSuccess(`Actor '${name}' created successfully`);
        this.newActorForm.reset();
        this.showNewActorModal = false;
        this.loadActors();
        if (this.showDeleteModal && !this.selectedReassignActorId) {
          this.selectedReassignActorId = actor.id;
        }
      },
      error: (err) => {
        console.error('Error creating actor:', err);
        this.toastService.showError('Failed to create actor');
      }
    });
  }
}