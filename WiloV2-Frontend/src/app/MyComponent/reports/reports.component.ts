import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  providers: [DatePipe]
})
export class ReportsComponent {
  // Update the ViewChild reference to match your actual table element
  @ViewChild('reportTable', { static: false }) reportTable!: ElementRef;

  isLoading = false;
  errorMessage = '';
  reportData: any[] = [];
  filters = {
    from: '',
    to: '',
    type: ''
  };

  constructor(private http: HttpClient, private datePipe: DatePipe) {}

  fetchReport() {
    this.isLoading = true;
    this.errorMessage = '';

    let params = new HttpParams();
    Object.entries(this.filters).forEach(([key, value]) => {
      if (value) params = params.append(key, value);
    });

    this.http.get<any[]>('/api/reports/custom', { params })
      .subscribe({
        next: (data) => {
          this.reportData = data || [];
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to fetch report';
          this.isLoading = false;
        }
      });
  }

  clearFilters() {
    this.filters = {
      from: '',
      to: '',
      type: ''
    };
    // Only clear filters, don't fetch automatically
  }

  exportPDF() {
    // Check if there is data to export
    if (!this.reportData || this.reportData.length === 0) {
      alert('No data available to export to PDF');
      return;
    }

    console.log('Table element:', this.reportTable);

    const tableElement = this.reportTable?.nativeElement || document.querySelector('table');

    if (!tableElement) {
      console.error('Table element not found in the DOM');
      alert('Failed to generate PDF: Table not found or empty');
      return;
    }

    const container = document.createElement('div');
    container.style.width = '1500px'; // Increased width for more data
    container.style.padding = '20px';
    container.style.backgroundColor = 'white';
    container.style.position = 'absolute';
    container.style.left = '-9999px'; // Position off-screen
    container.style.top = '0';

    // Add logo at the top left
    const logoContainer = document.createElement('div');
    logoContainer.style.position = 'relative';
    logoContainer.style.width = '100%';
    logoContainer.style.marginBottom = '15px';
    
    const logo = document.createElement('img');
    logo.src = '../assets/images/pagani-logo-png_seeklogo-438353.png';
    logo.style.width = '150px';
    logo.style.position = 'absolute';
    logo.style.left = '0';
    logo.style.top = '0';
    
    logoContainer.appendChild(logo);
    container.appendChild(logoContainer);

    const spacer = document.createElement('div');
    spacer.style.height = '80px'; 
    container.appendChild(spacer);

    const title = document.createElement('h2');
    title.textContent = 'Inventory Report';
    title.style.textAlign = 'center';
    title.style.color = '#872341';
    title.style.marginBottom = '15px';
    container.appendChild(title);

    const dateInfo = document.createElement('p');
    dateInfo.textContent = `Generated: ${this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss')}`;
    dateInfo.style.marginBottom = '15px';
    container.appendChild(dateInfo);

    const tableClone = tableElement.cloneNode(true) as HTMLElement;
    tableClone.style.width = '100%';
    tableClone.style.borderCollapse = 'collapse';
    tableClone.style.borderSpacing = '0';
    tableClone.style.fontFamily = 'Arial, sans-serif';

    // Style table headers and cells
    const headers = tableClone.querySelectorAll('th');
    headers.forEach((header: any) => {
      header.style.backgroundColor = '#872341';
      header.style.color = 'white';
      header.style.padding = '10px';
      header.style.textAlign = 'left';
      header.style.fontWeight = 'bold';
      header.style.border = '1px solid #ddd';
    });

    const cells = tableClone.querySelectorAll('td');
    cells.forEach((cell: any, index: number) => {
      cell.style.padding = '8px';
      cell.style.border = '1px solid #ddd';
      cell.style.textAlign = 'left';

      // Alternate row colors
      const rowIndex = Math.floor(index / headers.length);
      if (rowIndex % 2 === 0) {
        cell.style.backgroundColor = '#f9f9f9';
      } else {
        cell.style.backgroundColor = 'white';
      }
    });

    container.appendChild(tableClone);

    // Temporarily add to document for rendering
    document.body.appendChild(container);

    // Using html2canvas with better settings
    html2canvas(container, {
      scale: 1.5, // Adjusted scale for better quality without making file too large
      useCORS: true,
      allowTaint: true,
      logging: false, // Disable logging for production
      windowWidth: container.scrollWidth,
      windowHeight: container.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      width: container.scrollWidth,
      height: container.scrollHeight,
      onclone: (clonedDoc) => {
        // Make any adjustments to the cloned document if needed
        const clonedContainer = clonedDoc.body.lastChild as HTMLElement;
        clonedContainer.style.visibility = 'visible';
        clonedContainer.style.overflow = 'visible';
        clonedContainer.style.position = 'absolute';
        clonedContainer.style.left = '0';
        clonedContainer.style.top = '0';
      }
    }).then(canvas => {
      // Remove container after canvas is generated
      document.body.removeChild(container);

      const imgData = canvas.toDataURL('image/png');

      // Create PDF with appropriate size
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a3' // Larger format for more data
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // If content is too tall for one page, we might need to split it
      if (imgHeight > pageHeight - 20) {
        // Add image with compression to fit on page
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, pageHeight - 20, '', 'FAST');
      } else {
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      }

      const timestamp = this.datePipe.transform(new Date(), 'yyyyMMdd_HHmmss');
      pdf.save(`inventory_report_${timestamp}.pdf`);

    }).catch(err => {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF: ' + err.message);
    });
  }
}
