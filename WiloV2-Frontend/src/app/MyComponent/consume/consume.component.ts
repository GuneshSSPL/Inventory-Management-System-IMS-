import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service'; // Import AuthService

@Component({
  selector: 'app-consume',
  templateUrl: './consume.component.html',
  styleUrls: ['./consume.component.css'],
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule 
  ]
})
export class ConsumeComponent {
  materials: any[] = []; 
  selectedMaterialCode: string = ''; 
  materialDetails: any = {}; 
  userId: number | null = null; // Add userId property

  constructor(private http: HttpClient, private authService: AuthService) { // Inject AuthService
    // Subscribe to currentUserData to get userId
    this.authService.currentUser.subscribe(user => {
      this.userId = user ? user.userId : null;
    });
  }

  ngOnInit() {
    this.http.get<any>('http://localhost:5000/api/consume/')
      .subscribe(response => {
        if (response.success) {
          this.materials = response.data;
        }
      });
  }

  onMaterialSelect() {
    if (!this.selectedMaterialCode) return;

    const selectedMaterial = this.materials.find(
      mat => mat.MaterialCode === this.selectedMaterialCode
    );

    if (selectedMaterial) {
      this.materialDetails = {
        description: selectedMaterial.Description ,
        uom: selectedMaterial.UOM ,
        availableQty: selectedMaterial.CurrentQuantity || 0
      };
    }
    this.fetchMaterialDetails();

  }

  // Handle manual code entry
  fetchMaterialDetails() {
    const code = this.selectedMaterialCode.trim();
    if (!code) return;

    this.http.get<any>(`http://localhost:5000/api/consume/${code}`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.materialDetails = {
              description: response.data.Description || '',
              uom: response.data.UOM || '',
              availableQty: response.data.CurrentQuantity || 0
            };
          } else {
            alert('Material not found');
            this.clearSelection();
          }
        },
        error: (err) => {
          console.error(err);
          alert('Error fetching material details');
          this.clearSelection();
        }
      });
  }
  private clearSelection() {
    this.selectedMaterialCode = '';
    this.materialDetails = {};
  }
  get remainingQty() {
    return (this.materialDetails.availableQty || 0) - (this.materialDetails.quantity || 0);
  }

  // Consume material logic
  consumeMaterial() { // Remove parameters as they will be accessed from component properties
    if (!this.materialDetails.quantity || !this.selectedMaterialCode) {
      alert('Please select a material and enter a quantity to consume.');
      return;
    }

    const payload = {
      materialCode: this.selectedMaterialCode,
      consumedQuantity: this.materialDetails.quantity, 
      transactionType: 'Consumption',
      transactionBy: this.userId // Use the userId from AuthService
    };

    this.http.post('http://localhost:5000/api/consume', payload).subscribe(
      (response) => {
        console.log('Material consumed successfully:', response);
        alert('Material consumed successfully!');
        // Optionally, refresh material list or update UI
      },
      (error) => {
        console.error('Error consuming material:', error);
        alert('Error consuming material: ' + error.error.message);
      }
    );
  }

  // Reset form fields
  resetForm() {
    this.selectedMaterialCode = '';
    this.materialDetails = {};
  }
}