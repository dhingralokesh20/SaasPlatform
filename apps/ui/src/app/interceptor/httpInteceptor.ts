import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { httpStatusCodes } from '../constants/statusCodes';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Clone request
  const modifiedReq = req.clone({
    withCredentials: true,
    setHeaders: req.headers.has('Content-Type') ? {} : { 'Content-Type': 'application/json' },
  });

  return next(modifiedReq).pipe(
    catchError((error) => {
      if (error.status === httpStatusCodes.UNAUTHORIZED) {
        if (router.url !== '/login') {
          router.navigate(['/login']);
        }
      }
      if (error.status === httpStatusCodes.FORBIDDEN) {
        // optional: show access denied page or toast
      }
      return throwError(() => error);
    }),
  );
};
