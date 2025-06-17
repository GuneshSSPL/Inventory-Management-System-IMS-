import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.css']
})
export class AuthCallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        console.log('AuthCallbackComponent: Token received:', token);
        try {
          const decodedToken: any = jwtDecode(token);
          console.log('AuthCallbackComponent: Decoded Token:', decodedToken);

          // Ensure these properties match your JWT payload and UserData interface
          const user = {
            token: token,
            userId: decodedToken.userId || decodedToken.sub || decodedToken.id, // 'sub' is a common JWT field for user ID
            email: decodedToken.email,
            // Adjust these lines based on your actual JWT payload structure
            roleId: decodedToken.RoleID || decodedToken.role_id, 
            roleName: decodedToken.Role || decodedToken.role, 
            permissions: decodedToken.permissions || decodedToken.user_permissions || [],
            roles: (decodedToken.Role || decodedToken.role) ? [decodedToken.Role || decodedToken.role] : (Array.isArray(decodedToken.roles) ? decodedToken.roles : []), // Handle single role or array of roles
            employeeName: decodedToken.employeeName || decodedToken.name || decodedToken.email 
          };

          console.log('AuthCallbackComponent: User object BEFORE setCurrentUser:', user);
          console.log('AuthCallbackComponent: User roles BEFORE setCurrentUser:', user.roles);
          this.authService.setCurrentUser(user);
          console.log('AuthCallbackComponent: User data stored in localStorage. Checking authService.currentUserValue immediately after:');
          console.log(this.authService.currentUserValue);
          this.router.navigate(['/material-table']); // Redirect to a protected route
        } catch (error) {
          console.error('AuthCallbackComponent: Error decoding token or processing user data:', error);
          this.router.navigate(['/login']);
        }
      } else {
        console.warn('AuthCallbackComponent: No token found in query parameters.');
        this.router.navigate(['/login']);
      }
    });
  }
}