import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class RedirectGuard implements CanActivate {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<UrlTree> {
    // Si es SSR, dejamos que el guard decida de todas formas
    if (!isPlatformBrowser(this.platformId)) {
      return of(this.router.parseUrl('/login'));
    }
    // Esperamos a ready$ antes de redirigir
    return this.authService.ready$.pipe(
      first(),
      map(() =>
        this.authService.isLoggedIn
          ? this.router.createUrlTree(['/home'])
          : this.router.createUrlTree(['/login'])
      )
    );
  }
}
