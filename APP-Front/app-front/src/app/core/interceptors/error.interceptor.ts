import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const AUTH_ERROR_CODES = [
  'AUTH_INVALID_TOKEN',
  'AUTH_MISSING_TOKEN',
  'AUTH_UNAUTHORIZED',
  'UNAUTHORIZED'
];

export const errorInterceptor: HttpInterceptorFn = (
  req,
  next
) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthError =
        error.status === 401 ||
        (error.error?.error && AUTH_ERROR_CODES.includes(error.error.error));

      if (isAuthError) {
        authService.logout();
      }

      return throwError(() => error);
    })
  );
};