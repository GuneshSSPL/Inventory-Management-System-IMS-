import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-request-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './access-request-form.component.html',
  styleUrls: ['./access-request-form.component.css']
})
export class AccessRequestFormComponent {
  requestedPages = {

    consume: false,
    reports: false,
    printBarcode: false,
    workspace: false
  };
  reason: string = '';

  constructor(private router: Router) {}

  isAnyPageRequested(): boolean {
    return Object.values(this.requestedPages).some(value => value);
  }

  submitRequest(): void {
    // Logic to handle the access request submission (e.g., send to backend)
    console.log('Access requested for:', this.requestedPages);
    console.log('Reason:', this.reason);
    alert('Your access request has been submitted. You will be notified once it is reviewed.');
    // Potentially navigate away or show a success message
    this.router.navigate(['/login']); // Or to a 'request submitted' confirmation page
  }
}