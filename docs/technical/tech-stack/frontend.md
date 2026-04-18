# Frontend

This document details the Angular frontend implementation.

## Project Setup

### Initialization

```bash
ng new client --style=css --routing --skip-tests
cd client
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

### Configuration

**tailwind.config.js**
```javascript
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/styles.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #f9fafb;
  --bg-secondary: #ffffff;
  --text-primary: #111827;
  /* ... other light theme variables */
}

.dark {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  /* ... other dark theme variables */
}
```

## Dark Mode

StoryMaps implements a dark mode toggle using a CSS variables approach with Tailwind's class-based dark mode.

### Approach

1. **CSS Variables**: Theme colors defined in `:root` and `.dark` classes in `styles.css`
2. **Tailwind Class**: `darkMode: 'class'` in `tailwind.config.js`
3. **Toggle**: AppComponent manages state via localStorage and applies `.dark` class to `<html>`

### CSS Variables

Light theme (default):
```css
:root {
  --bg-primary: #f9fafb;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #4b5563;
  --border-color: #e5e7eb;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --matrix-bg: #ffffff;
  --action-card-bg: #f9fafb;
}
```

Dark theme:
```css
.dark {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --bg-tertiary: #374151;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border-color: #374151;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --matrix-bg: #1f2937;
  --action-card-bg: #374151;
}
```

### Component Integration

Components use Tailwind's dark mode variants:
```html
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content adapts based on .dark class on parent
</div>
```

### Persistence

Dark mode preference is stored in localStorage and applied on app load:

```typescript
// In AppComponent
ngOnInit() {
  const darkMode = localStorage.getItem('darkMode') === 'true';
  if (darkMode) {
    document.documentElement.classList.add('dark');
  }
}

toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', 
    document.documentElement.classList.contains('dark').toString()
  );
}
```

### Angular Structure

```
client/
├── src/
│   ├── app/
│   │   ├── components/          # Reusable components
│   │   ├── services/            # API services
│   │   │   ├── map.service.ts
│   │   │   ├── activity.service.ts
│   │   │   ├── action.service.ts
│   │   │   └── actor.service.ts
│   │   ├── models/             # TypeScript interfaces (index.ts)
│   │   ├── pages/             # Route pages
│   │   │   ├── home-page.component.ts    # Home page with map list
│   │   │   ├── map-form.component.ts      # Create/Edit/View map form
│   │   │   ├── map-matrix.component.ts   # Kanban-style matrix view
│   │   │   ├── actors-page.component.ts # Actor list
│   │   │   └── actor-form.component.ts  # Create/Edit/View actor
│   │   ├── app.component.ts  # Root component
│   │   ├── app.config.ts    # App configuration
│   │   └── app.routes.ts  # Route definitions
│   ├── environments/          # Environment configuration
│   │   ├── environment.ts          # Development config
│   │   └── environment.prod.ts    # Production config
│   ├── styles.css             # Tailwind + custom scrollbars
│   ├── index.html
│   └── main.ts
├── angular.json
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── tsconfig.json
├── proxy.conf.json            # API proxy config for dev
└── .gitignore
```

## Key Components

### HomePageComponent

Displays the map list with a "Create Map" button.

```typescript
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">Your Maps</h2>
        <a routerLink="/maps/create" class="btn-primary">
          Create Map
        </a>
      </div>

      <div *ngIf="maps.length > 0" class="grid grid-cols-3 gap-4">
        <div *ngFor="let map of maps" class="card">
          {{ map.name }}
        </div>
      </div>
    </div>
  `
})
export class HomePageComponent implements OnInit {
  maps: Map[] = [];
  // Load maps on init
}
```

### MapFormComponent

Unified component for creating, editing, and viewing maps. Uses route data to determine mode.

```typescript
@Component({
  selector: 'app-map-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div *ngIf="mode === 'view' && map">
      <h3>{{ map.name }}</h3>
      <button (click)="goToEdit()">Edit</button>
    </div>
    <form *ngIf="mode !== 'view'" [formGroup]="mapForm" (ngSubmit)="onSubmit()">
      <input formControlName="name" placeholder="Map Name" />
      <textarea formControlName="description" placeholder="Description"></textarea>
      <button type="submit" [disabled]="mapForm.invalid">
        {{ mode === 'edit' ? 'Update Map' : 'Create Map' }}
      </button>
    </form>
  `
})
export class MapFormComponent implements OnInit {
  mode: 'create' | 'edit' | 'view' = 'create';
  
