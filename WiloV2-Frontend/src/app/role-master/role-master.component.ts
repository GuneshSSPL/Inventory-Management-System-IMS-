// ... existing code ...

loadPermissionsForSelectedRole(roleId: number): void {
  if (roleId === null || roleId === undefined) {
    this.permissions = []; // Clear permissions if no role is selected
    this.pagePermissionMap = {}; // Clear the map as well
    this.loadingPermissions = false;
    return;
  }

  this.loadingPermissions = true;
  // Assuming getRolePermissions fetches permissions for a specific role
  this.userManagementService.getRolePermissions(roleId).subscribe({
    next: (rolePermissions: any[]) => { // Adjust type if you have a specific Permission interface
      // Assuming the backend returns an array of permission objects
      this.rolePermissions = rolePermissions; // Store the permissions assigned to the role

      // Now, fetch ALL available permissions to display checkboxes for all
      this.userManagementService.getAllPermissions().subscribe({
        next: (allPermissions: any[]) => { // Adjust type if you have a specific Permission interface
          this.permissions = allPermissions; // Store all available permissions

          // Populate the pagePermissionMap based on the rolePermissions
          this.pagePermissionMap = {};
          if (this.permissions && this.rolePermissions) {
            this.permissions.forEach(permission => {
              // Check if this permission is present in the rolePermissions array
              const isAssigned = this.rolePermissions.some(rp => rp.PermissionID === permission.PermissionID);
              this.pagePermissionMap[permission.PermissionID] = isAssigned;
            });
          }

          this.loadingPermissions = false;
          // You might want to clear any "no roles permission found" messages here
        },
        error: (error) => {
          console.error('Error fetching all permissions:', error);
          this.loadingPermissions = false;
          this.permissions = []; // Clear permissions on error
          this.pagePermissionMap = {};
          // Display an error message to the user if needed
        }
      });
    },
    error: (error) => {
      console.error('Error fetching role permissions:', error);
      this.loadingPermissions = false;
      this.rolePermissions = []; // Clear role permissions on error
      this.permissions = []; // Also clear all permissions as we can't fully populate the UI
      this.pagePermissionMap = {};
      // Display an error message to the user, potentially "no roles permission found"
    }
  });
}

// ... existing code ...