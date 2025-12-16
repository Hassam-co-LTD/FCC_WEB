import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../../../../../../core/services/user-service/shared-form-service/shared-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
  providers: [DatePipe]
})
export class preview implements OnInit {
  form!: FormGroup;
  lastUpdated: Date = new Date();

  constructor(
    private dataService: SharedService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.loadFormData();
  }

  private loadFormData() {
    const savedData = this.dataService.getFormData();

    if (!savedData || !savedData.form) {
      this.snackBar.open('No form data found. Please complete the form first.', 'Close', { 
        duration: 3000 
      });
      this.router.navigate(['/undertaking-issuance/request']);
      return;
    }

    this.form = savedData.form;
    this.lastUpdated = new Date();
    
    console.log('Form loaded for preview:', this.form.value);
  }

  get generalDetails(): FormGroup {
  return this.form.get('generalDetails') as FormGroup;
}

get applicantBeneficiary(): FormGroup {
  return this.form.get('applicantBeneficiary') as FormGroup;
}

get bankForm(): FormGroup {
  return this.form.get('bankForm') as FormGroup;
}

get undertakingDetails(): FormGroup {
  return this.form.get('undertakingDetails') as FormGroup;
}

get instructions(): FormGroup {
  return this.form.get('instructions') as FormGroup;
}

  // ================== FORM STATUS ==================

  getFormCompletion(): number {
    if (!this.form) return 0;
    
    const sections = [
      'generalDetails',
      'applicantBeneficiary',
      'bankForm',
      'undertakingDetails',
      'instructions'
    ];
    
    let totalFields = 0;
    let filledFields = 0;
    
    sections.forEach(section => {
      const sectionGroup = this.form.get(section) as FormGroup;
      if (sectionGroup) {
        Object.keys(sectionGroup.controls).forEach(key => {
          totalFields++;
          const value = sectionGroup.get(key)?.value;
          if (value !== null && value !== undefined && value !== '') {
            filledFields++;
          }
        });
      }
    });
    
    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  }

  getFormStatus(): string {
    const completion = this.getFormCompletion();
    if (completion >= 100) return 'Complete';
    if (completion >= 80) return 'Ready to Submit';
    if (completion >= 50) return 'Partially Complete';
    return 'In Progress';
  }

  isFormComplete(): boolean {
    return this.getFormCompletion() >= 80;
  }

