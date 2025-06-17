import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken(); // Use authService to get the token

  // Proactively check for token expiration
  if (token && authService.isTokenExpired(token)) {
    console.warn('AuthInterceptor: Token is expired. Logging out.');
    authService.logout(); // This will navigate to login
    // It's important to stop the request from proceeding if the token is known to be expired.
    // Returning an error observable is one way to do this.
    return throwError(() => new HttpErrorResponse({
      error: 'Client-side token expired check failed',
      status: 401,
      statusText: 'Unauthorized'
    }));
  }

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('AuthInterceptor: 401 Unauthorized response. Logging out.', error);
        authService.logout(); // Log out on 401 errors
      }
      return throwError(() => error);
    })
  );
};
