import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService, UserData } from '../services/auth.service'; // Adjust path as necessary, ensure UserData is imported

@Directive({
  selector: '[appHasPermission]',
  standalone: true // Mark as standalone if you are using standalone components/directives
})
export class PermissionDirective implements OnInit, OnDestroy {
  private currentUserPermissions: string[] = [];
  private requiredPermissions: string[] = [];
  private logicalOperator: 'AND' | 'OR' = 'AND'; // Default to AND
  private subscription: Subscription | undefined;
  private elseTemplateRef: TemplateRef<any> | null = null; // To store the else template

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {
    console.log('PermissionDirective: Constructor - Initial currentUserValue:', this.authService.currentUserValue);
  }

  ngOnInit() {
    this.subscription = this.authService.currentUser.subscribe((userData: UserData | null) => { // Changed currentUserData to currentUser and added type for userData
      console.log('PermissionDirective: Received user data from AuthService:', userData); // Add this line
      this.currentUserPermissions = userData?.permissions || [];
      this.updateView();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  @Input()
  set appHasPermission(value: string | string[]) {
    this.requiredPermissions = Array.isArray(value) ? value : [value];
    this.updateView();
  }

  @Input()
  set appHasPermissionOp(operator: 'AND' | 'OR') {
    this.logicalOperator = operator;
    this.updateView();
  }

  @Input()
  set appHasPermissionElse(templateRef: TemplateRef<any> | null) {
    this.elseTemplateRef = templateRef;
    this.updateView(); // Update view when else template changes
  }

  private updateView() {
    console.log('PermissionDirective: Updating view.');
    console.log('  Required Permissions:', this.requiredPermissions);
    // Use the current value from the service directly
    this.currentUserPermissions = this.authService.currentUserValue?.permissions || [];
    console.log('  Current User Permissions:', this.currentUserPermissions);
    const hasPermission = this.checkPermissions();
    console.log('  Has Permission:', hasPermission);

    if (hasPermission) {
      if (!this.viewContainer.length) {
        this.viewContainer.clear(); // Clear previous view (e.g., else block)
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      this.viewContainer.clear(); // Clear previous view (e.g., main content block)
      if (this.elseTemplateRef) {
        this.viewContainer.createEmbeddedView(this.elseTemplateRef);
      } else {
        // If no else template, default behavior is to clear (already done)
      }
    }
  }

  private checkPermissions(): boolean {
    console.log('PermissionDirective: Checking permissions...');
    console.log('  Required:', this.requiredPermissions);
    console.log('  Current:', this.currentUserPermissions);
    console.log('  Operator:', this.logicalOperator);

    if (!this.requiredPermissions || this.requiredPermissions.length === 0) {
      return true; // No specific permissions required, so show the element
    }

    if (!this.currentUserPermissions || this.currentUserPermissions.length === 0) {
      return false; // User has no permissions, so hide if any are required
    }

    if (this.logicalOperator === 'OR') {
      return this.requiredPermissions.some(rp => this.currentUserPermissions.includes(rp));
    } else { // Default to AND
      return this.requiredPermissions.every(rp => this.currentUserPermissions.includes(rp));
    }
  }
}