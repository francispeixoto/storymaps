import { Routes } from '@angular/router';
import { ContextsPageComponent } from './pages/contexts-page.component';
import { ContextFormComponent } from './pages/context-form.component';
import { ContextDetailComponent } from './pages/context-detail.component';
import { MapFormComponent } from './pages/map-form.component';
import { ActorsPageComponent } from './pages/actors-page.component';
import { ActorFormComponent } from './pages/actor-form.component';
import { ActorDetailComponent } from './pages/actor-detail.component';
import { MatrixComponent } from './pages/matrix.component';

export const routes: Routes = [
  { path: '', component: ContextsPageComponent },
  { path: 'contexts', component: ContextsPageComponent },
  { path: 'contexts/create', component: ContextFormComponent, data: { mode: 'create' } },
  { path: 'contexts/:id', component: ContextDetailComponent },
  { path: 'contexts/:id/edit', component: ContextFormComponent, data: { mode: 'edit' } },
  { path: 'actors', component: ActorsPageComponent },
  { path: 'actors/create', component: ActorFormComponent, data: { mode: 'create' } },
  { path: 'actors/:id', component: ActorDetailComponent },
  { path: 'actors/:id/edit', component: ActorFormComponent, data: { mode: 'edit' } },
  { path: 'maps/create', component: MapFormComponent, data: { mode: 'create' } },
  { path: 'maps/:id', component: MatrixComponent }
];