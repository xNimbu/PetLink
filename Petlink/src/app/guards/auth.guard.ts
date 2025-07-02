// src/app/guards/auth.guard.ts
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { first, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private auth: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    // 1) Si no es navegador (SSR), dejamos pasar
    if (!isPlatformBrowser(this.platformId)) {
      return of(true);
    }

    // 2) Esperamos a que AuthService ya haya cargado/refresh token
    return this.auth.ready$.pipe(
      first(),
      map(() => {
        if (this.auth.isLoggedIn) {
          return true;
        }
        // 3) Si no está logueado, construimos UrlTree a /login
        return this.router.createUrlTree(
          ['/login'],
          { queryParams: { returnUrl: state.url } }
        );
      })
    );
  }
}
