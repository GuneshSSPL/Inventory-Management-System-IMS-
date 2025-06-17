import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private apiUrl = 'http://localhost:3000/api/workspace'; // Adjust the API URL as needed

  constructor(private http: HttpClient) { }

  createWorkspace(workspace: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, workspace);
  }

  getAllWorkspaces(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getWorkspaceById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateWorkspace(id: number, workspace: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, workspace);
  }

  deleteWorkspace(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
