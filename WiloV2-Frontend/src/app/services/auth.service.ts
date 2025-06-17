import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router'; // Add this import

export interface UserData {
  token: string;
  userId: number; // Or string, depending on your backend
  email: string;
  roles: string[];
  permissions: string[];
  employeeName: string;
  // Add other relevant user details if needed
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Change apiUrl to a relative path that the proxy will handle
  private apiUrl = '/api/auth'; 
  private currentUserSubject: BehaviorSubject<UserData | null>;
  public currentUser: Observable<UserData | null>;

  constructor(private http: HttpClient, private router: Router) { // Inject Router here
    const storedUser = localStorage.getItem('currentUser');
    console.log('AuthService: Stored user from localStorage:', storedUser);
    const initialUser = storedUser ? JSON.parse(storedUser) : null;
    console.log('AuthService: Initial user data from localStorage:', initialUser);
    if (initialUser) {
      console.log('AuthService: Initial user permissions from localStorage:', initialUser.permissions);
    }
    this.currentUserSubject = new BehaviorSubject<UserData | null>(initialUser);
    console.log('AuthService: currentUserSubject initialized with:', this.currentUserSubject.value);
    if (this.currentUserSubject.value) {
      console.log('AuthService: Permissions in currentUserSubject after initialization:', this.currentUserSubject.value.permissions);
    }
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): UserData | null {
    return this.currentUserSubject.value;
  }

  public setCurrentUser(userData: UserData | null): void { // Add this public method
    this.currentUserSubject.next(userData);
    if (userData) {
      localStorage.setItem('currentUser', JSON.stringify(userData));
      // Removed: localStorage.setItem('token', userData.token); // This is now redundant
    } else {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
  }

  login(email: string, password: string): Observable<UserData> {
    return this.http.post<UserData>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(user => {
          console.log('AuthService: User data received from backend:', user);
          if (user && user.token) {
            // Use the new method to set current user
            this.setCurrentUser(user);
            console.log('AuthService: User data stored in localStorage and currentUserSubject updated.');
            console.log('AuthService: Current user permissions after login:', user.permissions);
          }
          return user; // Ensure the user object is returned for subscription
        })
      );
  }

  logout(): void {
    const currentUrl = this.router.url;
    console.log('Logging out from URL:', currentUrl); 

    localStorage.removeItem('currentUser');
    localStorage.removeItem('token'); 
    this.currentUserSubject.next(null);

    // Condition to add returnUrl: 
    // - currentUrl exists
    // - currentUrl is NOT /login
    // - currentUrl is NOT /signup
    // - currentUrl is NOT /
    // - currentUrl does NOT start with /admin (NEW CONDITION)
    if (currentUrl && 
        !currentUrl.startsWith('/login') && 
        !currentUrl.startsWith('/signup') && 
        currentUrl !== '/' && 
        !currentUrl.startsWith('/admin')) { // <-- This condition prevents returnUrl for /admin routes
      console.log('Navigating to login with returnUrl:', currentUrl); 
      this.router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
    } else {
      console.log('Navigating to login without returnUrl (or from an admin route).'); 
      this.router.navigate(['/login']);
    }
  }

  getToken(): string | null {
    return this.currentUserValue ? this.currentUserValue.token : null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue && !!this.currentUserValue.token;
  }

  hasPermission(permission: string): boolean {
    if (!this.isLoggedIn() || !this.currentUserValue?.permissions) {
      return false;
    }
    return this.currentUserValue.permissions.includes(permission);
  }

  hasRole(role: string): boolean {
    if (!this.isLoggedIn() || !this.currentUserValue?.roles) {
      return false;
    }
    return this.currentUserValue.roles.includes(role);
  }

  register(signupData: {
    employeeName: string;
    email: string;
    password: string;
    roleId: number;
    departmentId: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, signupData);
  }

  // Helper to check if token is expired (basic example, consider using a library like jwt-decode for robust check)
  isTokenExpired(token: string | null = this.getToken()): boolean {
    if (!token) {
      return true;
    }
    // This is a very basic check. For JWTs, you'd decode it and check the 'exp' claim.
    // For simplicity, we'll assume tokens don't expire or backend handles it.
    // For a real app, implement proper JWT expiration check.
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiry;
    } catch (e) {
      return true; // If token is malformed, treat as expired
    }
  }
}
