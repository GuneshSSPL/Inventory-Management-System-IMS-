import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Adjusted path assuming services is at app/services
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpClientModule } from '@angular/common/http'; // HttpClientModule imported here
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Supplier {
  SupplierID: number;
  SupplierName: string;
  Email?: string;
  PhoneNumber?: string;
  Address?: string;
  CreatedAt?: string; // Or Date
  UpdatedAt?: string; // Or Date
}

@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule] // HttpClientModule here for standalone
})
export class SupplierListComponent implements OnInit {
  suppliers: Supplier[] = []; // Typed array
  hasViewSuppliersPermission: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  
  editingSupplier: Supplier | null = null; // Typed property

  // --- Properties for Add Supplier Form ---
  showAddSupplierForm: boolean = false; // Added this property
  newSupplier: Supplier = { // Added and initialized this property
    SupplierID: 0, // Will be set by backend, or handle as per your API for new entries
    SupplierName: '',
    Email: '',
    PhoneNumber: '',
    Address: ''
  };
  // --- End of Properties for Add Supplier Form ---

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.checkPermissions(); // It's good practice to encapsulate permission checking
    if (this.hasViewSuppliersPermission) {
      this.fetchSuppliers();
    } else {
      this.errorMessage = 'You do not have permission to view suppliers.';
      this.isLoading = false; // Ensure loading is false if permission denied upfront
    }
  }

  checkPermissions(): void {
    // Assuming 'view_suppliers' is the correct permission string
    this.hasViewSuppliersPermission = this.authService.hasPermission('view_suppliers'); 
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', 'Bearer ' + token);
    }
    return headers;
  }

  fetchSuppliers(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.http.get<Supplier[]>('http://localhost:5000/api/suppliers', { headers: this.getAuthHeaders() })
      .subscribe({
        next: (data) => {
          this.suppliers = data;
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching suppliers:', error);
          this.errorMessage = `Failed to load suppliers. Status: ${error.status} - ${error.statusText}.`;
          if (error.error && typeof error.error === 'string') {
            this.errorMessage += ` Server message: ${error.error}`;
          } else if (error.error && error.error.message) {
            this.errorMessage += ` Server message: ${error.error.message}`;
          }
          this.isLoading = false;
        }
      });
  }

  startEdit(supplier: Supplier): void {
    this.editingSupplier = { ...supplier }; 
    this.showAddSupplierForm = false; // Hide add form if editing
  }

  saveEdit(): void {
    if (!this.editingSupplier || this.editingSupplier.SupplierID === undefined) return;

    this.http.put<Supplier>(`http://localhost:5000/api/suppliers/${this.editingSupplier.SupplierID}`, this.editingSupplier, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (updatedSupplier) => {
          const index = this.suppliers.findIndex(s => s.SupplierID === updatedSupplier.SupplierID);
          if (index !== -1) {
            this.suppliers[index] = updatedSupplier;
          }
          this.cancelEdit(); // Clear editing state
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error updating supplier:', error);
          this.errorMessage = `Failed to update supplier. Status: ${error.status} - ${error.statusText}.`;
        }
      });
  }

  cancelEdit(): void {
    this.editingSupplier = null;
  }

  // --- Method for Adding a New Supplier ---
  addSupplier(): void {
    if (!this.newSupplier.SupplierName) { // Basic validation
        this.errorMessage = "Supplier Name is required.";
        return;
    }
    this.isLoading = true; // Optional: indicate loading state for add operation
    this.errorMessage = null;

    // Create a type for the payload where SupplierID might be absent or is optional
    type SupplierCreationPayload = Omit<Supplier, 'SupplierID'> & { SupplierID?: number };

    const payload: SupplierCreationPayload = { ...this.newSupplier };

    // If SupplierID is 0 (or whatever indicates a new item for your backend),
    // and your backend auto-generates IDs, then remove it from the payload.
    if (payload.SupplierID === 0) { 
        delete payload.SupplierID; 
    }

    this.http.post<Supplier>('http://localhost:5000/api/suppliers', payload, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (addedSupplier) => {
          this.suppliers.push(addedSupplier);
          this.showAddSupplierForm = false; // Hide form after successful add
          this.newSupplier = { SupplierID: 0, SupplierName: '', Email: '', PhoneNumber: '', Address: '' }; // Reset form
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Failed to add supplier. ' + (err.error?.message || err.message);
          console.error(err);
          this.isLoading = false;
        }
      });
  }
  // --- End of Method for Adding a New Supplier ---

  deleteSupplier(supplierId: number): void {
    if (confirm('Are you sure you want to delete this supplier?')) {
      this.http.delete(`http://localhost:5000/api/suppliers/${supplierId}`, { headers: this.getAuthHeaders() })
        .subscribe({
          next: () => {
            this.suppliers = this.suppliers.filter(s => s.SupplierID !== supplierId);
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error deleting supplier:', error);
            this.errorMessage = `Failed to delete supplier. Status: ${error.status} - ${error.statusText}.`;
          }
        });
    }
  }

  // Helper to toggle add form visibility and reset newSupplier if opening
  toggleAddSupplierForm(): void {
    this.showAddSupplierForm = !this.showAddSupplierForm;
    if (this.showAddSupplierForm) {
      this.newSupplier = { SupplierID: 0, SupplierName: '', Email: '', PhoneNumber: '', Address: '' }; // Reset form when opening
      this.cancelEdit(); // Cancel any ongoing edit
    }
  }
}