import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page.component';
import { MapFormComponent } from './pages/map-form.component';
import { MapMatrixComponent } from './pages/map-matrix.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'maps/create', component: MapFormComponent, data: { mode: 'create' } },
  { path: 'maps/:id', component: MapFormComponent, data: { mode: 'view' } },
  { path: 'maps/:id/edit', component: MapFormComponent, data: { mode: 'edit' } },
  { path: 'maps/:id/matrix', component: MapMatrixComponent }
];