import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page.component';
import { MapCreateComponent } from './pages/map-create.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'maps/create', component: MapCreateComponent }
];