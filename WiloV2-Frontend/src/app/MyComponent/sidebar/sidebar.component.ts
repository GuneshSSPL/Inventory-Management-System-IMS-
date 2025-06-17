import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service'; // Import AuthService
import { UserData } from '../../services/auth.service'; // Import UserData interface
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  constructor(public authService: AuthService) {
    console.log('SidebarComponent initialized. Current user data:', this.authService.currentUserValue);
  }

  isAuthenticated(): boolean {
    const authenticated = this.authService.isLoggedIn();
    console.log('SidebarComponent: isAuthenticated called, result:', authenticated);
    return authenticated;
  }

  // Optional: Add a method to log permissions if needed for debugging template logic
  logPermissions(): void {
    console.log('SidebarComponent: Current user permissions:', this.authService.currentUserValue?.permissions);
    console.log('SidebarComponent: Current user roles:', this.authService.currentUserValue?.roles);
  }

  logout(): void {
    this.authService.logout();
  }
}
