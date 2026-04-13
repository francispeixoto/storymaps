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
│   │   ├── pages/             # Route pages (home-page.component.ts)
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

### MapListComponent

Displays all maps in a card grid layout.

```typescript
@Component({
  selector: 'app-map-list',
  template: `
    <div class="grid grid-cols-3 gap-4">
      <div *ngFor="let map of maps" class="card">
        {{ map.name }}
      </div>
    </div>
  `
})
export class MapListComponent {
  maps: Map[] = [];
  // Load maps on init
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

## Services

### MapService

```typescript
@Injectable({ providedIn: 'root' })
export class MapService {
  private apiUrl = 'http://localhost:3000/api/maps';

  getAll(): Observable<Map[]> {
    return this.http.get<Map[]>(this.apiUrl);
  }

  getById(id: number): Observable<Map> {
    return this.http.get<Map>(`${this.apiUrl}/${id}`);
  }

  create(map: CreateMapDto): Observable<Map> {
    return this.http.post<Map>(this.apiUrl, map);
  }

  update(id: number, map: UpdateMapDto): Observable<Map> {
    return this.http.put<Map>(`${this.apiUrl}/${id}`, map);
  }

  delete(id: number): Observable<void> {
    return this.http.delete(`${this.apiUrl}/${id}`);
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