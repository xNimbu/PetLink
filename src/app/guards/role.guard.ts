// src/app/guards/role.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../services/auth/auth.service';
import { ProfileService } from '../services/profile/profile.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private profileSvc: ProfileService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    console.log('[RoleGuard] intentando acceder a:', state.url);

    // 1) Asegura que haya un token válido (espera authState si es necesario)
    let token: string;
    try {
      token = await this.auth.getIdToken();
      console.log('[RoleGuard] token obtenido:', token);
    } catch {
      console.log('[RoleGuard] → NO autenticado, redirijo a /login');
      return this.router.createUrlTree(
        ['/login'],
        { queryParams: { returnUrl: state.url } }
      );
    }

    // 2) Pide el perfil al back
    let profile;
    try {
      profile = await this.profileSvc.getProfile();
      console.log('[RoleGuard] perfil recibido:', profile);
    } catch (err: any) {
      console.error('[RoleGuard] error al getProfile():', err.status, err);
      this.toastr.error('Error al cargar perfil', 'ACCESO DENEGADO');
      return this.router.createUrlTree(['/home']);
    }

    // 3) Valida el rol contra data.role
    const expectedRoles = route.data['role'] as string[];  // e.g. ['admin']
    console.log('[RoleGuard] roles esperados:', expectedRoles, '– profile.role:', profile.role);
    if (!expectedRoles.includes(profile.role)) {
      console.log('[RoleGuard] → rol NO autorizado, redirijo a /home');
      this.toastr.error('No tienes permiso para acceder aquí', 'ACCESO DENEGADO');
      return this.router.createUrlTree(['/home']);
    }

    console.log('[RoleGuard] → acceso PERMITIDO');
    return true;
  }
}
