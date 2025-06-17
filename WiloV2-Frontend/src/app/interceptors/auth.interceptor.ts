import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // Proactively check for token expiration
    if (token && this.authService.isTokenExpired(token)) {
      console.warn('AuthInterceptor: Token is expired. Logging out.');
      this.authService.logout(); // This will navigate to login
      // It's important to stop the request from proceeding if the token is known to be expired.
      // Returning an error observable is one way to do this.
      return throwError(() => new HttpErrorResponse({ 
        error: 'Client-side token expired check failed', 
        status: 401, 
        statusText: 'Unauthorized'
      }));
    }

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Check if the error is NOT because we already handled client-side expiration
          if (error.error !== 'Client-side token expired check failed') {
             console.error('AuthInterceptor: Server responded with 401. Logging out.', error);
             this.authService.logout();
          }
        }
        return throwError(() => error);
      })
    );
  }
}
