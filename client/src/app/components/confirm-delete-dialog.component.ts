import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete this {{ itemType }}?</h3>
        <p class="text-gray-600 dark:text-gray-300 text-sm mb-6">
          "{{ itemName }}" will be permanently removed. This action cannot be recovered.
        </p>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            (click)="cancelled.emit()"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            (click)="confirmed.emit()"
            class="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDeleteDialogComponent {
  @Input() itemName: string = '';
  @Input() itemType: 'activity' | 'action' | 'map' | 'actor' | 'context' = 'action';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
