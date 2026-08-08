import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { httpStatusCodes } from '../constants/statusCodes';
import { AuthService } from '../service/auth.service';

const REFRESH_TOKEN_ENDPOINT = '/auth/refreshToken';

const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const isRefreshRequest = req.url.includes(REFRESH_TOKEN_ENDPOINT);

  const modifiedReq = req.clone({
    withCredentials: true,
    setHeaders: req.headers.has('Content-Type')
      ? {}
      : {
          'Content-Type': 'application/json',
        },
  });

  return next(modifiedReq).pipe(
    catchError((error) => {
      console.log('REQUEST ERROR:', {
        url: req.url,
        status: error.status,
      });

      // Never try to refresh the refresh request itself.
      if (
        error.status !== httpStatusCodes.UNAUTHORIZED ||
        isRefreshRequest
      ) {
        return throwError(() => error);
      }

      console.log('ATTEMPTING REFRESH:', req.url);

      return authService.refreshToken().pipe(
        switchMap(() => {
          console.log('REFRESH SUCCESS');
          console.log('RETRYING ORIGINAL REQUEST:', req.url);

          return next(modifiedReq);
        }),

        catchError((refreshError) => {
          console.log('REFRESH FAILED:', refreshError);

          if (!publicRoutes.some((route) => router.url.startsWith(route))) {
            router.navigate(['/login'], { replaceUrl: true });
          }

          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
