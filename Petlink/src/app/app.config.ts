import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServerRendering } from '@angular/platform-server';
import { provideClientHydration } from '@angular/platform-browser';
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import {
  provideFirebaseApp,
  initializeApp
} from '@angular/fire/app';
import { provideAuth, Auth, getAuth } from '@angular/fire/auth';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { AuthInterceptor } from './interceptors/auth.interceptors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    importProvidersFrom(
      BrowserAnimationsModule,
      ToastrModule.forRoot({
        positionClass: 'toast-top-right',
        timeOut: 3000,
        preventDuplicates: true
      })
    ),

    // SSR vs Browser
    ...(typeof window === 'undefined'
      ? [
          provideServerRendering(),
          // para que `@angular/fire/auth` inyecte algo y no falle:
          provideAuth(() => null as unknown as Auth)
        ]
      : [
          provideClientHydration(),
          provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
          provideAuth(() => getAuth())
        ])
  ]
};
