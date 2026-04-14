import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4">
          <a routerLink="/" class="text-3xl font-bold text-gray-900 hover:text-indigo-600">
            StoryMaps
          </a>
        </div>
      </header>
      <main class="max-w-7xl mx-auto py-6 px-4">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {}