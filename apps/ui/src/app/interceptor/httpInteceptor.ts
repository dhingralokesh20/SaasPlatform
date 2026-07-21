import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { httpStatusCodes } from '../constants/statusCodes';
import { AuthService } from '../service/auth.service';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const authService = inject(AuthService);

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
      if (error.status === httpStatusCodes.UNAUTHORIZED && !req.url.includes('/auth/refresh')) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            return next(modifiedReq);
          }),

          catchError((refreshError) => {
            router.navigate(['/login']);

            return throwError(() => refreshError);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
