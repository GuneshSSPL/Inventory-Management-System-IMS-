import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrintBarcodeComponent } from './MyComponent/printbarcode/printbarcode.component';
import { LoginComponent } from './MyComponent/login/login.component';

import { SignUpComponent } from './MyComponent/sign-up/sign-up.component';
import { MaterialTableComponent } from './MyComponent/material-table/material-table.component';
import { ReportsComponent } from './MyComponent/reports/reports.component'; // Import ReportsComponent
import { ConsumeComponent } from './MyComponent/consume/consume.component'; // Import ConsumeComponent
import { AuthCallbackComponent } from './auth-callback/auth-callback.component'; // Make sure this import exists

// import { UserRoleManagementComponent } from './MyComponent/user-role-management/user-role-management.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleMasterComponent } from './MyComponent/role-master/role-master.component'; // Import RoleMasterComponent
import { WorkspaceComponent } from './MyComponent/workspace/workspace.component'; // Make sure to import your WorkspaceComponent
import { SupplierListComponent } from './MyComponent/supplier-list/supplier-list.component'; // Add this import

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Changed from material-table to login
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignUpComponent },
  {
    path: 'material-table',
    component: MaterialTableComponent,
    canActivate: [AuthGuard],
    data: { permissions: ['view_material_table'], permissionOperator: 'OR' } // Changed permission to view_material_table
  },
  {
    path: 'reports',
    component: ReportsComponent,
    canActivate: [AuthGuard],
    data: { permissions: ['view_reports'], permissionOperator: 'OR' } // Add permissions for reports
  },
  {
    path: 'consume',
    component: ConsumeComponent,
    canActivate: [AuthGuard],
    data: { permissions: ['record_consumption'], permissionOperator: 'OR' } // Add permissions for consume
  },

  // {
  //   path: 'admin/user-roles',
  //   component: UserRoleManagementComponent,
  //   canActivate: [AuthGuard],
  //   data: { permissions: ['role-manage', 'assign_user_to_role'], permissionOperator: 'OR' }
  // },
  {
    path: 'admin/role-master',
    component: RoleMasterComponent, // Make sure RoleMasterComponent is imported in this file
    canActivate: [AuthGuard],
    data: { permissions: ['manage_rolemaster', 'admin_access'], permissionOperator: 'OR' }
  },
  {
    path: 'suppliers',
    component: SupplierListComponent,
    canActivate: [AuthGuard],
    data: { permissions: ['view_suppliers'], permissionOperator: 'OR' }
  },
  {
    path: 'printbarcode',
    component: PrintBarcodeComponent,
    canActivate: [AuthGuard],
    data: { permissions: ['print_barcode'], permissionOperator: 'OR' } // Add this line
  },
  // Add canActivate: [authGuard] to any other routes that need protection
  {
    path: 'workspace',
    component: WorkspaceComponent,
    canActivate: [AuthGuard],
    data: { permissions: ['view_workspace'], permissionOperator: 'OR' } // Ensure this is present and correct
  },
  {
    path: '**',
    redirectTo: 'login' // Change this line to redirect to login
  },
  { path: 'auth-callback', component: AuthCallbackComponent }, // <-- Ensure this line is present
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// Remove the following duplicate class declarations:
// import { HeaderComponent } from './MyComponent/header/header.component';
// import { AuthService } from './services/auth.service';

// export class HeaderComponent {
//   onLogout() {
//     this.authService.logout();
//   }
// }

// export class AuthService {
//   logout() {
//     this.router.navigate(['/login'])
//   }
// }