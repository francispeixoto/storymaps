import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, ToastComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
          <a routerLink="/" class="text-3xl font-bold text-gray-900 hover:text-indigo-600">
            StoryMaps
          </a>
          <nav class="flex gap-4">
            <a routerLink="/" class="text-gray-600 hover:text-gray-900" [class.text-indigo-600]="isActive('/')" [class.font-medium]="isActive('/')">
              Contexts
            </a>
            <a routerLink="/actors" class="text-gray-600 hover:text-gray-900" [class.text-indigo-600]="isActive('/actors')" [class.font-medium]="isActive('/actors')">
              Actors
            </a>
          </nav>
        </div>
      </header>
      <main class="max-w-7xl mx-auto py-6 px-4">
        <router-outlet></router-outlet>
      </main>
      <app-toast></app-toast>
    </div>
  `
})
export class AppComponent {
  constructor(private router: Router) {}
  
  isActive(path: string): boolean {
    return this.router.url === path;
  }
}