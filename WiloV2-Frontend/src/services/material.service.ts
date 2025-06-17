// Example service: material.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {

  private baseUrl = '/api/materials';  // Notice that we don't specify localhost:5000

  constructor(private http: HttpClient) {}

  getMaterials() {
    return this.http.get(`${this.baseUrl}`);
  }
  
  
}
