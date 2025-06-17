import { Component, OnInit } from '@angular/core'; // Import OnInit here
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; // Import ActivatedRoute
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, UserData } from '../../services/auth.service'; // Import UserData here
import { environment } from '../../../environments/environment'; // Ensure this is imported
import { AuthSidebarComponent } from '../auth-sidebar/auth-sidebar.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    AuthSidebarComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute // Inject ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        console.log('LoginComponent: Token received from queryParams:', token);
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('LoginComponent: Decoded token payload:', payload);

            const userData: UserData = {
              token: token,
              userId: parseInt(payload.userId, 10), // Ensure userId is a number
              email: payload.email,
              roles: payload.Role ? [payload.Role] : [], // Correctly populate roles from payload.Role
              permissions: payload.permissions || [],
              employeeName: payload.employeeName || '' 
            };
            console.log('LoginComponent: UserData prepared:', userData);
            this.authService.setCurrentUser(userData); 
            console.log('LoginComponent: User set in AuthService. Current user value:', this.authService.currentUserValue);
            
            // const userRoles = payload.roles || []; // No longer needed for this simplified navigation
            // const userPermissions = payload.permissions || []; // No longer needed for this simplified navigation

            // Updated navigation logic: always go to /material-table
            console.log('LoginComponent: Navigating to /material-table');
            this.router.navigate(['/material-table'], { replaceUrl: true, queryParams: {} });

          } else {
            console.error('LoginComponent: Invalid token format received.');
            this.router.navigate(['/login'], { replaceUrl: true, queryParams: {} });
          }
        } catch (e) {
          console.error('LoginComponent: Error processing token:', e);
          this.router.navigate(['/login'], { replaceUrl: true, queryParams: {} });
        }
      }
    });
  }

  login() {
    console.log('Login button clicked. Credentials:', this.credentials); // Add this line
    if (!this.credentials.email || !this.credentials.password) {
      alert('Please fill in all fields');
      console.log('Missing credentials.'); // Add this line
      return;
    }

    this.authService.login(this.credentials.email, this.credentials.password)
      .subscribe({
        next: (response: { token: string }) => {
          console.log('Login successful. Response:', response); // Add this line
          localStorage.setItem('token', response.token);
          // Decode token to check permissions - simplified for now
          // You would typically use a library like jwt-decode here
          const tokenParts = response.token.split('.');
          if (tokenParts.length === 3) {
            try {
              const payload = JSON.parse(atob(tokenParts[1]));
              const permissions = payload.permissions || []; // Assuming permissions are in the token
              if (permissions.length === 0 && payload.role !== 'Admin') { // Also check if not Admin
                this.router.navigate(['/access-request']);
              } else {
                this.router.navigate(['/material-table']);
              }
            } catch (e) {
              console.error('Error decoding token:', e);
              this.router.navigate(['/login']); // Fallback to login on error
            }
          } else {
            this.router.navigate(['/login']); // Fallback if token is not as expected
          }
        },
        error: (error: { error: { message: any } }) => {
          console.error('Login failed:', error); // Add this line
          alert('Login failed: ' + (error.error?.message || 'Unknown error'));
        }
      });
  }

  loginWithAuth0() {
    // The callbackUrl here is the one Auth0 will redirect to *after* it authenticates the user.
    // This URL must be registered in your Auth0 Application's "Allowed Callback URLs".
    const auth0CallbackUrl = encodeURIComponent(`${environment.apiUrl}/api/auth/auth0/callback`);
    
    // Redirect to your backend's route that initiates the Auth0 flow.
    // Note: The path is /auth/auth0, not /api/auth/auth0
    // environment.apiUrl should be 'http://localhost:5000'
    window.location.href = `${environment.apiUrl}/api/auth/auth0?redirect_uri=${auth0CallbackUrl}`;
  }

  loginWithGithub() {
    window.location.href = `${environment.apiUrl}/auth/github`;
  }

  loginWithLinkedIn() {
    // Redirect to your backend LinkedIn login route
    window.location.href = 'http://localhost:5000/api/auth/linkedin';
  }
}
