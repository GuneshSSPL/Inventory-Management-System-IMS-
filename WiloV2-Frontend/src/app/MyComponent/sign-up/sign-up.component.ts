import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AuthSidebarComponent } from '../auth-sidebar/auth-sidebar.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [FormsModule, RouterModule, AuthSidebarComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  signupData = {
    employeeName: '',
    email: '',
    password: '',
    roleId: 2,
    departmentId: 1
  };
  re_password = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  signup() {
    if (this.signupData.password !== this.re_password) {
      this.errorMessage = 'Passwords do not match'; // Use errorMessage property
      return;
    }

    this.errorMessage = ''; // Clear previous errors

    this.authService.register(this.signupData).subscribe({
      next: (response) => {
        console.log('Signup successful', response);
        // Optionally show a success message
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Signup failed', error);
        this.errorMessage = error.error?.message || 'Signup failed. Please try again.'; // Display error message from backend or a default one
      }
    });
  }
}

