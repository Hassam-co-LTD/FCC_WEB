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
  
  @Input() transaction: any; 

  formData: any = {}; 
  currentTxId: any = null;
  statusChar: string = 'i'; 
  readOnly = false;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private undertakingService: UndertakingIssuanceService
  ) {}

  ngOnInit(): void {
    if (this.transaction) {
      this.loadTransactionData(this.transaction);
      this.readOnly = true; 
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const txId = urlParams.get('transactionId');
      
      if(txId) {
         this.undertakingService.getTransactionById(txId).subscribe(tx => {
             this.loadTransactionData(tx);
         });
      } else {
         this.router.navigate(['/undertaking-issuance/inquiries-records']);
      }
    }
  }

  private loadTransactionData(tx: any) {
      this.currentTxId = tx.id;
      this.formData = tx.formData || tx;
      this.statusChar = this.normalizeStatus(tx.status);
  }

  normalizeStatus(s: string): string {
      s = (s || '').toLowerCase();
      if(s.includes('draft') || s === 'i') return 'i';
      if(s.includes('submit') || s === 's') return 's';
      if(s.includes('approve') || s === 'a') return 'a';
      if(s.includes('reject') || s === 'r') return 'r';
      return 'i';
  }

  // --- GETTERS ---

  getVal(group: string, field: string): any {
    const val = this.formData?.[group]?.[field];
    return (val === null || val === undefined || val === '') ? '-' : val;
  }

  get attachments(): any[] {
    return this.formData?.attachments?.files || this.formData?.attachments || [];
  }

  // --- ACTIONS ---

  /**
   * CLOSE: Go back to Inquiries List (preserve Tab)
   */
  close(): void {
    let returnTab = 'pending';
    if (this.statusChar === 's') returnTab = 'submitted';
    if (this.statusChar === 'a') returnTab = 'approved';
    if (this.statusChar === 'r') returnTab = 'rejected';

    this.router.navigate(['/undertaking-issuance/inquiries-records'], { 
        queryParams: { tab: returnTab } 
    });
  }

  /**
   * APPROVE: Only visible if status is 's' (Submitted)
   */
  approve() {
      if(!confirm('Are you sure you want to Approve this transaction?')) return;

      this.undertakingService.approveUndertaking(this.currentTxId).subscribe({
          next: () => {
              this.snackBar.open('Transaction Approved Successfully', 'Close', { duration: 3000 });
              this.router.navigate(['/undertaking-issuance/inquiries-records'], { 
                  queryParams: { tab: 'approved' } 
              });
          },
          error: () => this.snackBar.open('Approval Failed', 'Close', { duration: 3000 })
      });
  }

  /**
   * REJECT: Only visible if status is 's' (Submitted)
   */
  reject() {
      const reason = prompt('Please enter rejection reason:');
      if(reason === null) return; 

      this.undertakingService.rejectUndertaking(this.currentTxId, reason || 'No reason provided').subscribe({
          next: () => {
              this.snackBar.open('Transaction Rejected', 'Close', { duration: 3000 });
              this.router.navigate(['/undertaking-issuance/inquiries-records'], { 
                  queryParams: { tab: 'rejected' } 
              });
          },
          error: () => this.snackBar.open('Rejection Failed', 'Close', { duration: 3000 })
      });
  }

  // --- FILE DOWNLOAD LOGIC ---

  downloadFile(index: number) {
    const fileData = this.attachments[index];
    if (!fileData) return;

    if (fileData.fileObj instanceof File) {
       const url = URL.createObjectURL(fileData.fileObj);
       this.triggerDownload(url, fileData.fileName);
       URL.revokeObjectURL(url);
       return;
    }
    
    const content = fileData.fileContent || fileData.content || fileData.fileObj; 
    
    if (typeof content === 'string') {
        const mime = fileData.type || 'application/octet-stream';
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