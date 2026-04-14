import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page.component';
import { MapFormComponent } from './pages/map-form.component';
import { MapMatrixComponent } from './pages/map-matrix.component';
import { ActorsPageComponent } from './pages/actors-page.component';
import { ActorFormComponent } from './pages/actor-form.component';
import { ActorMatrixComponent } from './pages/actor-matrix.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'actors', component: ActorsPageComponent },
  { path: 'actors/create', component: ActorFormComponent, data: { mode: 'create' } },
  { path: 'actors/:id', component: ActorFormComponent, data: { mode: 'view' } },
  { path: 'actors/:id/edit', component: ActorFormComponent, data: { mode: 'edit' } },
  { path: 'actors/:id/matrix', component: ActorMatrixComponent },
  { path: 'maps/create', component: MapFormComponent, data: { mode: 'create' } },
  { path: 'maps/:id', component: MapMatrixComponent },
  { path: 'maps/:id/edit', component: MapFormComponent, data: { mode: 'edit' } },
  { path: 'maps/:id/activities', component: MapFormComponent, data: { mode: 'view' } }
];