import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MapService } from '../services/map.service';
import { ActorService } from '../services/actor.service';
import { ActionService } from '../services/action.service';
import { ActivityService } from '../services/activity.service';
import { ToastService } from '../services/toast.service';
import { ConfirmDeleteDialogComponent } from '../components/confirm-delete-dialog.component';
import { Map, Actor, Activity, Action, ActionDependency, ActionWithContext } from '../models';

type ViewMode = 'map' | 'actor';

interface DropdownOption {
  id: number;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmDeleteDialogComponent],
  template: `
    <div class="max-w-full mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold">{{ pageTitle }}</h2>
          <p *ngIf="pageSubtitle" class="text-gray-600 mt-1">{{ pageSubtitle }}</p>
        </div>
        <div class="flex gap-2">
          <button
            *ngIf="viewMode === 'map' && currentMap"
            (click)="showAddActivityModal = true"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Activity
          </button>
          <button
            *ngIf="viewMode === 'map' && currentMap"
            (click)="openMapEditModal()"
            class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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

      <div class="mb-4 flex flex-wrap items-start gap-6">
        <div *ngIf="showActorFilter" class="relative">
          <button
            type="button"
            (click)="toggleActorDropdown()"
            class="inline-flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 min-w-[180px]"
          >
            <span>Actors: {{ getSelectedActorCount() }}</span>
            <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          <div *ngIf="actorDropdownOpen" class="absolute z-50 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
            <div class="p-2 border-b border-gray-100">
              <input
                type="text"
                [(ngModel)]="actorSearchTerm"
                placeholder="Search actors..."
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div class="max-h-48 overflow-y-auto p-2">
              <label *ngFor="let actor of filteredActorOptions" class="flex items-center gap-2 py-1 text-sm cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  [checked]="actor.selected"
                  (change)="toggleActor(actor)"
                  class="rounded border-gray-300"
                />
                <span class="truncate">{{ actor.name }}</span>
              </label>
              <div *ngIf="filteredActorOptions.length === 0" class="text-sm text-gray-500 py-2 text-center">
                No actors found
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="showMapFilter" class="relative">
          <button
            type="button"
            (click)="toggleMapDropdown()"
            class="inline-flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 min-w-[180px]"
          >
            <span>Maps: {{ getSelectedMapCount() }}</span>
            <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          <div *ngIf="mapDropdownOpen" class="absolute z-50 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
            <div class="p-2 border-b border-gray-100">
              <input
                type="text"
                [(ngModel)]="mapSearchTerm"
                placeholder="Search maps..."
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div class="max-h-48 overflow-y-auto p-2">
              <label *ngFor="let map of filteredMapOptions" class="flex items-center gap-2 py-1 text-sm cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  [checked]="map.selected"
                  (change)="toggleMap(map)"
                  class="rounded border-gray-300"
                />
                <span class="truncate">{{ map.name }}</span>
              </label>
              <div *ngIf="filteredMapOptions.length === 0" class="text-sm text-gray-500 py-2 text-center">
                No maps found
              </div>
            </div>
          </div>
        </div>

        <div class="relative">
          <button
            type="button"
            (click)="toggleStateDropdown()"
            class="inline-flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 min-w-[180px]"
          >
            <span>Implementation: {{ getSelectedStateCount() }}</span>
            <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          <div *ngIf="stateDropdownOpen" class="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg p-2">
            <label *ngFor="let state of stateOptions" class="flex items-center gap-2 py-1 text-sm cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                [checked]="state.selected"
                (change)="toggleState(state)"
                class="rounded border-gray-300"
              />
              <span [class]="getImplementationStateClass(state.name)" class="flex items-center gap-1.5">
                <span [class]="getImplementationStateDot(state.name)" class="w-2 h-2 rounded-full"></span>
                {{ state.name }}
              </span>
            </label>
          </div>
        </div>
      </div>

      <div *ngIf="uniqueActivities.length === 0" class="text-center py-8 text-gray-500">
        No activities yet. Add an activity to get started.
      </div>

      <div *ngIf="uniqueActivities.length > 0" class="matrix-container">
        <div class="matrix-scroll-content">
          <table class="matrix-table">
            <thead class="matrix-thead">
              <tr>
                <th class="matrix-corner"></th>
                <th *ngFor="let activity of uniqueActivities" class="matrix-header-col">
                  <div class="flex items-center justify-between">
                    <div>
                      <span>{{ activity.name }}</span>
                      <p *ngIf="activity.description" class="text-xs text-gray-500 truncate max-w-[150px]" [title]="activity.description">
                        {{ activity.description.length > 150 ? activity.description.slice(0, 150) + '...' : activity.description }}
                      </p>
                    </div>
                    <div class="flex items-center gap-1">
                      <button
                        *ngIf="viewMode === 'map'"
                        type="button"
                        (click)="openEditActivityModal(activity)"
                        class="text-xs text-gray-400 hover:text-gray-600"
                        title="Edit activity"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                      </button>
                      <button
                        *ngIf="viewMode === 'map'"
                        type="button"
                        (click)="openAddActionModal(activity.id)"
                        class="text-xs text-indigo-600 hover:text-indigo-800 ml-1"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let priority of priorities" class="matrix-row">
                <td class="matrix-row-header">
                  <span [class]="getPriorityClass(priority)" class="px-3 py-1 text-sm font-medium rounded">
                    {{ priority }}
                  </span>
                </td>
                <td *ngFor="let activity of uniqueActivities" class="matrix-cell">
                  <div class="space-y-2 min-h-[60px]">
                    <div
                      *ngFor="let action of getActions(activity.id, priority)"
                      class="action-card cursor-pointer relative px-2 py-2"
                      (click)="openActionModal(action)"
                    >
                      <div *ngIf="inputsMap.get(action.id)" class="absolute left-0 -translate-x-[5px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-indigo-500" title="Has incoming dependencies"></div>
                      <div class="flex items-center gap-2 pl-3">
                        <span [class]="getImplementationStateDot(action.implementation_state)" class="w-2 h-2 rounded-full flex-shrink-0"></span>
                        <span class="font-medium flex-1 truncate">{{ action.name }}</span>
                        <span *ngIf="showActorBadges" class="px-1.5 py-0.5 text-xs rounded bg-purple-100 text-purple-800 flex-shrink-0">
                          {{ action.actor_name || '-' }}
                        </span>
                        <span *ngIf="showMapBadges" class="px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-800 flex-shrink-0">
                          {{ getMapName(action.map_id) }}
                        </span>
                      </div>
                      <p *ngIf="action.description" class="mt-1 text-gray-500 text-xs pl-3">{{ action.description }}</p>
                      <div *ngIf="outputsMap.get(action.id)" class="absolute right-0 translate-x-[5px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-indigo-500" title="Is prerequisite for other actions"></div>
                    </div>
                    <div *ngIf="getActions(activity.id, priority).length === 0" class="text-gray-300 text-sm">
                      -
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add Activity Modal -->
    <div *ngIf="showAddActivityModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">Add Activity</h3>
        <form [formGroup]="activityForm" (ngSubmit)="addActivityFromModal()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Activity Name *</label>
            <input type="text" formControlName="name" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border" />
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" (click)="showAddActivityModal = false" class="px-3 py-2 border border-gray-300 text-gray-700 rounded">Cancel</button>
            <button type="submit" [disabled]="activityForm.invalid" class="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Add</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Activity Modal -->
    <div *ngIf="showEditActivityModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">Edit Activity</h3>
        <form [formGroup]="editActivityForm" (ngSubmit)="updateActivityFromModal()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Activity Name *</label>
            <input type="text" formControlName="name" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea formControlName="description" rows="2" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border"></textarea>
          </div>
          <div class="flex justify-between items-center">
            <button type="button" (click)="confirmDeleteActivity()" class="text-sm text-red-600 hover:text-red-800">
              Delete Activity
            </button>
            <div class="flex gap-2">
              <button type="button" (click)="showEditActivityModal = false" class="px-3 py-2 border border-gray-300 text-gray-700 rounded">Cancel</button>
              <button type="submit" [disabled]="editActivityForm.invalid" class="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Action Modal -->
    <div *ngIf="showAddActionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">Add Action</h3>
        <form [formGroup]="actionForm" (ngSubmit)="addActionFromModal()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Action Name *</label>
            <input type="text" formControlName="name" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border" />
          </div>
          <div class="flex gap-2">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700">Actor</label>
              <div class="flex items-center gap-1">
                <select formControlName="actor_id" class="mt-1 block w-full rounded border-gray-300 px-2 py-2 border text-sm">
                  <option [ngValue]="null">Select actor...</option>
                  <option *ngFor="let actor of actors" [ngValue]="actor.id">{{ actor.name }}</option>
                </select>
              </div>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700">Priority *</label>
              <select formControlName="priority" class="mt-1 block w-full rounded border-gray-300 px-2 py-2 border text-sm">
                <option value="Need">Need</option>
                <option value="Want">Want</option>
                <option value="Nice">Nice</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Implementation State *</label>
            <select formControlName="implementation_state" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border">
              <option value="Full">Full</option>
              <option value="Partial">Partial</option>
              <option value="None">None</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea formControlName="description" rows="2" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border"></textarea>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" (click)="showAddActionModal = false" class="px-3 py-2 border border-gray-300 text-gray-700 rounded">Cancel</button>
            <button type="submit" [disabled]="actionForm.invalid" class="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Add</button>
          </div>
        </form>
      </div>
    </div>

    <!-- View/Edit Action Modal -->
    <div *ngIf="showActionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">{{ viewMode === 'actor' ? 'Action Details' : 'Edit Action' }}</h3>
        
        <div *ngIf="viewMode === 'actor'; else editForm" class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-500">Action Name</label>
            <p class="text-gray-900">{{ selectedAction?.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-500">Actor</label>
            <p class="text-gray-900">{{ selectedAction?.actor_name || '-' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-500">Priority</label>
            <p class="text-gray-900">{{ selectedAction?.priority }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-500">Implementation State</label>
            <p class="text-gray-900 flex items-center gap-1.5">
              <span [class]="getImplementationStateDot(selectedAction?.implementation_state)" class="w-2 h-2 rounded-full"></span>
              {{ selectedAction?.implementation_state }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-500">Map</label>
            <p class="text-gray-900">{{ selectedAction?.map_name || '-' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-500">Activity</label>
            <p class="text-gray-900">{{ selectedAction?.activity_name || '-' }}</p>
          </div>
          <div *ngIf="selectedAction?.description">
            <label class="block text-sm font-medium text-gray-500">Description</label>
            <p class="text-gray-900">{{ selectedAction?.description }}</p>
          </div>
          <div class="flex justify-end pt-4">
            <button type="button" (click)="showActionModal = false" class="px-3 py-2 border border-gray-300 text-gray-700 rounded">Close</button>
          </div>
        </div>

        <ng-template #editForm>
          <form [formGroup]="editActionForm" (ngSubmit)="updateActionFromModal()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Action Name *</label>
              <input type="text" formControlName="name" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border" />
            </div>
            <div class="flex gap-2">
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700">Actor</label>
                <div class="flex items-center gap-1">
                  <select formControlName="actor_id" class="mt-1 block w-full rounded border-gray-300 px-2 py-2 border text-sm">
                    <option [ngValue]="null">Select actor...</option>
                    <option *ngFor="let actor of actors" [ngValue]="actor.id">{{ actor.name }}</option>
                  </select>
                  <button type="button" (click)="showNewActorModal = true" class="text-indigo-600 hover:text-indigo-800 text-xs">+ New</button>
                </div>
              </div>
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700">Priority *</label>
                <select formControlName="priority" class="mt-1 block w-full rounded border-gray-300 px-2 py-2 border text-sm">
                  <option value="Need">Need</option>
                  <option value="Want">Want</option>
                  <option value="Nice">Nice</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Implementation State *</label>
              <select formControlName="implementation_state" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border">
                <option value="Full">Full</option>
                <option value="Partial">Partial</option>
                <option value="None">None</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea formControlName="description" rows="2" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border"></textarea>
            </div>

            <div class="border-t pt-4 mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Depends on:</label>
              <div *ngIf="actionDependencies.length === 0" class="text-sm text-gray-500">No dependencies</div>
              <div *ngFor="let dep of actionDependencies" class="flex items-center justify-between text-sm py-1">
                <span>{{ getDependencyActionName(dep.depends_on_action_id) }}</span>
                <button type="button" (click)="removeDependency(dep.depends_on_action_id)" class="text-red-600 hover:text-red-800 text-xs">×</button>
              </div>
            </div>

            <div *ngIf="actionPrerequisitesOf.length > 0" class="border-t pt-4 mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Prerequisite of:</label>
              <div *ngFor="let preq of actionPrerequisitesOf" class="text-sm text-gray-500 py-1">
                {{ preq.action_name || preq.name }} ({{ preq.action_priority || preq.priority }})
              </div>
            </div>

            <div class="border-t pt-4 mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Add dependency:</label>
              <select #depSelect (change)="onAddDependencySelected(depSelect.value); depSelect.value = ''" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border text-sm">
                <option value="">Select action...</option>
                <option *ngFor="let action of getAvailableActionsFor(editingActionId || 0)" [value]="action.id">
                  {{ action.map_name }} / {{ action.activity_name }} / {{ action.name }} ({{ action.priority }})
                </option>
              </select>
            </div>

            <div class="flex justify-between items-center mt-4">
              <button type="button" (click)="confirmDeleteAction()" class="text-sm text-red-600 hover:text-red-800">
                Delete Action
              </button>
              <div class="flex gap-2">
                <button type="button" (click)="showActionModal = false" class="px-3 py-2 border border-gray-300 text-gray-700 rounded">Cancel</button>
                <button type="submit" [disabled]="editActionForm.invalid" class="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Save</button>
              </div>
            </div>
          </form>
        </ng-template>
      </div>
    </div>

    <!-- New Actor Modal -->
    <div *ngIf="showNewActorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">Add Actor</h3>
        <form [formGroup]="newActorForm" (ngSubmit)="addActorFromModal()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Actor Name *</label>
            <input type="text" formControlName="name" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border" />
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" (click)="showNewActorModal = false" class="px-3 py-2 border border-gray-300 text-gray-700 rounded">Cancel</button>
            <button type="submit" [disabled]="newActorForm.invalid" class="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Add</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <app-confirm-delete-dialog
      *ngIf="showDeleteConfirm"
      [itemName]="pendingDeleteItem?.name || ''"
      [itemType]="pendingDeleteItem?.type || 'action'"
      (confirmed)="onDeleteConfirmed()"
      (cancelled)="onDeleteCancelled()"
    ></app-confirm-delete-dialog>

    <!-- Edit Map Modal -->
    <div *ngIf="showMapEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">Edit Map</h3>
        <form [formGroup]="editMapForm" (ngSubmit)="updateMapFromModal()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Map Name *</label>
            <input type="text" formControlName="name" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea formControlName="description" rows="2" class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border"></textarea>
          </div>
          <div class="flex justify-between items-center">
            <button type="button" (click)="confirmDeleteMap()" class="text-sm text-red-600 hover:text-red-800">
              Delete Map
            </button>
            <div class="flex gap-2">
              <button type="button" (click)="showMapEditModal = false" class="px-3 py-2 border border-gray-300 text-gray-700 rounded">Cancel</button>
              <button type="submit" [disabled]="editMapForm.invalid" class="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class MatrixComponent implements OnInit, OnChanges {
  @Input() contextId: number | null = null;
  @Input() mapId: number | null = null;
  @Output() dataChanged = new EventEmitter<void>();
  
  viewMode: ViewMode = 'map';
  currentMap: Map | null = null;
  currentActor: Actor | null = null;
  
  actors: Actor[] = [];
  maps: Map[] = [];
  activities: Activity[] = [];
  actions: ActionWithContext[] = [];
  
  priorities = ['Need', 'Want', 'Nice'];
  implementationStates = ['Full', 'Partial', 'None'];
  
  actorOptions: DropdownOption[] = [];
  mapOptions: DropdownOption[] = [];
  stateOptions: DropdownOption[] = [];
  
  actorDropdownOpen = false;
  mapDropdownOpen = false;
  stateDropdownOpen = false;
  actorSearchTerm = '';
  mapSearchTerm = '';
  
  inputsMap = new Map<number, boolean>();
  outputsMap = new Map<number, boolean>();
  
  showAddActivityModal = false;
  showAddActionModal = false;
  showNewActorModal = false;
  showActionModal = false;
  showEditActivityModal = false;
  showMapEditModal = false;
  showDeleteConfirm = false;
  addActionToActivityId: number | null = null;
  
  activityForm!: FormGroup;
  actionForm!: FormGroup;
  newActorForm!: FormGroup;
  editActionForm!: FormGroup;
  editActivityForm!: FormGroup;
  editMapForm!: FormGroup;
  
  pendingDeleteItem: { id: number; name: string; type: 'action' | 'activity' | 'map' } | null = null;
  editingActionId: number | null = null;
  editingActivityId: number | null = null;
  selectedAction: ActionWithContext | null = null;
  
  actionDependencies: ActionDependency[] = [];
  actionPrerequisitesOf: ActionWithContext[] = [];
  
  actorId: number | null = null;

  constructor(
    private mapService: MapService,
    private actorService: ActorService,
    private actionService: ActionService,
    private activityService: ActivityService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.initStateOptions();
    this.detectViewMode();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mapId'] && !changes['mapId'].firstChange) {
      this.loadMapData();
    }
    if (changes['contextId'] && !changes['contextId'].firstChange) {
      this.loadMapData();
    }
  }

  initForms(): void {
    this.activityForm = this.fb.group({
      name: ['', Validators.required]
    });
    this.actionForm = this.fb.group({
      name: ['', Validators.required],
      actor_id: [null],
      priority: ['Need', Validators.required],
      implementation_state: ['None', Validators.required],
      description: ['']
    });
    this.newActorForm = this.fb.group({
      name: ['', Validators.required]
    });
    this.editActionForm = this.fb.group({
      name: ['', Validators.required],
      actor_id: [null],
      priority: ['Need', Validators.required],
      implementation_state: ['None', Validators.required],
      description: ['']
    });
    this.editActivityForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
    this.editMapForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  initStateOptions(): void {
    this.stateOptions = this.implementationStates.map(name => ({
      id: 0,
      name,
      selected: true
    }));
  }

  detectViewMode(): void {
    const url = this.router.url;
    
    if (this.contextId !== null) {
      this.viewMode = 'map';
      this.loadMapData();
    } else if (this.mapId !== null) {
      this.viewMode = 'map';
      this.loadMapData();
    } else if (url.includes('/actors/')) {
      this.viewMode = 'actor';
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.actorId = +params['id'];
          this.loadActorData();
        }
      });
    } else {
      this.viewMode = 'map';
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.mapId = +params['id'];
          this.loadMapData();
        }
      });
    }
  }

  loadActorData(): void {
    if (!this.actorId) return;
    
    this.actorService.getById(this.actorId).subscribe({
      next: (actor) => this.currentActor = actor,
      error: (err) => console.error('Error loading actor:', err)
    });
    
    this.mapService.getAll().subscribe({
      next: (maps) => {
        this.maps = maps;
        this.mapOptions = maps.map(m => ({ id: m.id, name: m.name, selected: true }));
      },
      error: (err) => console.error('Error loading maps:', err)
    });
    
    this.actorService.getAll().subscribe({
      next: (actors) => {
        this.actors = actors;
        this.actorOptions = actors.map(a => ({ 
          id: a.id, 
          name: a.name, 
          selected: a.id === this.actorId 
        }));
      },
      error: (err) => console.error('Error loading actors:', err)
    });
    
    this.loadActions();
  }

  loadMapData(): void {
    if (!this.mapId) return;
    
    this.mapService.getById(this.mapId).subscribe({
      next: (map) => {
        this.currentMap = map;
      },
      error: (err) => console.error('Error loading map:', err)
    });
    
    this.mapService.getAll().subscribe({
      next: (maps) => {
        this.maps = maps;
        this.mapOptions = maps.map(m => ({ 
          id: m.id, 
          name: m.name, 
          selected: m.id === this.mapId 
        }));
      },
      error: (err) => console.error('Error loading maps:', err)
    });
    
    this.actorService.getAll().subscribe({
      next: (actors) => {
        this.actors = actors;
        this.actorOptions = actors.map(a => ({ 
          id: a.id, 
          name: a.name, 
          selected: true 
        }));
      },
      error: (err) => console.error('Error loading actors:', err)
    });
    
    this.loadMapActivities();
    this.loadActions();
  }

  loadMapActivities(): void {
    if (!this.mapId) return;
    this.activityService.getAll(this.mapId).subscribe({
      next: (activities) => {
        this.activities = activities;
      },
      error: (err) => console.error('Error loading activities:', err)
    });
  }

  loadActions(): void {
    this.actionService.getAllWithContext().subscribe({
      next: (actions) => {
        this.actions = actions;
        this.loadDependencyIndicators(actions);
      },
      error: (err) => console.error('Error loading actions:', err)
    });
  }

  loadDependencyIndicators(actions: ActionWithContext[]): void {
    this.inputsMap.clear();
    this.outputsMap.clear();
    
    for (const action of actions) {
      this.actionService.getDependencies(action.id).subscribe({
        next: (deps) => {
          if (deps.length > 0) {
            this.inputsMap.set(action.id, true);
          }
        },
        error: () => {}
      });
      this.actionService.getPrerequisitesOf(action.id).subscribe({
        next: (preqs) => {
          if (preqs.length > 0) {
            this.outputsMap.set(action.id, true);
          }
        },
        error: () => {}
      });
    }
  }

  get filteredActorOptions(): DropdownOption[] {
    if (!this.actorSearchTerm) return this.actorOptions;
    return this.actorOptions.filter(a => 
      a.name.toLowerCase().includes(this.actorSearchTerm.toLowerCase())
    );
  }

  get filteredMapOptions(): DropdownOption[] {
    if (!this.mapSearchTerm) return this.mapOptions;
    return this.mapOptions.filter(m => 
      m.name.toLowerCase().includes(this.mapSearchTerm.toLowerCase())
    );
  }

  get selectedActorIds(): number[] {
    return this.actorOptions.filter(a => a.selected).map(a => a.id);
  }

  get selectedMapIds(): number[] {
    return this.mapOptions.filter(m => m.selected).map(m => m.id);
  }

  get selectedStateNames(): string[] {
    return this.stateOptions.filter(s => s.selected).map(s => s.name);
  }

  get filteredActions(): ActionWithContext[] {
    return this.actions.filter(a => {
      const actorMatch = this.viewMode === 'actor' 
        ? a.actor_id === this.actorId 
        : (a.actor_id === null || this.selectedActorIds.length === 0 || (a.actor_id !== undefined && this.selectedActorIds.includes(a.actor_id)));
      
      const mapMatch = this.viewMode === 'map'
        ? a.map_id === this.mapId
        : (a.map_id === null || this.selectedMapIds.length === 0 || (a.map_id !== undefined && this.selectedMapIds.includes(a.map_id)));
      
      const stateMatch = this.selectedStateNames.includes(a.implementation_state);
      
      return actorMatch && mapMatch && stateMatch;
    });
  }

  get uniqueActivities(): Activity[] {
    return this.activities;
  }

  get showActorFilter(): boolean {
    return this.viewMode === 'map';
  }

  get showMapFilter(): boolean {
    return this.viewMode === 'actor';
  }

  get showActorBadges(): boolean {
    return this.viewMode === 'map';
  }

  get showMapBadges(): boolean {
    return this.viewMode === 'actor' && this.selectedMapIds.length > 1;
  }

  get pageTitle(): string {
    if (this.viewMode === 'actor') {
      return this.currentActor?.name || 'Actor';
    }
    return this.currentMap?.name || 'Map';
  }

  get pageSubtitle(): string {
    if (this.viewMode === 'actor') {
      const count = this.currentActor?.action_count || 0;
      return count > 0 ? `${count} action${count !== 1 ? 's' : ''}` : '';
    }
    return this.currentMap?.description || '';
  }

  toggleActorDropdown(): void {
    this.actorDropdownOpen = !this.actorDropdownOpen;
    this.mapDropdownOpen = false;
    this.stateDropdownOpen = false;
  }

  toggleMapDropdown(): void {
    this.mapDropdownOpen = !this.mapDropdownOpen;
    this.actorDropdownOpen = false;
    this.stateDropdownOpen = false;
  }

  toggleStateDropdown(): void {
    this.stateDropdownOpen = !this.stateDropdownOpen;
    this.actorDropdownOpen = false;
    this.mapDropdownOpen = false;
  }

  toggleActor(actor: DropdownOption): void {
    actor.selected = !actor.selected;
  }

  toggleMap(map: DropdownOption): void {
    map.selected = !map.selected;
  }

  toggleState(state: DropdownOption): void {
    state.selected = !state.selected;
  }

  getSelectedActorCount(): number {
    return this.actorOptions.filter(a => a.selected).length;
  }

  getSelectedMapCount(): number {
    return this.mapOptions.filter(m => m.selected).length;
  }

  getSelectedStateCount(): number {
    return this.stateOptions.filter(s => s.selected).length;
  }

  getMapName(mapId: number | undefined): string {
    if (!mapId) return '-';
    const map = this.maps.find(m => m.id === mapId);
    return map?.name || '-';
  }

  getActions(activityId: number, priority: string): ActionWithContext[] {
    return this.filteredActions.filter(
      a => a.activity_id === activityId && a.priority === priority
    );
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Need': return 'bg-red-100 text-red-800';
      case 'Want': return 'bg-blue-100 text-blue-800';
      case 'Nice': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getImplementationStateDot(state: string | undefined): string {
    switch (state) {
      case 'Full': return 'bg-green-500';
      case 'Partial': return 'bg-yellow-500';
      case 'None': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  getImplementationStateClass(state: string): string {
    switch (state) {
      case 'Full': return 'text-green-600';
      case 'Partial': return 'text-yellow-600';
      case 'None': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  openMapEditModal(): void {
    if (this.currentMap) {
      this.editMapForm.patchValue({
        name: this.currentMap.name,
        description: this.currentMap.description || ''
      });
      this.showMapEditModal = true;
    }
  }

  updateMapFromModal(): void {
    if (!this.currentMap || this.editMapForm.invalid) return;

    const { name, description } = this.editMapForm.value;

    this.mapService.update(this.currentMap.id, { name, description }).subscribe({
      next: () => {
        this.toastService.showSuccess(`Map '${name}' updated successfully`);
        this.showMapEditModal = false;
        this.loadMapData();
      },
      error: (err) => {
        console.error('Error updating map:', err);
        this.toastService.showError('Failed to update map');
      }
    });
  }

  confirmDeleteMap(): void {
    if (!this.currentMap) return;
    this.pendingDeleteItem = {
      id: this.currentMap.id,
      name: this.currentMap.name,
      type: 'map'
    };
    this.showMapEditModal = false;
    this.showDeleteConfirm = true;
  }

  goBack(): void {
    if (this.viewMode === 'actor') {
      this.router.navigate(['/actors']);
    } else {
      this.router.navigate(['/']);
    }
  }

  openActionModal(action: ActionWithContext): void {
    this.selectedAction = action;
    this.editingActionId = action.id;
    
    if (this.viewMode === 'map') {
      this.editActionForm.patchValue({
        name: action.name,
        actor_id: action.actor_id || null,
        priority: action.priority,
        implementation_state: action.implementation_state,
        description: action.description || ''
      });
      this.loadActionDependencies(action.id);
    }
    
    this.showActionModal = true;
  }

  openAddActionModal(activityId: number): void {
    this.addActionToActivityId = activityId;
    this.actionForm.reset({ actor_id: null, priority: 'Need' });
    this.showAddActionModal = true;
  }

  loadActionDependencies(actionId: number): void {
    this.actionService.getDependencies(actionId).subscribe({
      next: (deps) => {
        this.actionDependencies = deps;
      },
      error: (err) => console.error('Error loading dependencies:', err)
    });
    this.actionService.getPrerequisitesOf(actionId).subscribe({
      next: (preqs) => {
        this.actionPrerequisitesOf = preqs;
      },
      error: (err) => console.error('Error loading prerequisites:', err)
    });
  }

  getAvailableActionsFor(actionId: number): ActionWithContext[] {
    const currentDepIds = this.actionDependencies.map(d => d.depends_on_action_id);
    const prerequisiteOfIds = this.actionPrerequisitesOf.map(p => p.action_id);
    return this.actions.filter(a => 
      a.id !== actionId && !currentDepIds.includes(a.id) && !prerequisiteOfIds.includes(a.id)
    );
  }

  addActivityFromModal(): void {
    if (!this.mapId || this.activityForm.invalid) return;
    
    const { name } = this.activityForm.value;
    
    this.activityService.create({
      name,
      map_id: this.mapId
    }).subscribe({
      next: () => {
        this.loadMapActivities();
        this.loadActions();
        this.activityForm.reset();
        this.showAddActivityModal = false;
        this.toastService.showSuccess(`Activity '${name}' added successfully`);
        this.dataChanged.emit();
      },
      error: (err) => {
        console.error('Error adding activity:', err);
        this.toastService.showError('Failed to add activity');
      }
    });
  }

  openEditActivityModal(activity: { id: number; name: string; description?: string }): void {
    this.editingActivityId = activity.id;
    this.editActivityForm.patchValue({
      name: activity.name,
      description: activity.description || ''
    });
    this.showEditActivityModal = true;
  }

  updateActivityFromModal(): void {
    if (!this.editingActivityId || this.editActivityForm.invalid) return;

    const { name, description } = this.editActivityForm.value;

    this.activityService.update(this.editingActivityId, { name, description }).subscribe({
      next: () => {
        this.loadActions();
        this.showEditActivityModal = false;
        this.editingActivityId = null;
        this.toastService.showSuccess(`Activity '${name}' updated successfully`);
      },
      error: (err) => {
        console.error('Error updating activity:', err);
        this.toastService.showError('Failed to update activity');
      }
    });
  }

  confirmDeleteActivity(): void {
    if (!this.editingActivityId) return;
    const activity = this.activities.find(a => a.id === this.editingActivityId);
    this.pendingDeleteItem = {
      id: this.editingActivityId,
      name: activity?.name || '',
      type: 'activity'
    };
    this.showEditActivityModal = false;
    this.showDeleteConfirm = true;
  }

  addActionFromModal(): void {
    if (!this.addActionToActivityId || this.actionForm.invalid) return;
    
    const { name, actor_id, priority, implementation_state, description } = this.actionForm.value;
    
    this.actionService.create({
      name,
      actor_id,
      priority,
      implementation_state,
      description,
      activity_id: this.addActionToActivityId
    }).subscribe({
      next: () => {
        this.loadActions();
        this.actionForm.reset({ actor_id: null, priority: 'Need', implementation_state: 'None' });
        this.showAddActionModal = false;
        this.addActionToActivityId = null;
        this.toastService.showSuccess(`Action '${name}' added successfully`);
        this.dataChanged.emit();
      },
      error: (err) => {
        console.error('Error adding action:', err);
        this.toastService.showError('Failed to add action');
      }
    });
  }

  addActorFromModal(): void {
    if (this.newActorForm.invalid) return;
    
    const { name } = this.newActorForm.value;
    
    this.actorService.create({ name }).subscribe({
      next: () => {
        this.actorService.getAll().subscribe({
          next: (actors) => {
            this.actors = actors;
            this.actorOptions = actors.map(a => ({ 
              id: a.id, 
              name: a.name, 
              selected: a.id === this.actorId 
            }));
          },
          error: (err) => console.error('Error reloading actors:', err)
        });
        this.newActorForm.reset({ name: '' });
        this.showNewActorModal = false;
        this.toastService.showSuccess(`Actor '${name}' added successfully`);
      },
      error: (err) => {
        console.error('Error adding actor:', err);
        this.toastService.showError('Failed to add actor');
      }
    });
  }

  updateActionFromModal(): void {
    if (!this.editingActionId || this.editActionForm.invalid) return;

    const { name, actor_id, priority, implementation_state, description } = this.editActionForm.value;

    this.actionService.update(this.editingActionId, {
      name,
      actor_id: actor_id || null,
      priority,
      implementation_state,
      description
    }).subscribe({
      next: () => {
        this.loadActions();
        this.showActionModal = false;
        this.editingActionId = null;
        this.toastService.showSuccess(`Action '${name}' updated successfully`);
        this.dataChanged.emit();
      },
      error: (err) => {
        console.error('Error updating action:', err);
        this.toastService.showError('Failed to update action');
      }
    });
  }

  confirmDeleteAction(): void {
    if (!this.editingActionId) return;
    const action = this.actions.find(a => a.id === this.editingActionId);
    this.pendingDeleteItem = {
      id: this.editingActionId,
      name: action?.name || '',
      type: 'action'
    };
    this.showActionModal = false;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed(): void {
    if (!this.pendingDeleteItem) return;

    const itemName = this.pendingDeleteItem.name;

    if (this.pendingDeleteItem.type === 'activity') {
      this.activityService.delete(this.pendingDeleteItem.id).subscribe({
        next: () => {
          this.loadMapActivities();
          this.loadActions();
          this.closeDeleteDialog();
          this.toastService.showSuccess(`Activity '${itemName}' deleted successfully`);
          this.dataChanged.emit();
        },
        error: (err) => {
          console.error('Error deleting activity:', err);
          this.toastService.showError('Failed to delete activity');
          this.closeDeleteDialog();
        }
      });
    } else if (this.pendingDeleteItem.type === 'map') {
      this.mapService.delete(this.pendingDeleteItem.id).subscribe({
        next: () => {
          this.closeDeleteDialog();
          this.toastService.showSuccess(`Map '${itemName}' deleted successfully`);
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Error deleting map:', err);
          this.toastService.showError('Failed to delete map');
          this.closeDeleteDialog();
        }
      });
    } else {
      this.actionService.delete(this.pendingDeleteItem.id).subscribe({
        next: () => {
          this.loadActions();
          this.closeDeleteDialog();
          this.toastService.showSuccess(`Action '${itemName}' deleted successfully`);
          this.dataChanged.emit();
        },
        error: (err) => {
          console.error('Error deleting action:', err);
          this.toastService.showError('Failed to delete action');
          this.closeDeleteDialog();
        }
      });
    }
  }

  closeDeleteDialog(): void {
    this.showDeleteConfirm = false;
    this.pendingDeleteItem = null;
    this.editingActionId = null;
    this.editingActivityId = null;
  }

  onDeleteCancelled(): void {
    this.closeDeleteDialog();
  }

  addDependency(dependsOnActionId: number): void {
    if (!this.editingActionId) return;
    this.actionService.addDependency(this.editingActionId, dependsOnActionId).subscribe({
      next: () => {
        this.loadActionDependencies(this.editingActionId!);
      },
      error: (err) => console.error('Error adding dependency:', err)
    });
  }

  onAddDependencySelected(value: string): void {
    if (value) {
      this.addDependency(+value);
    }
  }

  removeDependency(dependsOnActionId: number): void {
    if (!this.editingActionId) return;
    this.actionService.removeDependency(this.editingActionId, dependsOnActionId).subscribe({
      next: () => {
        this.loadActionDependencies(this.editingActionId!);
      },
      error: (err) => console.error('Error removing dependency:', err)
    });
  }

  getDependencyActionName(actionId: number): string {
    const action = this.actions.find(a => a.id === actionId);
    return action ? `${action.name || action.action_name} (${action.priority || action.action_priority})` : '';
  }
}
