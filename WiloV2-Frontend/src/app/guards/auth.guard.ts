import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators'; // Removed filter
import { AuthService, UserData } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    console.log('AuthGuard: Checking access for route:', state.url);

    // Ensure the observable always emits, even if user is null or has no roles/permissions
    return this.authService.currentUser.pipe(
      take(1), // Take the first emitted value
      map((user: UserData | null) => { // Allow user to be null
        console.log('AuthGuard: User data received from observable. Proceeding to check permissions.');
        
        // Check if the user is logged in first
        if (!this.authService.isLoggedIn()) {
          console.log('AuthGuard: User is not logged in. Redirecting to login.');
          this.authService.logout(); // Ensure logout clears any partial state
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          return false;
        }

        // If logged in, proceed with permission checks
        const requiredPermissions = route.data['permissions'] as Array<string>;
        const permissionOperator = route.data['permissionOperator'] as string || 'AND';

        // Ensure user object is not null for permission checks
        const currentUser = user as UserData; 

        if (requiredPermissions && requiredPermissions.length > 0) {
          console.log(`AuthGuard: Route requires permissions: ${requiredPermissions.join(', ')} with operator: ${permissionOperator}`);
          
          let hasPermission = false;
          const isAdmin = currentUser.roles && currentUser.roles.includes('Admin');
          const requiresAdminAccess = requiredPermissions.includes('admin_access');

          if (isAdmin && requiresAdminAccess) {
            console.log('AuthGuard: User is Admin and route requires admin_access. Granting access.');
            hasPermission = true;
          } else if (isAdmin && !requiresAdminAccess) {
            console.log('AuthGuard: User is Admin. Granting access to non-admin_access route.');
            hasPermission = true;
          } else {
            if (permissionOperator === 'OR') {
              hasPermission = requiredPermissions.some(rp => currentUser.permissions.includes(rp));
              console.log(`AuthGuard: Permission check (OR): ${requiredPermissions.join(', ')}. Result: ${hasPermission}`);
            } else { // Default to AND
              hasPermission = requiredPermissions.every(rp => currentUser.permissions.includes(rp));
              console.log(`AuthGuard: Permission check (AND): ${requiredPermissions.join(', ')}. Result: ${hasPermission}`);
            }
          }

          if (hasPermission) {
            console.log('AuthGuard: User has required permissions. Access granted.');
            return true;
          } else {
            console.log('AuthGuard: User does not have required permissions. Redirecting to login.');
            this.authService.logout();
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return false;
          }
        }
        console.log('AuthGuard: User is authenticated, no specific permissions required for this route. Access granted.');
        return true;
      })
    );
  }
}