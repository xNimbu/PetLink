import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '', component: LoginComponent }, 
  { path: 'home', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },

  // Opcional: ruta wildcard para redirigir todo lo desconocido al login
  //{ path: '**', redirectTo: '' }
];