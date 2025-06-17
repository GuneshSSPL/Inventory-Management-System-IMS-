import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // Import OnInit, OnDestroy
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './MyComponent/header/header.component';
import { SidebarComponent } from './MyComponent/sidebar/sidebar.component';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { LoaderComponent } from './components/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true, // If AppComponent is standalone
  imports: [
    HeaderComponent,
    SidebarComponent,
    CommonModule,
    RouterOutlet,
    RouterModule,
    LoaderComponent // Import LoaderComponent here
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy { // Implement OnInit, OnDestroy
  showHeader = false;
  private authSubscription!: Subscription;
  private routerSubscription!: Subscription;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Subscribe to router events
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      tap(() => console.log('AppComponent: NavigationEnd event detected'))
    ).subscribe(event => {
      const navigationEndEvent = event as NavigationEnd;
      // We primarily rely on the auth state, but route helps for initial load/direct nav
      this.updateShowHeaderState(this.authService.isLoggedIn(), navigationEndEvent.urlAfterRedirects || navigationEndEvent.url);
    });

    // Subscribe to authentication state changes
    this.authSubscription = this.authService.currentUser.pipe(
      tap(user => console.log('AppComponent: currentUser changed:', user))
    ).subscribe(user => {
      this.updateShowHeaderState(!!user, this.router.url);
    });

    // Initial check on component load
    // Use a slight delay to ensure router is fully initialized if needed, though usually not necessary here
    // setTimeout(() => this.updateShowHeaderState(this.authService.isLoggedIn(), this.router.url), 0);
    this.updateShowHeaderState(this.authService.isLoggedIn(), this.router.url); 
  }

  updateShowHeaderState(isLoggedIn: boolean, currentUrl: string) {
    const isLoginPage = currentUrl.startsWith('/login');
    const isSignupPage = currentUrl.startsWith('/signup');
    const isRootPage = currentUrl === '/';

    // Core Logic: If not logged in, OR on a public page (login, signup, root), DO NOT show header.
    if (!isLoggedIn || isLoginPage || isSignupPage || isRootPage) {
      this.showHeader = false;
    } else {
      this.showHeader = true;
    }
    console.log(`AppComponent: updateShowHeaderState - URL: ${currentUrl}, isLoggedIn: ${isLoggedIn}, new showHeader: ${this.showHeader}`);
    this.cdr.detectChanges(); // Manually trigger change detection
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  logout() {
    this.authService.logout(); 
    // Auth service handles navigation and currentUser subject update.
    // The subscriptions will call updateShowHeaderState.
  }
}
