import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router'; // Import Router

// Define the UserData interface to match backend response and frontend needs
export interface UserData {
  success: boolean;
  token: string;
  userId: number;
  email: string;
  employeeName?: string; 
  roles: string[];
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth'; // Adjust as needed
  private currentUserSubject: BehaviorSubject<UserData | null>;
  public currentUserData: Observable<UserData | null>;

  constructor(private http: HttpClient, private router: Router) { // Inject Router
    // Initialize currentUserSubject with data from localStorage if available
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<UserData | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUserData = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): UserData | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<UserData> {
    return this.http.post<UserData>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(userData => {
          if (userData && userData.token) {
            localStorage.setItem('currentUser', JSON.stringify(userData));
            localStorage.setItem('token', userData.token); // Also store token separately if needed by interceptor
            this.currentUserSubject.next(userData);
          }
          return userData; // Ensure userData is returned for further processing if any
        }),
        catchError(error => {
          // Handle login errors (e.g., display a message to the user)
          console.error('Login failed:', error);
          this.currentUserSubject.next(null); // Clear user data on error
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
          return of(error); // Or throwError to propagate
        })
      );
  }

  register(signupData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, signupData);
  }

  logout() {
    console.log('Logout function called. Attempting to clear local storage...');
    localStorage.removeItem('currentUser');
    console.log('currentUser removed from local storage. Current value: ' + localStorage.getItem('currentUser'));
    localStorage.removeItem('token');
    console.log('token removed from local storage. Current value: ' + localStorage.getItem('token'));
    this.currentUserSubject.next(null);
    console.log('currentUserSubject set to null.');
    this.router.navigate(['/login']); // Navigate to login page after logout
    console.log('Navigating to login page.');
  }

  // Helper function to check if token is expired (basic check)
  isTokenExpired(token: string | null): boolean {
    if (!token) {
      return true;
    }
    try {
      const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
      return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    } catch (e) {
      return true; // If any error in parsing, treat as expired
    }
  }

  // Check if the user has a specific permission
  hasPermission(permission: string): boolean {
    const currentUser = this.currentUserValue;
    return !!currentUser && !!currentUser.permissions && currentUser.permissions.includes(permission);
  }

  // Check if the user has a specific role
  hasRole(role: string): boolean {
    const currentUser = this.currentUserValue;
    return !!currentUser && !!currentUser.roles && currentUser.roles.includes(role);
  }

  // Potentially for AuthGuard to check if user is logged in
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !this.isTokenExpired(token);
  }

  // handleAuthCallback might not be needed if you are not using external OAuth providers that redirect back
  // handleAuthCallback(): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/callback`);
  // }
}
