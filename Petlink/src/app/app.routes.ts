// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthShellComponent }    from './auth-shell/auth-shell.component';
import { RedirectGuard }         from './guards/redirect.guard';
import { AuthGuard }             from './guards/auth.guard';
import { LoginGuard }            from './guards/login.guard';
import { LoginComponent }        from './auth-shell/login/login.component';
import { RegisterComponent }     from './auth-shell/register/register.component';

export const routes: Routes = [
  // Ruta raíz: espera a cargar token y luego redirige
  {
    path: '',
    canActivate: [RedirectGuard],
    children: []
  },
  // Login/Register solo para usuarios no autenticados
  {
    path: '',
    component: AuthShellComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [LoginGuard],
        data: { animation: 'LoginPage' }
      },
      {
        path: 'register',
        component: RegisterComponent,
        canActivate: [LoginGuard],
        data: { animation: 'RegisterPage' }
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  // Rutas protegidas (solo usuarios autenticados)
  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./components/profile/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/:username',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/:uid',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  // Catch-all: redirige a la raíz (que a su vez redirige segun sesión)
  { path: '**', redirectTo: '' }
];
