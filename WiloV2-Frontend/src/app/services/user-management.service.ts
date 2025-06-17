import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Ensure HttpClient is imported
import { Observable, throwError, forkJoin } from 'rxjs'; // Ensure Observable and forkJoin are imported
import { environment } from '../../environments/environment'; // Import environment
import { catchError } from 'rxjs/operators'; // Ensure catchError is imported

// Ensure Role, User, and Permission interfaces are defined or imported here
export interface Role { 
  RoleID: number; 
  RoleName: string; 
  Description?: string; 
}
export interface User { 
  UserID: number; 
  Username: string; // Assuming a username property
  Email: string; // Assuming an email property
  RoleID: number; 
  RoleName?: string; // Optional: if you want to include role name directly
}
export interface Permission { // This might be defined in your component or a shared models file
  PermissionID: number;
  PermissionName: string;
  Description?: string;
}


@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = environment.apiUrl + '/api'; // Use environment.apiUrl

  constructor(private http: HttpClient) { } // Ensure HttpClient is injected

  getUsers(): Observable<User[]> {
    // Assuming your backend endpoint for users is /api/users or /api/user-management/getUsers
    // And it returns an array of User objects
    return this.http.get<User[]>(`${this.apiUrl}/users`); // or `${this.apiUrl}/user-management/getUsers`
  }

  getRoles(): Observable<Role[]> {
    // Assuming your backend endpoint for roles is /api/roles or /api/user-management/roles
    return this.http.get<Role[]>(`${this.apiUrl}/roles`); // or `${this.apiUrl}/user-management/roles`
  }

  assignRoleToUser(userId: number, roleId: number): Observable<any> {
    // Assuming your backend endpoint is PUT /api/users/:userId/role 
    // or POST /api/user-management/assign-role { userId, roleId }
    // Adjust the endpoint and payload as per your backend
    return this.http.put(`${this.apiUrl}/users/${userId}/role`, { roleId });
    // Example for a POST request if your backend expects that:
    // return this.http.post(`${this.apiUrl}/user-management/assign-role`, { userId, roleId });
  }

  // If you support assigning multiple roles, you might have a method like this:
  // assignRolesToUser(userId: number, roleIds: number[]): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/users/${userId}/roles`, { roleIds }); 
  // }

  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/permissions`)
      .pipe(catchError(this.handleError));
  }

  getRolePermissions(roleId: number): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/roles/${roleId}/permissions`)
      .pipe(catchError(this.handleError));
  }

  assignPermissionToRole(roleId: number, permissionIds: number[]): Observable<any> {
    // Assuming permissionIds array will always have one element due to the change in role-master.component.ts
    const permissionId = permissionIds[0];
    return this.http.post(`${this.apiUrl}/roles/${roleId}/permissions/${permissionId}`, {})
      .pipe(catchError(this.handleError));
  }

  removePermissionFromRole(roleId: number, permissionIds: number[]): Observable<any> {
    // Assuming permissionIds array will always have one element due to the change in role-master.component.ts
    const permissionId = permissionIds[0];
    return this.http.delete(`${this.apiUrl}/roles/${roleId}/permissions/${permissionId}`)
      .pipe(catchError(this.handleError));
  }

  getUsersForRoleMaster(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/rolemaster/users`)
      .pipe(catchError(this.handleError));
  }

  getRolesForRoleMaster(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/rolemaster/roles`)
      .pipe(catchError(this.handleError));
  }

  assignRoleViaRoleMaster(userId: number, roleId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/rolemaster/assign-role`, { userId, roleId })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => new Error(error.error?.message || error.message || 'Server error'));
  }

  getAllUsersAndRolesAndPermissions(): Observable<{ users: User[], roles: Role[], permissions: Permission[] }> {
    return forkJoin({
      users: this.getUsers(),
      roles: this.getRoles(),
      permissions: this.getAllPermissions()
    }).pipe(catchError(this.handleError));
  }

  getPermissionsForRole(roleId: number): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/roles/${roleId}/permissions`)
      .pipe(catchError(this.handleError));
  }
}