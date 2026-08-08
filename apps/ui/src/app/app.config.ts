import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { httpInterceptor } from './interceptor/httpInterceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { initializeAuth } from './intializer/auth.intializer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpInterceptor])),
    provideAppInitializer(initializeAuth),
  ],
};
