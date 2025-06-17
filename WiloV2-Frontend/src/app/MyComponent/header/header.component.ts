import { Component } from '@angular/core';
import { RedirectCommand, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
 


@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  constructor(private authService: AuthService) { } // Inject AuthService

  onLogout(): void {
    this.authService.logout(); // Call the logout method from AuthService
    
  }
}
