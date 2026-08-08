import { HttpBackend, HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { AuthState } from '../state/auth.state';

const PUBLIC_AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export function initializeAuth(): Promise<void> {
  const httpBackend = inject(HttpBackend);
  const authState = inject(AuthState);
  const router = inject(Router);

  const http = new HttpClient(httpBackend);

  const currentUrl = router.url.split('?')[0];

  // Guest-only pages do not need authentication restoration.
  if (PUBLIC_AUTH_ROUTES.includes(currentUrl)) {
    authState.setUser(null);
    authState.setInitialized();

    return Promise.resolve();
  }

  return (async () => {
    try {
      const response: any = await http
        .get(`${environment.apiBaseUrl}/auth/me`, {
          withCredentials: true,
        })
        .toPromise();

      authState.setUser(response.data);
    } catch (error: any) {
      if (error?.status === 401) {
        try {
          await http
            .post(
              `${environment.apiBaseUrl}/auth/refreshToken`,
              {},
              {
                withCredentials: true,
              },
            )
            .toPromise();

          const response: any = await http
            .get(`${environment.apiBaseUrl}/auth/me`, {
              withCredentials: true,
            })
            .toPromise();

          authState.setUser(response.data);
        } catch {
          authState.setUser(null);
        }
      } else {
        authState.setUser(null);
      }
    } finally {
      authState.setInitialized();
    }
  })();
}
