import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

// SERVICES
import { UndertakingIssuanceService } from '../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatCardModule, 
    MatButtonModule, 
    DecimalPipe,
    DatePipe
  ],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss']
})
export class Preview implements OnInit {
  
  @Input() transaction: any; // Input from Success/History page

  formData: any = {}; // Holds the raw JSON data
  currentTxId: any = null;
  readOnly = false;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private undertakingService: UndertakingIssuanceService
  ) {}

  ngOnInit(): void {
    // 1. If passed via Input (History/Success View)
    if (this.transaction) {
      this.formData = this.transaction.formData || this.transaction;
      this.currentTxId = this.transaction.id;
      this.readOnly = true; 
    } 
    // 2. If accessed via URL/Draft (Preview View)
    else {
      const urlParams = new URLSearchParams(window.location.search);
      const txId = urlParams.get('transactionId');
      
      if(txId) {
         this.undertakingService.getTransactionById(txId).subscribe(tx => {
             this.currentTxId = tx.id;
             // Handle structure variations (sometimes data is wrapped in formData property)
             this.formData = tx.formData || tx; 
         });
      } else {
         this.router.navigate(['/undertaking-issuance/request']);
      }
    }
  }

  /**
   * Safe Getter Helper
   * Usage: getVal('generalDetails', 'productType')
   */
  getVal(group: string, field: string): any {
    const val = this.formData?.[group]?.[field];
    return (val === null || val === undefined || val === '') ? '-' : val;
  }

  get attachments(): any[] {
    // Handle different structures of attachments in backend response
    return this.formData?.attachments?.files || this.formData?.attachments || [];
  }

  // --- ACTIONS ---

  back(): void {
    if (this.readOnly) {
        this.router.navigate(['/undertaking-issuance/pending-records']);
    } else {
        // Go back to edit mode
        this.router.navigate(['/undertaking-issuance/request'], {
            queryParams: { transactionId: this.currentTxId }
        });
    }
  }

  submit(): void {
    if (this.readOnly || !this.currentTxId) return;

    this.undertakingService.submitTransaction(this.currentTxId).subscribe({
      next: () => {
        this.snackBar.open('Undertaking Submitted Successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/undertaking-issuance/pending-records']); 
      },
      error: () => {
        this.snackBar.open('Error submitting transaction', 'Close', { duration: 3000 });
      }
    });
  }

  // --- FILE DOWNLOAD LOGIC ---

  downloadFile(index: number) {
    const fileData = this.attachments[index];
    if (!fileData) return;

    // A. Browser File Object (New Uploads)
    if (fileData.fileObj instanceof File) {
       const url = URL.createObjectURL(fileData.fileObj);
       this.triggerDownload(url, fileData.fileName);
       URL.revokeObjectURL(url);
       return;
    }
    
    // B. Base64 String (Saved Data)
    const content = fileData.fileContent || fileData.content || fileData.fileObj; 
    
    if (typeof content === 'string') {
        const mime = fileData.type || 'application/octet-stream';
        // Add prefix if missing
        const base64Prefix = content.startsWith('data:') ? '' : `data:${mime};base64,`;
        const url = `${base64Prefix}${content}`;
        this.triggerDownload(url, fileData.fileName);
    } 
  }

  private triggerDownload(url: string, fileName: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  }
}