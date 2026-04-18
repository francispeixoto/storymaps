import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoadmapService } from '../services/roadmap.service';
import { RoadmapItem, ActionBlocker } from '../models';

@Component({
  selector: 'app-roadmap-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Roadmap</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Prioritized implementation plan with dependency analysis</p>
      </div>

      <div *ngIf="loading" class="text-center py-12">
        <p class="text-gray-500">Loading roadmap...</p>
      </div>

      <div *ngIf="!loading && roadmap.length === 0" class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400">No items need attention. All done!</p>
      </div>

      <div *ngIf="!loading && roadmap.length > 0" class="space-y-4">
        <ng-container *ngFor="let item of roadmap">
          <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: item, level: 0 }"></ng-container>
        </ng-container>
      </div>
    </div>

    <ng-template #itemTemplate let-item let-level="level">
      <div 
        class="rounded-lg border dark:border-gray-700 overflow-hidden"
        [class.bg-white]="item.level !== 'action'"
        [class.dark:bg-gray-800]="item.level !== 'action'"
        [class.bg-gray-50]="item.level === 'action'"
        [class.dark:bg-gray-900]="item.level === 'action'"
      >
        <div 
          class="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          [class.pl-4]="level === 1"
          [class.pl-8]="level === 2"
          [class.pl-12]="level === 3"
          [class.pl-16]="level === 4"
          (click)="toggle(item)"
        >
          <button
            *ngIf="item.children.length > 0"
            class="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg 
              class="w-4 h-4 transition-transform" 
              [class.rotate-90]="item['expanded']"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
          <span *ngIf="item.children.length === 0" class="w-5"></span>

          <span *ngIf="item.level === 'action'" class="text-lg">
            <span *ngIf="hasBlocked(item)" class="text-red-500" title="Blocked">🔴</span>
            <span *ngIf="!hasBlocked(item) && hasWarning(item)" class="text-yellow-500" title="Warning">🟡</span>
            <span *ngIf="!hasBlocked(item) && !hasWarning(item) && item.blockingCount > 0" class="text-orange-500" title="Blocking others">⛔</span>
            <span *ngIf="!hasBlocked(item) && !hasWarning(item) && item.blockingCount === 0" class="text-green-500" title="Ready">✅</span>
          </span>

          <span *ngIf="item.level !== 'action'" class="w-5"></span>

          <span 
            class="px-2 py-0.5 text-xs font-medium rounded"
            [class.bg-red-100]="item.priority === 'Need'"
            [class.text-red-800]="item.priority === 'Need'"
            [class.dark:bg-red-900]="item.priority === 'Need'"
            [class.dark:text-red-200]="item.priority === 'Need'"
            [class.bg-blue-100]="item.priority === 'Want'"
            [class.text-blue-800]="item.priority === 'Want'"
            [class.dark:bg-blue-900]="item.priority === 'Want'"
            [class.dark:text-blue-200]="item.priority === 'Want'"
            [class.bg-green-100]="item.priority === 'Nice'"
            [class.text-green-800]="item.priority === 'Nice'"
            [class.dark:bg-green-900]="item.priority === 'Nice'"
            [class.dark:text-green-200]="item.priority === 'Nice'"
          >
            {{ item.priority }}
          </span>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400 dark:text-gray-500">{{ item.level }}</span>
              <span class="font-medium text-gray-900 dark:text-white truncate">{{ item.name }}</span>
              <span *ngIf="item.level === 'action'" class="text-xs text-gray-500 dark:text-gray-400">
                <span *ngIf="hasBlocked(item)">(blocked by: {{ item.dependencyBlockers[0].actionName }})</span>
                <span *ngIf="!hasBlocked(item) && hasWarning(item)">(warn: {{ item.dependencyBlockers[0].actionName }})</span>
                <span *ngIf="!hasBlocked(item) && !hasWarning(item) && item.blockingCount > 0">(blocking: {{ item.blockingCount }})</span>
                <span *ngIf="!hasBlocked(item) && !hasWarning(item) && item.blockingCount === 0">(ready)</span>
              </span>
            </div>
          </div>

          <div class="flex items-center gap-3 text-sm">
            <span *ngIf="item.dependencyBlockCount > 0" class="flex items-center gap-1">
              <span 
                class="px-2 py-0.5 text-xs rounded"
                [class.bg-red-100]="hasBlocked(item)"
                [class.text-red-800]="hasBlocked(item)"
                [class.dark:bg-red-900]="hasBlocked(item)"
                [class.dark:text-red-200]="hasBlocked(item)"
                [class.bg-yellow-100]="!hasBlocked(item) && hasWarning(item)"
                [class.text-yellow-800]="!hasBlocked(item) && hasWarning(item)"
                [class.dark:bg-yellow-900]="!hasBlocked(item) && hasWarning(item)"
                [class.dark:text-yellow-200]="!hasBlocked(item) && hasWarning(item)"
              >
                {{ item.dependencyBlockCount }} blocker{{ item.dependencyBlockCount > 1 ? 's' : '' }}
              </span>
            </span>

            <span *ngIf="item.workRemaining > 0" class="text-gray-500 dark:text-gray-400">
              {{ item.workRemaining }} pending
            </span>
          </div>
        </div>

        <div *ngIf="item['expanded'] && item.children.length > 0" class="border-t dark:border-gray-700">
          <ng-container *ngFor="let child of item.children">
            <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: child, level: level + 1 }"></ng-container>
          </ng-container>
        </div>

        <div *ngIf="item['expanded'] && item.dependencyBlockers.length > 0" class="border-t dark:border-gray-700 p-3 bg-red-50 dark:bg-red-900/20">
          <div class="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Blockers</div>
          <div class="space-y-2">
            <div 
              *ngFor="let blocker of item.dependencyBlockers"
              class="flex items-center gap-2 text-sm"
            >
              <span 
                class="w-2 h-2 rounded-full"
                [class.bg-red-500]="blocker.status === 'blocked'"
                [class.bg-yellow-500]="blocker.status === 'warning'"
              ></span>
              <span class="text-gray-700 dark:text-gray-300">
                {{ blocker.actionName }}
              </span>
              <span class="text-gray-500 dark:text-gray-400 text-xs">
                ({{ blocker.blockingPriority }}, {{ blocker.state }})
              </span>
              <span 
                *ngIf="blocker.status === 'blocked'"
                class="text-xs text-red-600 dark:text-red-400 font-medium"
              >
                BLOCKED
              </span>
              <span 
                *ngIf="blocker.status === 'warning'"
                class="text-xs text-yellow-600 dark:text-yellow-400 font-medium"
              >
                WARNING
              </span>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `
})
export class RoadmapPageComponent implements OnInit {
  roadmap: RoadmapItem[] = [];
  loading = true;

  constructor(private roadmapService: RoadmapService) {}

  ngOnInit(): void {
    this.loadRoadmap();
  }

  loadRoadmap(): void {
    this.loading = true;
    this.roadmapService.getRoadmap().subscribe({
      next: (response) => {
        this.roadmap = response.roadmap;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading roadmap:', err);
        this.loading = false;
      }
    });
  }

  toggle(item: RoadmapItem): void {
    item['expanded'] = !item['expanded'];
  }

  hasBlocked(item: RoadmapItem): boolean {
    return item.dependencyBlockers.some(b => b.status === 'blocked');
  }

  hasWarning(item: RoadmapItem): boolean {
    return item.dependencyBlockers.some(b => b.status === 'warning');
  }
}