  constructor(
    private fb: FormBuilder, 
    private mapService: MapService,
    private route: ActivatedRoute
  ) {
    this.mapForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }
  
  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.mode = data['mode'] || 'create';
    });
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.mode = 'view';
        // Load map by ID
      }
    });
  }
}
```

### MapEditorComponent

Form for creating/editing maps with activities and actions.

```typescript
@Component({
  selector: 'app-map-editor',
  template: `
    <form (ngSubmit)="save()">
      <input [(ngModel)]="map.name" name="name" />
      <div *ngFor="let activity of map.activities">
        <input [(ngModel)]="activity.name" name="activity" />
      </div>
    </form>
  `
})
export class MapEditorComponent {
  // Form handling
}
```

### MapViewerComponent

Visual story matrix display.

```typescript
@Component({
  selector: 'app-map-viewer',
  template: `
    <div class="matrix">
      <div class="row" *ngFor="let activity of activities">
        <div class="cell" *ngFor="let action of activity.actions">
          {{ action.name }}
        </div>
      </div>
    </div>
  `
})
export class MapViewerComponent {}
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | HomePageComponent | Map list with create button |
| `/contexts` | ContextsPageComponent | Context list with health scores |
| `/contexts/create` | ContextFormComponent | Create new context |
| `/contexts/:id` | ContextDetailComponent | View context with maps |
| `/contexts/:id/edit` | ContextFormComponent | Edit context |
| `/actors` | ActorsPageComponent | Actor management list |
| `/actors/create` | ActorFormComponent | Create new actor |
| `/actors/:id` | ActorFormComponent | View actor |
| `/actors/:id/edit` | ActorFormComponent | Edit actor |
| `/maps/create` | MapFormComponent | Create new map form |
| `/maps/:id` | MapFormComponent | View map with activities |
| `/maps/:id/edit` | MapFormComponent | Edit map and manage activities |
| `/maps/:id/matrix` | MapMatrixComponent | Kanban-style matrix view |

## Activity Management

The MapFormComponent includes activity management in view and edit modes:

- **View mode**: Display activities with priority badges
- **Edit mode**: Add/delete activities with name and priority
- **Priority badges**: Need (red), Want (blue), Nice (green)

### Activity Form

```typescript
activityForm = this.fb.group({
  name: ['', Validators.required],
  priority: ['Need', Validators.required]
});
```

### Priority Styling

| Priority | CSS Class | Badge Color |
|----------|-----------|-------------|
| Need | `bg-red-100 text-red-800` | Red |
| Want | `bg-blue-100 text-blue-800` | Blue |
| Nice | `bg-green-100 text-green-800` | Green |

## Action Display

In view mode, actions are displayed inside each activity with expand/collapse functionality:

- **Expand/collapse**: Click activity to toggle action list visibility
- **Actor badges**: PM (purple), Developer (yellow), DevOps (orange)
- **Priority badges**: Need (red), Want (blue), Nice (green)

### Actor Styling

| Actor | CSS Class | Badge Color |
|-------|-----------|-------------|
| PM | `bg-purple-100 text-purple-800` | Purple |
| Developer | `bg-yellow-100 text-yellow-800` | Yellow |
| DevOps | `bg-orange-100 text-orange-800` | Orange |

### ActionService

The ActionService auto-generates UIDs for new actions:

```typescript
create(action: Partial<Action>): Observable<Action> {
  const uid = `maps-${activityId}-act-${Date.now()}`;
  return this.http.post<Action>(this.apiUrl, { uid, ...action });
}
```

## Actor Management

### ActorService

```typescript
@Injectable({ providedIn: 'root' })
export class ActorService {
  private apiUrl = '/api/actors';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Actor[]> {
    return this.http.get<Actor[]>(this.apiUrl);
  }

  getById(id: number): Observable<Actor> {
    return this.http.get<Actor>(`${this.apiUrl}/${id}`);
  }

  create(actor: Partial<Actor>): Observable<Actor> {
    const uid = `actor-${Date.now()}`;
    return this.http.post<Actor>(this.apiUrl, { uid, ...actor });
  }

  update(id: number, actor: Partial<Actor>): Observable<Actor> {
    return this.http.put<Actor>(`${this.apiUrl}/${id}`, actor);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### ContextService

```typescript
@Injectable({ providedIn: 'root' })
export class ContextService {
  private apiUrl = '/api/contexts';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Context[]> {
    return this.http.get<Context[]>(this.apiUrl);
  }

  getById(id: number): Observable<Context> {
    return this.http.get<Context>(`${this.apiUrl}/${id}`);
  }

  getWithMaps(id: number): Observable<ContextWithMaps> {
    return this.http.get<ContextWithMaps>(`${this.apiUrl}/${id}/full`);
  }

  create(context: Partial<Context>): Observable<Context> {
    return this.http.post<Context>(this.apiUrl, context);
  }

