// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthShellComponent } from './auth-shell/auth-shell.component';
import { RedirectGuard    } from './guards/redirect.guard';
import { AuthGuard        } from './guards/auth.guard';
import { LoginComponent } from './auth-shell/login/login.component';
import { RegisterComponent } from './auth-shell/register/register.component';

export const routes: Routes = [
  // 🔐 Shell de autenticación
  {
    path: '',
    component: AuthShellComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
        data: { animation: 'LoginPage' }
      },
      {
        path: 'register',
        component: RegisterComponent,
        data: { animation: 'RegisterPage' }
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  // Ruta raíz que redirige según sesión
  { path: '', canActivate: [RedirectGuard], children: [] },
  // Home protegido
  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    canActivate: [AuthGuard]
  },
  // Rutas de perfil
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  // Catch-all
  { path: '**', redirectTo: '' }
];
