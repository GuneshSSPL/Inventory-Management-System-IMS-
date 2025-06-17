import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';


interface Material {
  MaterialCode: string;
  IESCode: string;
  Description: string;
  CategoryID: number;
  UOM: string;
  UnitPrice: number;
  CurrentQuantity: number;
  ReorderLevel: number;
  isLowStock?: boolean; // Optional property for frontend display
}

@Injectable({
  providedIn: 'root'
})
export class MaterialTableServicesService {
  dataSource = new MatTableDataSource<any>([]);
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  fetchMaterials(): void {
    this.http.get<any>('http://localhost:5000/api/materials').subscribe({
      next: (response) => {
        if (response && response.success && Array.isArray(response.data)) {
          this.dataSource.data = response.data.map((material: Material) => ({
            ...material,
            isLowStock: material.CurrentQuantity <= material.ReorderLevel
          }));
        } else {
          console.error('API Error: Invalid data structure received', response);
          this.error = 'Failed to load materials due to unexpected data format.';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.error = 'Failed to load materials. Please try again later.';
        this.loading = false;
      }
    });
  }
}
