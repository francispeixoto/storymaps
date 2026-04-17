import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MapService } from '../services/map.service';
import { ContextService } from '../services/context.service';
import { Map } from '../models';

@Component({
  selector: 'app-map-selector-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">Add Maps to Context</h3>
          <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div *ngIf="!showNewMapForm" class="mb-4 p-3 bg-gray-50 rounded-lg">
          <button type="button" (click)="showNewMapForm = true" class="text-sm text-indigo-600 hover:text-indigo-800">
            + Create New Map
          </button>
        </div>

        <div *ngIf="showNewMapForm" class="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 class="font-medium mb-3">Create New Map</h4>
          <form [formGroup]="newMapForm" (ngSubmit)="createMap()" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">Map Name *</label>
              <input type="text" formControlName="name" class="w-full border border-gray-300 rounded px-2 py-1" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea formControlName="description" rows="2" class="w-full border border-gray-300 rounded px-2 py-1"></textarea>
            </div>
            <div class="flex gap-2">
              <button type="submit" [disabled]="newMapForm.invalid || creatingMap" class="px-3 py-1 bg-indigo-600 text-white rounded text-sm disabled:opacity-50">
                {{ creatingMap ? 'Creating...' : 'Create' }}
              </button>
              <button type="button" (click)="showNewMapForm = false; newMapForm.reset({ name: '', description: '' })" class="px-3 py-1 border border-gray-300 rounded text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div *ngIf="!showNewMapForm">
          <div class="mb-4">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              placeholder="Search maps..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div class="flex-1 overflow-y-auto mb-4">
            <div *ngIf="filteredMaps.length === 0" class="text-center py-8 text-gray-500">
              No maps available to add
            </div>
            <div *ngFor="let map of filteredMaps" class="flex items-center gap-3 py-2 border-b border-gray-100">
              <input
                type="checkbox"
                [checked]="selectedMapIds.includes(map.id)"
                (change)="toggleMap(map.id)"
                class="rounded border-gray-300"
              />
              <div class="flex-1 cursor-pointer" (click)="toggleMap(map.id)">
                <div class="font-medium">{{ map.name }}</div>
                <div *ngIf="map.description" class="text-sm text-gray-500">{{ map.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button
            type="button"
            (click)="close.emit()"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md"
          >
            Cancel
          </button>
          <button
            *ngIf="!showNewMapForm"
            type="button"
            (click)="addSelected()"
            [disabled]="selectedMapIds.length === 0"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
          >
            Add Selected ({{ selectedMapIds.length }})
          </button>
        </div>
      </div>
    </div>
  `
})
export class MapSelectorModalComponent implements OnInit {
  @Input() contextId!: number;
  @Output() mapAdded = new EventEmitter<number>();
  @Output() mapCreated = new EventEmitter<number>();
  @Output() close = new EventEmitter<void>();

  maps: Map[] = [];
  selectedMapIds: number[] = [];
  searchTerm = '';
  showNewMapForm = false;
  creatingMap = false;
  newMapForm!: FormGroup;

  constructor(
    private mapService: MapService,
    private contextService: ContextService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.newMapForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
    this.loadAvailableMaps();
  }

  loadAvailableMaps(): void {
    this.mapService.getAll().subscribe({
      next: (allMaps) => {
        this.contextService.getMaps(this.contextId).subscribe({
          next: (contextMaps) => {
            const contextMapIds = contextMaps.map(m => m.id);
            this.maps = allMaps.filter(m => !contextMapIds.includes(m.id));
          },
          error: (err) => console.error('Error loading context maps:', err)
        });
      },
      error: (err) => console.error('Error loading maps:', err)
    });
  }

  get filteredMaps(): Map[] {
    if (!this.searchTerm) return this.maps;
    const term = this.searchTerm.toLowerCase();
    return this.maps.filter(m => 
      m.name.toLowerCase().includes(term) ||
      (m.description && m.description.toLowerCase().includes(term))
    );
  }

  toggleMap(mapId: number): void {
    const index = this.selectedMapIds.indexOf(mapId);
    if (index >= 0) {
      this.selectedMapIds.splice(index, 1);
    } else {
      this.selectedMapIds.push(mapId);
    }
  }

  addSelected(): void {
    this.selectedMapIds.forEach(mapId => {
      this.mapAdded.emit(mapId);
    });
    this.close.emit();
  }

  createMap(): void {
    if (this.newMapForm.invalid) return;
    
    this.creatingMap = true;
    const { name, description } = this.newMapForm.value;
    
    this.mapService.create({ name, description }).subscribe({
      next: (newMap) => {
        this.contextService.addMap(this.contextId, newMap.id).subscribe({
          next: () => {
            this.mapCreated.emit(newMap.id);
            this.showNewMapForm = false;
            this.newMapForm.reset({ name: '', description: '' });
            this.creatingMap = false;
            this.close.emit();
          },
          error: (err) => {
            console.error('Error adding map to context:', err);
            this.creatingMap = false;
          }
        });
      },
      error: (err) => {
        console.error('Error creating map:', err);
        this.creatingMap = false;
      }
    });
  }
}
