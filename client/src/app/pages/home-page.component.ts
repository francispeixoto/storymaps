import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MapService } from '../services/map.service';
import { Map } from '../models';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">Your Maps</h2>
        <a
          routerLink="/maps/create"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Map
        </a>
      </div>

      <div *ngIf="maps.length === 0" class="text-center py-12">
        <p class="text-gray-600 mb-4">No maps yet. Create your first story map!</p>
      </div>

      <div *ngIf="maps.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          *ngFor="let map of maps"
          class="bg-white rounded-lg shadow p-4 border border-gray-200"
        >
          <h3 class="text-lg font-medium text-gray-900">{{ map.name }}</h3>
          <p *ngIf="map.description" class="mt-1 text-sm text-gray-500">{{ map.description }}</p>
          <p class="mt-2 text-xs text-gray-400">UID: {{ map.uid }}</p>
        </div>
      </div>
    </div>
  `
})
export class HomePageComponent implements OnInit {
  maps: Map[] = [];

  constructor(private mapService: MapService) {}

  ngOnInit(): void {
    this.loadMaps();
  }

  loadMaps(): void {
    this.mapService.getAll().subscribe({
      next: (maps) => this.maps = maps,
      error: (err) => console.error('Error loading maps:', err)
    });
  }
}