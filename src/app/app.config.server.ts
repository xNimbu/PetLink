import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAuth, Auth } from '@angular/fire/auth';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideClientHydration(),
    // Provide a dummy Auth instance so injection doesn't fail
    provideAuth(() => null as unknown as Auth),
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
