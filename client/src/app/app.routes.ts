import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page.component';
import { MapFormComponent } from './pages/map-form.component';
import { ActorsPageComponent } from './pages/actors-page.component';
import { ActorFormComponent } from './pages/actor-form.component';
import { MatrixComponent } from './pages/matrix.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'actors', component: ActorsPageComponent },
  { path: 'actors/create', component: ActorFormComponent, data: { mode: 'create' } },
  { path: 'actors/:id', component: MatrixComponent },
  { path: 'actors/:id/edit', component: ActorFormComponent, data: { mode: 'edit' } },
  { path: 'maps/create', component: MapFormComponent, data: { mode: 'create' } },
  { path: 'maps/:id', component: MatrixComponent },
  { path: 'maps/:id/edit', component: MapFormComponent, data: { mode: 'edit' } },
  { path: 'maps/:id/activities', component: MapFormComponent, data: { mode: 'view' } }
];