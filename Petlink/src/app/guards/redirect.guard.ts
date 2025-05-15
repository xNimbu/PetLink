import { Injectable }  from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class RedirectGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): UrlTree {
    return this.authService.isLoggedIn
      ? this.router.parseUrl('/home')
      : this.router.parseUrl('/login');
  }
}