  update(id: number, context: Partial<Context>): Observable<Context> {
    return this.http.put<Context>(`${this.apiUrl}/${id}`, context);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMaps(id: number): Observable<Map[]> {
    return this.http.get<Map[]>(`${this.apiUrl}/${id}/maps`);
  }

  addMap(contextId: number, mapId: number): Observable<{context_id: number, map_id: number}> {
    return this.http.post<{context_id: number, map_id: number}>(`${this.apiUrl}/${contextId}/maps`, { map_id: mapId });
  }

  removeMap(contextId: number, mapId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${contextId}/maps/${mapId}`);
  }
}
```

The ContextService returns contexts with health data computed server-side. Each context includes a `health` object with score, totalActions, and per-priority breakdown.

### Inline Actor Creation Modal

In the map edit form, actions can create actors inline. A "+ New" button next to the actor dropdown opens a modal:

```typescript
// Modal shown when adding new actor
<div *ngIf="showNewActorModal" class="modal">
  <form [formGroup]="newActorForm" (ngSubmit)="createActorAndSelect()">
    <input formControlName="name" placeholder="Actor Name" />
    <textarea formControlName="description" placeholder="Description"></textarea>
    <button type="submit">Create</button>
  </form>
</div>
```

After creation, the new actor is automatically selected in the dropdown.

## Matrix View (Kanban-Style)

The matrix view (`/maps/:id/matrix`) displays:
- **Columns**: Activities
- **Rows**: Priority swimlanes (Need, Want, Nice)
- **Cells**: Action cards at activity × priority intersection

Features:
- Sticky column headers (activity names)
- Sticky row headers (priority labels)
- Horizontal and vertical scrolling
- Custom thin scrollbars (8px)

```typescript
@Component({
  selector: 'app-map-matrix',
  template: `
    <div class="matrix-container">
      <table class="matrix-table">
        <thead class="matrix-thead">
          <tr>
            <th class="matrix-corner"></th>
            <th *ngFor="let activity of activities">
              {{ activity.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let priority of priorities">
            <td class="matrix-row-header">{{ priority }}</td>
            <td *ngFor="let activity of activities">
              <div *ngFor="let action of getActions(activity.id, priority)">
                {{ action.name }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class MapMatrixComponent {}
```

## Running the Frontend

### Angular Environment Configuration

StoryMaps uses Angular's environment system to manage API URLs across different deployment targets.

#### Environment Files

- **Development** (`src/environments/environment.ts`):
  ```typescript
  export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000/api'
  };
  ```

- **Production** (`src/environments/environment.prod.ts`):
  ```typescript
  export const environment = {
    production: true,
    apiUrl: '/api'
  };
  ```

#### How to Use

Import environment in services:
```typescript
import { environment } from '../../environments/environment';

private apiUrl = `${environment.apiUrl}/maps`;
```

#### Build Targets

| Command | Environment Used | API URL |
|---------|-------------------|---------|
| `npm run dev` | development | `http://localhost:3000/api` |
| `npm run build` | production | `/api` |

The file replacements are configured in `angular.json`:
```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.prod.ts"
  }
]
```

#### MapService

```typescript
@Injectable({ providedIn: 'root' })
export class MapService {
  private apiUrl = `${environment.apiUrl}/maps`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Map[]> {
    return this.http.get<Map[]>(this.apiUrl);
  }

  getById(id: number): Observable<Map> {
    return this.http.get<Map>(`${this.apiUrl}/${id}`);
  }

  create(map: Partial<Map>): Observable<Map> {
    const uid = `maps-${Date.now()}`;
    return this.http.post<Map>(this.apiUrl, { uid, ...map });
  }

  update(id: number, map: Partial<Map>): Observable<Map> {
    return this.http.put<Map>(`${this.apiUrl}/${id}`, map);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### TypeScript Models

```typescript
export interface Map {
  id: number;
  uid: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Actor {
  id: number;
  uid: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  uid: string;
  map_id: number;
  name: string;
  priority: 'Need' | 'Want' | 'Nice';
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: number;
  uid: string;
  activity_id: number;
  actor_id?: number;
  actor_name?: string;
  name: string;
  priority: 'Need' | 'Want' | 'Nice';
  description?: string;
  created_at: string;
  updated_at: string;
}

## Running the Frontend

### Development

```bash
cd client
npm install
npm run dev
# App runs on http://localhost:4200
# API calls proxy to http://localhost:3000
```

### Production

```bash
cd client
npm install
npm run build
# Production build output in dist/storymaps-client/
# nginx serves /api to backend
```

## Building for Production

```bash
npm run build
# The production build output is in dist/storymaps-client/
```

## Note on API Proxy

In development (`ng serve`), the `proxy.conf.json` handles routing `/api/*` requests to the backend. In production (Docker), nginx handles this routing.

See [Angular Environment Configuration](#angular-environment-configuration) for how the API URL is managed.