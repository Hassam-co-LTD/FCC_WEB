import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

// Services
import { SharedService } from '../../../../../core/services/user-service/shared-form-service/shared-service';
import { UndertakingIssuanceService } from '../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDividerModule,
    MatCardModule
  ],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss']
})
export class Preview implements OnInit {

  // Data Containers
  formData: any = null;
  uploadedFiles: any[] = [];

  // State Flags
  transactionId: string | number | null = null;
  isEditMode: boolean = false;
  isReadOnly: boolean = false;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private location: Location,
    private sharedService: SharedService,
    private backendService: UndertakingIssuanceService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  // ============================================
  // 1. INITIALIZATION
  // ============================================
  private loadData() {
    // Retrieve data passed from Pending Records or Request Form
    const data = this.sharedService.getFormData();

    if (!data || !data.formData) {
      console.warn('No preview data found. Redirecting to request page...');
      this.router.navigate(['/undertaking-issuance/request']);
      return;
    }

    // Populate Component State
    this.formData = data.formData;
    // Handle cases where attachments might be directly in formData or passed separately
    this.uploadedFiles = data.uploadedFiles || data.formData?.attachments?.files || [];
    this.transactionId = data.transactionId;

    // Determine Modes
    this.isEditMode = data.isEditMode;
    this.isReadOnly = data.isReadOnly || false;

    console.log('Preview Loaded:', {
      id: this.transactionId,
      mode: this.isReadOnly ? 'View Only' : 'Review/Edit',
      data: this.formData
    });
  }

  // ============================================
  // 2. USER ACTIONS
  // ============================================

  onUpdate(): void {
    // 1. Prepare state for the Request Form
    this.sharedService.setFormData({
      isEditMode: true,          // TELL FORM: We are editing
      isReadOnly: false,         // Allow typing
      transactionId: this.transactionId, // Keep the ID so we update the same record
      formData: this.formData,   // Pass current data back
      uploadedFiles: this.uploadedFiles
    });

    // 2. Navigate
    this.router.navigate(['/undertaking-issuance/request']);
  }

  onEdit(): void {
    if (this.isReadOnly) return;
    this.onUpdate();
  }

  onSubmit(): void {
    if (this.isReadOnly || this.isLoading) return;

    this.isLoading = true;

    // Scenario A: We already have an ID (Existing Record)
    if (this.transactionId) {
      this.executeSubmit(this.transactionId);
    }
    // Scenario B: New Record (No ID yet) -> Save Draft First
    else {
      console.log('No ID found. Auto-saving draft before submission...');
      this.backendService.saveDraft(this.formData, null).subscribe({
        next: (savedTxn) => {
          // Capture the new ID
          this.transactionId = savedTxn.id;
          // Now Submit
          this.executeSubmit(this.transactionId);
        },
        error: (err) => {
          console.error('Auto-save failed:', err);
          this.handleError('Failed to save application data. Please try again.');
          this.isLoading = false;
        }
      });
    }
  }

  private executeSubmit(id: any) {
    this.backendService.submitTransaction(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        const ref = response.channelReference || response.tnxId || id;
        this.handleSuccess(`Application Submitted Successfully! Reference: ${ref}`);
      },
      error: (err) => {
        this.isLoading = false;
        this.handleError(err);
      }
    });
  }

  onClose(): void {
    this.sharedService.clearFormData();
    this.router.navigate(['/undertaking-issuance/pending-records']);
  }

  // ============================================
  // 3. ATTACHMENT HANDLING
  // ============================================

  isPdf(file: any): boolean {
    const name = (file.fileName || file.name || '').toLowerCase();
    const type = (file.type || '').toLowerCase();
    return type.includes('pdf') || name.endsWith('.pdf');
  }

  isImage(file: any): boolean {
    const name = (file.fileName || file.name || '').toLowerCase();
    const type = (file.type || '').toLowerCase();
    // Regex checks for common image extensions
    return type.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  }

  downloadFile(index: number): void {
    const file = this.uploadedFiles[index];

    if (!file) {
      console.error('File not found at index', index);
      return;
    }

    // Case 1: Browser File Object (Newly uploaded in this session)
    if (file instanceof File || (file.file && file.file instanceof File)) {
      const fileObj = file instanceof File ? file : file.file;
      const url = window.URL.createObjectURL(fileObj);
      this.triggerDownload(url, fileObj.name);
      window.URL.revokeObjectURL(url); // Clean up memory
    }
    // Case 2: Base64 String (Loaded from backend)
    else if (file.fileContent || file.content) {
      const content = file.fileContent || file.content;
      // Check if it already has the data prefix, if not, assume standard binary
      const mimeType = file.type || 'application/octet-stream';
      const base64Prefix = content.startsWith('data:') ? '' : `data:${mimeType};base64,`;
      const url = `${base64Prefix}${content}`;
      this.triggerDownload(url, file.fileName || file.name || 'download');
    }
    // Case 3: Direct URL
    else if (file.url) {
      window.open(file.url, '_blank');
    }
    // Fallback
    else {
      this.handleError('Unable to download: File content is missing.');
    }
  }

  private triggerDownload(url: string, name: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ============================================
  // 4. UI HELPERS (For Template Display)
  // ============================================
  getVal(group: string, control: string): any {
    const val = this.formData?.[group]?.[control];
    if (val === null || val === undefined || val === '') {
      return '-';
    }
    return val;
  }

  isNaN(value: any): boolean {
    if (value === null || value === undefined || value === '-') return true;
    return isNaN(Number(value));
  }

  formatDate(dateVal: string | Date): string {
    if (!dateVal || dateVal === '-') return '-';
    try {
      const date = new Date(dateVal);
      // Check if date is valid
      if (isNaN(date.getTime())) return String(dateVal);

      return date.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch (e) {
      return String(dateVal);
    }
  }

  // ============================================
  // 5. FEEDBACK HANDLERS
  // ============================================

  private handleSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
    this.sharedService.clearFormData();
    this.router.navigate(['/undertaking-issuance/pending-records']);
  }

  private handleError(error: any) {
    console.error(error);
    const msg = typeof error === 'string' ? error : 'Error processing request.';
    this.snackBar.open(msg, 'Close', {
      duration: 4000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}