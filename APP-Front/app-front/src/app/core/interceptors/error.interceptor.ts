import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const AUTH_ERROR_CODES = [
  'AUTH_INVALID_TOKEN',
  'AUTH_MISSING_TOKEN',
  'AUTH_UNAUTHORIZED',
  'UNAUTHORIZED',
  'jwt expired',
  'Invalid or expired token',
  'Invalid token'
];

export const errorInterceptor: HttpInterceptorFn = (
  req,
  next
) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let isAuthError = false;

      if (error.status === 401) {
        isAuthError = true;
      } else if (error.error?.error) {
        isAuthError = AUTH_ERROR_CODES.includes(error.error.error);
      } else if (error.error?.message) {
        isAuthError = AUTH_ERROR_CODES.some(code => 
          error.error.message.includes(code)
        );
      }

      if (isAuthError) {
        authService.logout();
      }

      return throwError(() => error);
    })
  );
};