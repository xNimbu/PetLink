// src/app/guards/role.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const expectedRoles = route.data['role'] as string[];
    const firebaseUser = this.auth._currentUser.value;  // sigue siendo firebase.User

    // 1) Si no hay usuario → login
    if (!firebaseUser) {
      return this.router.createUrlTree(
        ['/login'],
        { queryParams: { returnUrl: state.url } }
      );
    }

    // 2) Extrae los claims del token
    let tokenResult;
    try {
      tokenResult = await firebaseUser.getIdTokenResult();
    } catch (e) {
      console.error('No se pudo obtener IdTokenResult', e);
      this.toastr.error('No se pudo obtener IdTokenResult', 'ACCESO DENEGADO');
      return this.router.createUrlTree(['/home']);
    }

    // 3) Lee el claim "roles" (puede venir como string o array)
    const raw = tokenResult.claims['role'];
    const role: string[] = Array.isArray(raw)
      ? raw
      : (typeof raw === 'string' ? [raw] : []);

    // 4) Comprueba el permiso
    const ok = expectedRoles.some(r => role.includes(r));
    if (!ok) {
      return this.router.createUrlTree(['/home']);
    }

    return true;
  }
}
