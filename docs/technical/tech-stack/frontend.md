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
│   │   │   └── map-create.component.ts   # Create new map form
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

### MapCreateComponent

Form for creating a new map with name and description fields.

```typescript
@Component({
  selector: 'app-map-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="mapForm" (ngSubmit)="onSubmit()">
      <input formControlName="name" placeholder="Map Name" />
      <textarea formControlName="description" placeholder="Description"></textarea>
      <button type="submit" [disabled]="mapForm.invalid">Create Map</button>
    </form>
  `
})
export class MapCreateComponent implements OnInit {
  mapForm: FormGroup;
  
  constructor(private fb: FormBuilder, private mapService: MapService) {
    this.mapForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }
  
  onSubmit(): void {
    if (this.mapForm.valid) {
      this.mapService.create(this.mapForm.value).subscribe();
    }
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
| `/maps/create` | MapCreateComponent | Create new map form |

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