  // ================== FORMATTING HELPERS ==================

  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return 'Not specified';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'None';
    }
    return String(value);
  }

  formatDate(dateValue: any): string {
    if (!dateValue) return 'Not specified';
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return this.datePipe.transform(date, 'MMMM d, yyyy') || 'Invalid date';
    } catch {
      return String(dateValue);
    }
  }

  formatCurrency(amount: any, currency: string = ''): string {
    if (amount === null || amount === undefined || amount === '') return 'Not specified';
    
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return String(amount);
    
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
    
    return currency ? `${formatted} ${currency}` : formatted;
  }

  formatBankTab(tab: string): string {
    const tabMap: {[key: string]: string} = {
      'issuing': 'Issuing Bank',
      'advising': 'Advising Bank',
      'adviseThrough': 'Advise Through Bank'
    };
    return tabMap[tab] || tab || 'Not specified';
  }

  formatDeliveryType(type: string): string {
    const options = [
      { value: 'original', label: 'Delivery of Original Undertaking' },
      { value: 'copy', label: 'Copy' }
    ];
    return options.find(opt => opt.value === type)?.label || type || 'Not specified';
  }

  formatDeliveryMode(mode: string): string {
    const options = [
      { value: 'courier', label: 'Courier' },
      { value: 'pickup', label: 'Pick Up' },
      { value: 'email', label: 'Email' },
      { value: 'swift', label: 'SWIFT' }
    ];
    return options.find(opt => opt.value === mode)?.label || mode || 'Not specified';
  }

  formatDeliveryTo(to: string): string {
    const options = [
      { value: 'ourselves', label: 'Ourselves' },
      { value: 'beneficiary', label: 'Beneficiary' },
      { value: 'representative', label: 'Representative' },
      { value: 'agent', label: 'Agent' },
      { value: 'other', label: 'Other' }
    ];
    return options.find(opt => opt.value === to)?.label || to || 'Not specified';
  }

  // ================== FILE HANDLING ==================

  getAttachments(): any[] {
    if (!this.form) return [];
    
    // Try different attachment paths
    const paths = ['attachments.files', 'attachments.attachments', 'files'];
    
    for (const path of paths) {
      const control = this.form.get(path);
      if (control instanceof FormArray) {
        return control.value || [];
      }
    }
    
    return [];
  }

  getAttachmentsCount(): number {
    return this.getAttachments().length;
  }

  getFileIcon(file: any): string {
    if (!file) return 'insert_drive_file';
    
    const fileName = (file.name || file.fileName || '').toLowerCase();
    const fileType = (file.type || '').toLowerCase();
    
    if (fileName.includes('.pdf') || fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileName.includes('.jpg') || fileName.includes('.jpeg') || fileName.includes('.png') || 
        fileName.includes('.gif') || fileType.includes('image')) return 'image';
    if (fileName.includes('.doc') || fileName.includes('.docx') || fileType.includes('word')) return 'description';
    if (fileName.includes('.xls') || fileName.includes('.xlsx') || fileType.includes('excel')) return 'table_chart';
    if (fileName.includes('.txt') || fileType.includes('text')) return 'text_snippet';
    
    return 'insert_drive_file';
  }

  getFileType(file: any): string {
    if (!file) return 'Unknown';
    
    const fileName = (file.name || file.fileName || '').toLowerCase();
    const extension = fileName.split('.').pop();
    
    const types: {[key: string]: string} = {
      'pdf': 'PDF',
      'jpg': 'Image',
      'jpeg': 'Image',
      'png': 'Image',
      'gif': 'Image',
      'doc': 'Word',
      'docx': 'Word',
      'xls': 'Excel',
      'xlsx': 'Excel',
      'txt': 'Text',
      'rtf': 'Rich Text',
      'csv': 'CSV'
    };
    
    return extension ? (types[extension] || extension.toUpperCase()) : 'Unknown';
  }

  formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getTotalFileSize(): string {
    const attachments = this.getAttachments();
    const totalBytes = attachments.reduce((sum, file) => sum + (file.size || 0), 0);
    return this.formatSize(totalBytes);
  }

  downloadFile(file: any, index: number) {
    if (!file) return;
    
    try {
      // Handle different file types
      if (file.content && typeof file.content === 'string' && file.content.startsWith('data:')) {
        // Base64 data URL
        const a = document.createElement('a');
        a.href = file.content;
        a.download = file.name || file.fileName || 'file';
        a.click();
      } else if (file.file instanceof File) {
        // File object
        const url = window.URL.createObjectURL(file.file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.file.name;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      
      this.snackBar.open('File downloaded successfully', 'Close', { duration: 2000 });
    } catch (error) {
      console.error('Error downloading file:', error);
      this.snackBar.open('Error downloading file', 'Close', { duration: 3000 });
    }
  }

  removeFile(index: number) {
    if (confirm('Are you sure you want to remove this file?')) {
      // Find and remove from form array
      const paths = ['attachments.files', 'attachments.attachments', 'files'];
      
      for (const path of paths) {
        const control = this.form.get(path);
        if (control instanceof FormArray) {
          control.removeAt(index);
          break;
        }
      }
      
      this.snackBar.open('File removed successfully', 'Close', { duration: 2000 });
    }
  }

  // ================== ACTIONS ==================

  printPreview() {
    window.print();
  }

  backToForm() {
    this.router.navigate(['/undertaking-issuance/request']);
  }

  submitRequest() {
    if (!this.isFormComplete()) {
      this.snackBar.open('Please complete all required fields before submitting', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Prepare submission data
    const submissionData = {
      ...this.form.value,
      submittedAt: new Date().toISOString(),
      status: 'Submitted'
    };

    console.log('Submitting undertaking request:', submissionData);

    // Show success message
    this.snackBar.open('Undertaking request submitted successfully!', 'Close', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });

    // Clear data and navigate
    // this.dataService.clearFormData();
    
    // Navigate to dashboard
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 2000);
  }
}