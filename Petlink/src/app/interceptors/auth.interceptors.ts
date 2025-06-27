// src/app/interceptors/auth.interceptor.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // En servidor no tocamos nada
    if (!isPlatformBrowser(this.platformId)) {
      return next.handle(req);
    }

    // from convierte la Promise<string> en Observable<string>
    return from(this.authService.getIdToken()).pipe(
      mergeMap(token => {
        // Si hay token, clona la request con Authorization
        const authReq = token
          ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
          : req;
        return next.handle(authReq);
      })
    );
  }
}
