import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../../../../../core/services/user-service/shared-form-service/shared-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
  providers: [DatePipe]
})
export class PreviewSectionComponent implements OnInit {
  form!: FormGroup;
  lastUpdated: Date = new Date();

  constructor(
    private sharedService: SharedService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.loadFormData();
  }

  private loadFormData() {
    const savedData = this.sharedService.getFormData();

    if (!savedData) {
      this.snackBar.open('No export collection data found. Please complete the form first.', 'Close', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/export-collection']);
      return;
    }

    // Build the form from saved data
    this.form = this.fb.group({
      generaldetails: this.fb.group(savedData.generaldetails || {}),
      DrawerDraweeDetails: this.fb.group(savedData.DrawerDraweeDetails || {}),
      bankdetails: this.fb.group(savedData.bankdetails || {}),
      paymentamount: this.fb.group(savedData.paymentamount || {}),
      shippingdetails: this.fb.group(savedData.shippingdetails || {}),
      collectioninstructions: this.fb.group(savedData.collectioninstructions || {}),
      attachments: this.fb.group({
        attachments: this.fb.array(savedData.attachments?.attachments || []),
        documents: this.fb.array(savedData.attachments?.documents || [])
      })
    });

    this.lastUpdated = new Date();
  }

  // ================= FORMAT HELPERS =================
  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.length ? value.join(', ') : 'None';
    return String(value);
  }

  formatBoolean(value: boolean): string {
    return value ? 'Yes' : 'No';
  }

  formatDate(dateValue: any): string {
    if (!dateValue) return '—';
    try {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? 'Invalid date' : 
        this.datePipe.transform(date, 'MMM dd, yyyy') || '—';
    } catch { 
      return String(dateValue); 
    }
  }

