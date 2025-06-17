import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Example methods
  getMaterials() {
    return this.http.get(`${this.apiUrl}/materials`);
  }

  generateReport(params: any) {
    return this.http.get(`${this.apiUrl}/reports`, { params, responseType: 'blob' });
  }
}