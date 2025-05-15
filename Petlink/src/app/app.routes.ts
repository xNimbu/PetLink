import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '', component: LoginComponent }, 
  { path: 'home', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
  { path: 'addPost', loadComponent: () => import('./components/home/add-post/add-post.component').then(m => m.AddPostComponent) },
   { path: 'chats', loadComponent: () => import('./components/home/chats/chats.component').then(m => m.ChatsComponent) },

  // Opcional: ruta wildcard para redirigir todo lo desconocido al login
  //{ path: '**', redirectTo: '' }
];