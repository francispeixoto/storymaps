import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ActorService } from '../services/actor.service';
import { ToastService } from '../services/toast.service';
import { MatrixComponent } from './matrix.component';
import { Actor } from '../models';

@Component({
  selector: 'app-actor-detail',
  standalone: true,
  imports: [CommonModule, MatrixComponent],
  template: `
    <div *ngIf="actor">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold dark:text-white">{{ actor.name }}</h2>
          <p *ngIf="actor.description" class="text-gray-600 dark:text-gray-300 mt-1">{{ actor.description }}</p>
        </div>
        <div class="flex gap-2">
          <button
            (click)="goToEdit()"
            class="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Edit
          </button>
          <button
            (click)="goBack()"
            class="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>

      <app-matrix [contextId]="actor.id" [health]="actor.health || null" (dataChanged)="onDataChanged()"></app-matrix>
    </div>
  `
})
export class ActorDetailComponent implements OnInit {
  actor: Actor | null = null;

  constructor(
    private actorService: ActorService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadActor(+params['id']);
      }
    });
  }

  loadActor(id: number): void {
    this.actorService.getById(id).subscribe({
      next: (actor) => {
        this.actor = actor;
      },
      error: (err) => {
        console.error('Error loading actor:', err);
        this.router.navigate(['/actors']);
      }
    });
  }

  onDataChanged(): void {
    if (!this.actor) return;
    this.loadActor(this.actor.id);
  }

  goToEdit(): void {
    if (this.actor) {
      this.router.navigate(['/actors', this.actor.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/actors']);
  }
}