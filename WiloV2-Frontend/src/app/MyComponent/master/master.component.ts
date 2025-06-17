import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-role-assignment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.css']
})
export class RoleAssignmentComponent implements OnInit {
  roleForm: FormGroup;
  users: any[] = [];
  roles: any[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.roleForm = this.fb.group({
      userId: ['', [Validators.required, Validators.min(1)]],
      roleId: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.fetchData();
  }

  onSubmit() {
    if (this.roleForm.invalid) {
      this.markFormGroupTouched(this.roleForm);
      this.errorMessage = 'Please fill out all required fields correctly';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post('http://localhost:5000/api/user-management/assign-role', this.roleForm.value)
      .subscribe({
        next: () => {
          this.successMessage = 'Role assigned successfully!';
          this.roleForm.reset();
          this.isLoading = false;
          setTimeout(() => this.successMessage = '', 3000);
          this.fetchData(); // Refresh data after successful assignment
        },
        error: (err) => {
          this.handleError(err);
          this.isLoading = false;
        }
      });
  }

  fetchData() {
    this.isLoading = true;
    
    // Fetch users with error handling
    this.http.get<any[]>('http://localhost:5000/api/users').subscribe({
      next: (users) => {
        this.users = users;
        // Fetch roles after users
        this.http.get<any[]>('http://localhost:5000/api/user-management/roles').subscribe({
          next: (roles) => {
            this.roles = roles;
            this.isLoading = false;
          },
          error: (err) => this.handleError(err)
        });
      },
      error: (err) => this.handleError(err)
    });
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    this.errorMessage = error.error?.message || 'Failed to process request';
    if (error.status === 401) {
      this.errorMessage = 'Session expired. Please login again.';
    }
    this.isLoading = false;
    setTimeout(() => this.errorMessage = '', 5000);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}