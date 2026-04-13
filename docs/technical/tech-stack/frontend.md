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
```

### Angular Structure

```
client/
├── src/
│   ├── app/
│   │   ├── components/          # Reusable components
│   │   ├── services/            # API services (map.service.ts, activity.service.ts, action.service.ts)
│   │   ├── models/             # TypeScript interfaces (index.ts)
│   │   ├── pages/             # Route pages
│   │   │   ├── home-page.component.ts    # Home page with map list
│   │   │   ├── map-form.component.ts      # Create/Edit/View map form
│   │   │   └── map-create.component.ts     # Create new map form (legacy)
│   │   ├── app.component.ts  # Root component
│   │   ├── app.config.ts    # App configuration
│   │   └── app.routes.ts  # Route definitions
│   ├── assets/
│   ├── environments/
│   ├── styles.css             # Tailwind directives
│   ├── index.html
│   └── main.ts
├── angular.json
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── tsconfig.json
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
| `/maps/create` | MapFormComponent | Create new map form |
| `/maps/:id` | MapFormComponent | View map with activities |
| `/maps/:id/edit` | MapFormComponent | Edit map and manage activities |

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

## Running the Frontend

### MapService

```typescript
@Injectable({ providedIn: 'root' })
export class MapService {
  private apiUrl = 'http://localhost:3000/api/maps';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Map[]> {
    return this.http.get<Map[]>(this.apiUrl);
  }

  getById(id: number): Observable<Map> {
    return this.http.get<Map>(`${this.apiUrl}/${id}`);
  }

  create(map: Partial<Map>): Observable<Map> {
    // Auto-generate UID using timestamp
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: number;
  uid: string;
  mapId: number;
  name: string;
  priority: 'Need' | 'Want' | 'Nice';
}

export interface Action {
  id: number;
  uid: string;
  activityId: number;
  name: string;
  actor: 'PM' | 'Developer' | 'DevOps';
  priority: 'Need' | 'Want' | 'Nice';
  description?: string;
  dependencies: Action[];
}
```

## Running the Frontend

### Development

```bash
cd client
npm install
npm start
# Visit http://localhost:4200
```

### Production

```bash
cd client
npm install
npm run build
# Production build output in dist/storymaps-client/
```

## Building for Production

```bash
npm run build
# The production build output is in dist/storymaps-client/
```