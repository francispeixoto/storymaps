import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActorService } from '../services/actor.service';
import { Actor } from '../models';

@Component({
  selector: 'app-actors-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">Actors</h2>
        <a
          routerLink="/actors/create"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Actor
        </a>
      </div>

      <div *ngIf="actors.length === 0" class="text-center py-12">
        <p class="text-gray-600 mb-4">No actors yet. Create your first actor!</p>
      </div>

      <div *ngIf="actors.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a
          *ngFor="let actor of actors"
          [routerLink]="['/actors', actor.id]"
          class="block bg-white rounded-lg shadow p-4 border border-gray-200 hover:border-indigo-500 cursor-pointer transition-colors"
        >
          <h3 class="text-lg font-medium text-gray-900">{{ actor.name }}</h3>
          <p *ngIf="actor.description" class="mt-1 text-sm text-gray-500">{{ actor.description }}</p>
          <p class="mt-2 text-xs text-gray-400">UID: {{ actor.uid }}</p>
        </a>
      </div>
    </div>
  `
})
export class ActorsPageComponent implements OnInit {
  actors: Actor[] = [];

  constructor(private actorService: ActorService) {}

  ngOnInit(): void {
    this.loadActors();
  }

  loadActors(): void {
    this.actorService.getAll().subscribe({
      next: (actors) => this.actors = actors,
      error: (err) => console.error('Error loading actors:', err)
    });
  }
}