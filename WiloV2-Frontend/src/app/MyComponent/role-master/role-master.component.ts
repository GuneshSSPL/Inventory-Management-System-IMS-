import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementService, User, Role, Permission } from '../../services/user-management.service';
import { AuthService } from '../../services/auth.service';
import { PermissionDirective } from '../../directives/permission.directive';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-role-master',
  standalone: true,
  imports: [CommonModule, FormsModule, PermissionDirective],
  templateUrl: './role-master.component.html',
  styleUrls: ['./role-master.component.css']
})
export class RoleMasterComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  permissions: Permission[] = [];
  selectedUserId: number | null = null;
  selectedRoleId: number | null = null;
  selectedRoleIdForPermission: number | null = null;
  selectedRolePermissions: number[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  showRoleChangeSection = false;
  showPermissionChangeSection = false;
  newSelectedRoleId: number | null = null;
  permissionsToUpdate: { [permissionId: number]: boolean } = {};
  displayRoleConfirmDialog = false;
  displayPermissionConfirmDialog = false;

  initialRolePermissions: Permission[] = [];
  loadingPermissions: boolean = false;
  rolePermissions: Map<number, boolean> = new Map();

  Object = Object; // Make Object available in the template

  constructor(
    private userManagementService: UserManagementService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.resetUIState();

    this.userManagementService.getAllUsersAndRolesAndPermissions().subscribe({
      next: (data: { users: User[], roles: Role[], permissions: Permission[] }) => {
        this.users = data.users;
        this.roles = data.roles;
        console.log(this.users);
        this.permissions = data.permissions;
        this.isLoading = false;
        console.log('loadInitialData: Data loaded:', data);

        if (this.selectedUserId !== null) { // Check if there was a previously selected user
          const userStillExists = this.users.some(u => u.UserID === this.selectedUserId);
          if (!userStillExists) { // If that user is no longer in the fetched list
            // this.errorMessage = 'Previously selected user is no longer available.';
            // this.selectedUserId = null; // Clear the invalid selection
          } else {
            // If user still exists, re-trigger onUserSelect to update dependent UI
            this.onUserSelect(); 
          }
        }
      },
      error: (err: any) => {
        console.error('Error loading initial data:', err);
        this.errorMessage = 'Failed to load initial data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onUserSelect(): void {
    this.resetUIState();
    this.errorMessage = '';
    this.successMessage = '';

    if (this.selectedUserId !== null) {
      // The value from ngModel can be a string, so ensure it's a number
      const numericSelectedUserId = Number(this.selectedUserId);
      const user = this.users.find(u => u.UserID === numericSelectedUserId);

      if (user) {
        this.selectedRoleId = user.RoleID ?? null;
        this.selectedRoleIdForPermission = user.RoleID ?? null;

        if (this.selectedRoleIdForPermission !== null) {
          this.loadPermissionsForSelectedRole(this.selectedRoleIdForPermission);
        } else {
          this.initialRolePermissions = [];
          this.rolePermissions = new Map();
          this.errorMessage = 'Selected user has no role assigned. Cannot manage permissions.';
        }
      } else {
        this.errorMessage = 'Selected user data not found in the current list. Please try refreshing or reselecting.';
        this.selectedUserId = null; // Clear invalid selection
      }
    }
  }

  openRoleChange(): void { // Takes no arguments
    if (this.selectedUserId === null) {
      this.errorMessage = 'Please select a user first to change their role.';
      return;
    }

    // Ensure comparison is number to number
    const user = this.users.find(u => u.UserID === Number(this.selectedUserId));
    if (user) {
      this.newSelectedRoleId = user.RoleID ?? null;
      this.showRoleChangeSection = true;
      this.showPermissionChangeSection = false;
      this.errorMessage = '';
      this.successMessage = '';
    } else {
      this.errorMessage = 'Selected user could not be found. Please refresh and try again.';
      this.showRoleChangeSection = false;
    }
  }

  openPermissionChange(): void {
    if (this.selectedUserId === null) {
      this.errorMessage = 'Please select a user first to manage permissions.';
      return;
    }

    // Ensure comparison is number to number
    const user = this.users.find(u => u.UserID === Number(this.selectedUserId));
    if (!user) {
      this.errorMessage = 'Selected user data not found. Please refresh and try again.';
      return;
    }

    this.selectedRoleIdForPermission = user.RoleID ?? null;

    if (this.selectedRoleIdForPermission === null) {
      this.errorMessage = 'Selected user has no role assigned. Cannot manage permissions.';
      return;
    }

    this.showPermissionChangeSection = true;
    this.showRoleChangeSection = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.loadPermissionsForSelectedRole(this.selectedRoleIdForPermission);
  }

  confirmRoleChange(): void {
    if (this.selectedUserId === null || this.newSelectedRoleId === null) {
      this.errorMessage = 'Please select a user and a new role.';
      return;
    }
    this.displayRoleConfirmDialog = true;
  }

  executeRoleChange(): void {
    this.displayRoleConfirmDialog = false;
    if (this.selectedUserId === null || this.newSelectedRoleId === null) return;

    this.isLoading = true;
    this.userManagementService.assignRoleToUser(this.selectedUserId, this.newSelectedRoleId).subscribe({
      next: (response: any) => {
        this.successMessage = response.message || 'Role assigned successfully!';
        this.isLoading = false;
        
        // Reload all data to ensure consistency
        this.loadInitialData();
      },
      error: (err: any) => {
        console.error('Error assigning role:', err);
        this.errorMessage = err.error?.message || 'Failed to assign role.';
        this.isLoading = false;
      }
    });
  }

  confirmPermissionChange(): void {
    if (this.selectedRoleIdForPermission === null || Object.keys(this.permissionsToUpdate).length === 0) {
        this.errorMessage = 'No changes to save.';
        return;
    }
    this.displayPermissionConfirmDialog = true;
  }

  executePermissionChange(): void {
    this.displayPermissionConfirmDialog = false;
    if (this.selectedRoleIdForPermission === null) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const permissionsToAssign: number[] = [];
    const permissionsToRemove: number[] = [];

    this.permissions.forEach(permission => {
      const initialPermissionState = this.initialRolePermissions.some(p => p.PermissionID === permission.PermissionID);
      const stagedPermissionState = this.permissionsToUpdate[permission.PermissionID];

      if (stagedPermissionState !== undefined) {
        if (stagedPermissionState && !initialPermissionState) {
          permissionsToAssign.push(permission.PermissionID);
        } else if (!stagedPermissionState && initialPermissionState) {
          permissionsToRemove.push(permission.PermissionID);
        }
      }
    });

    const assignObservables = permissionsToAssign.map(permissionId =>
      this.userManagementService.assignPermissionToRole(this.selectedRoleIdForPermission!, [permissionId])
    );

    const removeObservables = permissionsToRemove.map(permissionId =>
      this.userManagementService.removePermissionFromRole(this.selectedRoleIdForPermission!, [permissionId])
    );

    forkJoin([...assignObservables, ...removeObservables]).subscribe({
      next: () => {
        this.successMessage = 'Permissions updated successfully!';
        this.isLoading = false;
        this.permissionsToUpdate = {};
        if (this.selectedRoleIdForPermission !== null) {
          this.loadPermissionsForSelectedRole(this.selectedRoleIdForPermission);
        }
      },
      error: (err: any) => {
        console.error('Error updating permissions:', err);
        this.errorMessage = err.error?.message || 'Failed to update permissions.';
        this.isLoading = false;
      }
    });
  }

  loadPermissionsForSelectedRole(roleId: number): void {
    this.loadingPermissions = true;
    this.errorMessage = '';
    this.userManagementService.getPermissionsForRole(roleId).subscribe({
      next: (permissions: Permission[]) => {
        this.initialRolePermissions = permissions;
        this.rolePermissions = new Map(permissions.map(p => [p.PermissionID, true]));
        this.permissionsToUpdate = {};
        this.loadingPermissions = false;
      },
      error: (err: any) => {
        console.error('Error loading permissions for role:', roleId, err);
        this.errorMessage = 'Failed to load permissions for the selected role.';
        this.initialRolePermissions = [];
        this.rolePermissions = new Map();
        this.loadingPermissions = false;
      }
    });
  }
  
  togglePermission(permissionId: number): void {
    const initialPermissionState = this.initialRolePermissions.some(p => p.PermissionID === permissionId);
    const currentStagedState = this.permissionsToUpdate[permissionId] !== undefined
      ? this.permissionsToUpdate[permissionId]
      : initialPermissionState;

    const newStagedState = !currentStagedState;

    if (newStagedState !== initialPermissionState) {
      this.permissionsToUpdate[permissionId] = newStagedState;
    } else {
      delete this.permissionsToUpdate[permissionId];
    }
  }

  isPermissionStaged(permissionId: number): boolean {
    if (this.permissionsToUpdate[permissionId] !== undefined) {
      return this.permissionsToUpdate[permissionId];
    }
    return this.initialRolePermissions.some(p => p.PermissionID === permissionId);
  }

  resetUIState(): void {
    this.showRoleChangeSection = false;
    this.showPermissionChangeSection = false;
    this.newSelectedRoleId = null;
    this.permissionsToUpdate = {};
    this.displayRoleConfirmDialog = false;
    this.displayPermissionConfirmDialog = false;
    this.initialRolePermissions = [];
    this.rolePermissions = new Map();
    this.loadingPermissions = false;
  }

  getRoleName(roleId: number | null): string {
    const role = this.roles.find(r => r.RoleID === roleId);
    return role ? role.RoleName : 'N/A';
  }

  getSelectedUserName(): string {
    if (!this.selectedUserId) return 'No user selected';
    const user = this.users.find(u => u.UserID === Number(this.selectedUserId));
    return user ? (user.Username || user.Email) : 'No user selected';
  }

  getNewRoleName(): string {
    const role = this.roles.find(r => r.RoleID === this.newSelectedRoleId);
    return role ? role.RoleName : 'N/A';
  }

  cancelRoleChangeConfirmation(): void {
    this.displayRoleConfirmDialog = false;
  }

  cancelPermissionSaveConfirmation(): void {
    this.displayPermissionConfirmDialog = false;
  }

  cancelRoleChange(): void {
    this.displayRoleConfirmDialog = false;
    this.newSelectedRoleId = null;
  }

  cancelPermissionChange(): void {
    this.displayPermissionConfirmDialog = false;
    this.permissionsToUpdate = {};
    if (this.selectedRoleIdForPermission !== null) {
      this.loadPermissionsForSelectedRole(this.selectedRoleIdForPermission);
    }
  }
}