  formatCurrency(amount: any): string {
    if (amount === null || amount === undefined || amount === '') return '—';
    const num = Number(amount);
    if (isNaN(num)) return String(amount);
    return new Intl.NumberFormat('en-US', { 
      style: 'currency',
      currency: this.form?.get('paymentamount.currency')?.value || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(num);
  }

  formatPercentage(value: any): string {
    if (value === null || value === undefined || value === '') return '—';
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return `${num.toFixed(2)}%`;
  }

  formatDocumentType(type: string): string {
    if (!type) return 'Document';
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  }

  // ================= STATUS HELPERS =================
  getStatusClass(value: boolean): string {
    return value ? 'status-active' : 'status-inactive';
  }

  getCollectionType(): string {
    const type = this.form?.get('generaldetails.collectionType')?.value;
    return this.formatValue(type);
  }

  getTotalAmount(): string {
    const amount = this.form?.get('paymentamount.amount')?.value;
    return this.formatCurrency(amount);
  }

  // ================= FILE HANDLING =================
  getAttachments(): any[] {
    if (!this.form) return [];
    const attachmentsCtrl = this.form.get('attachments.attachments') as FormArray;
    return attachmentsCtrl ? attachmentsCtrl.value : [];
  }

  getDocuments(): any[] {
    if (!this.form) return [];
    const documentsCtrl = this.form.get('attachments.documents') as FormArray;
    return documentsCtrl ? documentsCtrl.value : [];
  }

  getAttachmentsCount(): number {
    return this.getAttachments().length;
  }

  getDocumentsCount(): number {
    return this.getDocuments().length;
  }

  getFileIcon(file: any): string {
    if (!file) return 'insert_drive_file';
    const name = (file.name || file.fileName || '').toLowerCase();
    const type = (file.type || '').toLowerCase();
    if (name.includes('.pdf') || type.includes('pdf')) return 'picture_as_pdf';
    if (name.match(/\.(jpg|jpeg|png|gif|bmp)$/) || type.includes('image')) return 'image';
    if (name.match(/\.(doc|docx)$/) || type.includes('word')) return 'description';
    if (name.match(/\.(xls|xlsx)$/) || type.includes('excel')) return 'table_chart';
    if (name.match(/\.(txt)$/) || type.includes('text')) return 'text_snippet';
    return 'insert_drive_file';
  }

  formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  downloadFile(file: any, index: number) {
    if (!file) return;
    
    try {
      const a = document.createElement('a');
      
      if (file.content && file.content.startsWith('data:')) {
        a.href = file.content;
        a.download = file.name || file.fileName || 'file';
      } else if (file.file instanceof File) {
        const url = window.URL.createObjectURL(file.file);
        a.href = url;
        a.download = file.file.name;
        window.URL.revokeObjectURL(url);
      } else if (file.url) {
        window.open(file.url, '_blank');
        return;
      }
      
      a.click();
      this.snackBar.open('File downloaded successfully', 'Close', { 
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      this.snackBar.open('Error downloading file', 'Close', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  // ================== ACTIONS ==================
  backToForm() {
    this.router.navigate(['/export-collection']);
  }

  submit() {
    if (!this.form) {
      this.snackBar.open('No form data available', 'Close', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Validate required fields
    const requiredFields = [
      'generaldetails.collectionType',
      'DrawerDraweeDetails.drawerName',
      'DrawerDraweeDetails.draweeName',
      'paymentamount.amount',
      'paymentamount.currency'
    ];

    const missingFields = requiredFields.filter(field => {
      const value = this.form.get(field)?.value;
      return !value || value === '';
    });

    if (missingFields.length > 0) {
      this.snackBar.open('Please complete all required fields before submitting', 'Close', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Generate transaction reference
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const transactionRef = `EXP${timestamp.toString().slice(-6)}${randomSuffix}`;
    
    // Prepare submission data
    const submissionData = {
      ...this.form.value,
      submittedAt: new Date().toISOString(),
      status: 'Submitted',
      channelReference: transactionRef,
      customerReference: `CUST${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      bankReference: `BNK${timestamp.toString().slice(-6)}`,
      id: timestamp,
      issueDate: new Date(),
      beneficiary: this.form.get('DrawerDraweeDetails.draweeName')?.value || 'Unknown',
      currency: this.form.get('paymentamount.currency')?.value || 'USD',
      amount: parseFloat(this.form.get('paymentamount.amount')?.value) || 0,
      outstandingAmount: parseFloat(this.form.get('paymentamount.amount')?.value) || 0,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };

    // IMPORTANT: Since SharedService doesn't have addTransaction method,
    // we need to handle this differently
    
    // Option 1: Save to localStorage directly (temporary solution)
    this.saveToLocalStorage(submissionData);
    
    // Option 2: Create a transaction object and use service if available
    // Check if addTransaction method exists (type safety workaround)
    const service = this.sharedService as any;
    if (service.addTransaction) {
      service.addTransaction(submissionData);
    } else {
      // Fallback: Save to localStorage
      this.saveToLocalStorage(submissionData);
    }
    
    // Show success message
    this.snackBar.open(
      `Export Collection submitted successfully! Reference: ${transactionRef}`, 
      'Close', { 
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      }
    );

    // Clear form data
    this.sharedService.clearFormData();
    
    // Navigate to dashboard
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 2000);
  }

  // Helper method to save transaction to localStorage
  private saveToLocalStorage(transactionData: any) {
    try {
      // Get existing transactions
      const existing = localStorage.getItem('export_collection_transactions');
      const transactions = existing ? JSON.parse(existing) : [];
      
      // Add new transaction
      transactions.unshift(transactionData);
      
      // Save back to localStorage
      localStorage.setItem('export_collection_transactions', JSON.stringify(transactions));
      
      console.log('Transaction saved to localStorage:', transactionData);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Alternative: Save as Draft
  saveAsDraft() {
    if (!this.form) {
      this.snackBar.open('No form data available', 'Close', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Save current form data as draft
    const draftData = {
      ...this.form.value,
      savedAt: new Date().toISOString(),
      status: 'Draft'
    };

    this.sharedService.setFormData(draftData);
    
    this.snackBar.open('Export collection saved as draft successfully!', 'Close', { 
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    
    // Navigate back
    setTimeout(() => {
      this.router.navigate(['/export-collection']);
    }, 1500);
  }
}