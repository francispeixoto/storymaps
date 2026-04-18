import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, ToastComponent],
  template: `
    <div class="min-h-screen" [class.bg-gray-50]="!darkMode" [class.dark:bg-gray-900]="darkMode" [class.bg-gray-900]="darkMode">
      <header class="shadow" [class.bg-white]="!darkMode" [class.bg-gray-800]="darkMode" [class.border-b]="darkMode" [class.border-gray-700]="darkMode">
        <div class="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
          <a routerLink="/" class="text-3xl font-bold hover:text-indigo-600" 
             [class.text-gray-900]="!darkMode" [class.text-white]="darkMode">
            StoryMaps
          </a>
          <div class="flex items-center gap-4">
            <nav class="flex gap-4">
              <a routerLink="/" class="hover:text-gray-900" 
                 [class.text-gray-600]="!darkMode" [class.text-gray-300]="darkMode"
                 [class.text-indigo-600]="isActive('/')" [class.font-medium]="isActive('/')">
                Contexts
              </a>
              <a routerLink="/actors" class="hover:text-gray-900" 
                 [class.text-gray-600]="!darkMode" [class.text-gray-300]="darkMode"
                 [class.text-indigo-600]="isActive('/actors')" [class.font-medium]="isActive('/actors')">
                Actors
              </a>
              <a routerLink="/roadmap" class="hover:text-gray-900" 
                 [class.text-gray-600]="!darkMode" [class.text-gray-300]="darkMode"
                 [class.text-indigo-600]="isActive('/roadmap')" [class.font-medium]="isActive('/roadmap')">
                Roadmap
              </a>
            </nav>
            <button
              (click)="toggleDarkMode()"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              [class.text-gray-600]="!darkMode" [class.text-gray-300]="darkMode"
              title="Toggle dark mode"
            >
              <svg *ngIf="!darkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </svg>
              <svg *ngIf="darkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>
      <main class="max-w-7xl mx-auto py-6 px-4">
        <router-outlet></router-outlet>
      </main>
      <app-toast></app-toast>
    </div>
  `
})
export class AppComponent implements OnInit {
  darkMode = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      this.darkMode = saved === 'true';
    } else {
      this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyDarkMode();
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', String(this.darkMode));
    this.applyDarkMode();
  }

  private applyDarkMode(): void {
    if (this.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }
}