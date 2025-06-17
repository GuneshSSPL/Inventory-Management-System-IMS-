import { Component, OnInit } from '@angular/core'; // Added OnInit
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-barcode-print',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './printbarcode.component.html',
  styleUrls: ['./printbarcode.component.css']
})
export class PrintBarcodeComponent implements OnInit { // Implemented OnInit
  // Changed property names to match backend expectations
  MaterialCode: string = '';
  Description: string = '';
  CategoryID: number | null = null;
  CurrentQuantity: number | null = null;
  UOM: string = '';
  UnitPrice: number | null = null;
  SupplierID: number | null = null; // Added SupplierID
  ReorderLevel: number | null = null; // Added ReorderLevel

  categories: any[] = []; // Added for categories dropdown
  suppliers: any[] = []; // Added for suppliers dropdown

  generatedBarcode: string | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { // Added ngOnInit
    this.fetchCategories();
    this.fetchSuppliers();
  }

  fetchCategories() { // Added method to fetch categories
    this.http.get<any[]>('http://localhost:5000/api/categories').subscribe({ // Expect an array directly
      next: (response) => {
        if (Array.isArray(response)) { // Check if response itself is an array
          this.categories = response;
        } else if (response && Array.isArray((response as any).data)) { // Fallback for nested data
          this.categories = (response as any).data;
        } else {
          this.showError('Failed to load categories: Unexpected response format');
          console.warn('Categories response format unexpected:', response);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.showError('Error fetching categories: ' + (error.error?.message || error.message));
        console.error('API Error fetching categories:', error);
      }
    });
  }

  fetchSuppliers() { // Added method to fetch suppliers
    this.http.get<any[]>('http://localhost:5000/api/suppliers').subscribe({ // Expect an array directly
      next: (response) => {
        if (Array.isArray(response)) { // Check if response itself is an array
          this.suppliers = response;
        } else if (response && Array.isArray((response as any).data)) { // Fallback for nested data
          this.suppliers = (response as any).data;
        } else {
          this.showError('Failed to load suppliers: Unexpected response format');
          console.warn('Suppliers response format unexpected:', response);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.showError('Error fetching suppliers: ' + (error.error?.message || error.message));
        console.error('API Error fetching suppliers:', error);
      }
    });
  }

  generateBarcode() {
    this.resetMessages();
    this.isLoading = true;

    // Validate required fields (assuming SupplierID and ReorderLevel are optional for now)
    // If they become mandatory, add them to this check: e.g., !this.SupplierID || this.ReorderLevel === null
    if (!this.MaterialCode || !this.Description || !this.CategoryID || !this.CurrentQuantity) {
      this.showError('All required fields must be filled');
      this.isLoading = false;
      return;
    }

    const materialData = {
      MaterialCode: this.MaterialCode,
      Description: this.Description,
      CategoryID: this.CategoryID,
      CurrentQuantity: this.CurrentQuantity,
      UOM: this.UOM,
      UnitPrice: this.UnitPrice,
      SupplierID: this.SupplierID, // Added SupplierID
      ReorderLevel: this.ReorderLevel // Added ReorderLevel
    };

    this.http.post<any>('http://localhost:5000/api/materials', materialData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.data?.BarcodePath) {
            this.generatedBarcode = `http://localhost:5000${response.data.BarcodePath}`;
            this.showSuccess('Material created successfully');
            this.resetForm();
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          const message = error.error?.message || 'Failed to create material';
          this.showError(message);
          console.error('API Error:', error);
        }
      });
  }

  printBarcode() {
    if (this.generatedBarcode) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Barcode Print</title>
              <style>
                body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <img src="${this.generatedBarcode}" alt="Barcode">
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      } else {
        this.showError('Failed to open print window');
      }
    } else {
      this.showError('No barcode available to print');
    }
  }

  private resetForm() {
    this.MaterialCode = '';
    this.Description = '';
    this.CategoryID = null;
    this.CurrentQuantity = null;
    this.UOM = '';
    this.UnitPrice = null;
    this.SupplierID = null; // Added SupplierID reset
    this.ReorderLevel = null; // Added ReorderLevel reset
  }

  private resetMessages() {
    this.errorMessage = null;
    this.successMessage = null;
  }

  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => this.resetMessages(), 5000);
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => this.resetMessages(), 5000);
  }
}
