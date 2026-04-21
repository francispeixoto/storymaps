import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ActorService } from '../services/actor.service';
import { ToastService } from '../services/toast.service';
import { Actor } from '../models';

@Component({
  selector: 'app-actors-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
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
  `
})
export class ActorsPageComponent implements OnInit {
  actors: Actor[] = [];
  globalSatisfaction = 0;

  showNewActorModal = false;
  newActorForm!: FormGroup;

  constructor(
    private actorService: ActorService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.newActorForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
    this.loadActors();
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

  createActor(): void {
    if (this.newActorForm.invalid) return;

    const { name, description } = this.newActorForm.value;
    this.actorService.create({ name, description }).subscribe({
      next: (actor) => {
        this.toastService.showSuccess(`Actor '${name}' created successfully`);
        this.newActorForm.reset();
        this.showNewActorModal = false;
        this.loadActors();
      },
      error: (err) => {
        console.error('Error creating actor:', err);
        this.toastService.showError('Failed to create actor');
      }
    });
  }
}