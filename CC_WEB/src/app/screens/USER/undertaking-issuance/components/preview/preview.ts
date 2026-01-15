import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

// --- SERVICE IMPORT ---
import { 
  UndertakingIssuanceService, 
  UndertakingTransaction 
} from '../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';

import { AuthService } from '../../../../../core/services/auth.service'; // <-- Added

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatCardModule, 
    MatButtonModule, 
    DecimalPipe,
    DatePipe,
    MatDividerModule
  ],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss']
})
export class Preview implements OnInit {
  
  @Input() transaction: any; 

  formData: any = {}; 
  
  // Component State
  currentTxId: string | number | null = null;
  channelRef: string = ''; 
  statusChar: string = 'i'; 
  readOnly = false;
  isLoading = false;

  companyId: string = ''; // <-- Added

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private undertakingService: UndertakingIssuanceService,
    private authService: AuthService, // <-- Added
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.companyId = this.authService.getCompanyId() || ''; // <-- Set company ID

    // 1. Direct Input
    if (this.transaction) {
      this.loadTransactionData(this.transaction);
      this.readOnly = true; 
    } 
    // 2. URL Params
    else {
      this.route.queryParams.subscribe(params => {
        const txId = params['transactionId'];
        if(txId) {
           this.fetchTransaction(txId);
        }
      });
    }
  }

  private fetchTransaction(id: string) {
    this.isLoading = true;
    this.undertakingService.getTransactionById(id).subscribe({
      next: (tx) => {
        this.loadTransactionData(tx);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Could not load transaction details', 'Close');
        this.router.navigate(['/undertaking-issuance/inquiries-records']);
        this.isLoading = false;
      }
    });
  }

  private loadTransactionData(tx: UndertakingTransaction) {
      this.currentTxId = tx.id || null;
      this.formData = tx.formData || tx; 
      this.statusChar = this.normalizeStatus(tx.status || 'Draft');
      this.channelRef = tx.channelReference || `REF-${tx.id}`;
  }

  normalizeStatus(s: string): string {
      s = (s || '').toLowerCase();
      if(s.includes('draft') || s === 'i') return 'i';
      if(s.includes('submit') || s === 's') return 's';
      if(s.includes('approve') || s === 'a') return 'a';
      if(s.includes('reject') || s === 'r') return 'r';
      return 'i';
  }

  // ==========================================
  //  GETTERS 
  // ==========================================

  getVal(group: string, field: string): any {
    const val = this.formData?.[group]?.[field];
    return (val === null || val === undefined || val === '') ? '-' : val;
  }

  get attachments(): any[] {
    return this.formData?.attachments?.files || this.formData?.attachments || [];
  }

  // ==========================================
  //  ACTIONS
  // ==========================================

  close(): void {
    let returnTab = 'pending';
    if (this.statusChar === 's') returnTab = 'submitted';
    if (this.statusChar === 'a') returnTab = 'approved';
    if (this.statusChar === 'r') returnTab = 'rejected';

    this.router.navigate(['/undertaking-issuance/inquiries-records'], { 
        queryParams: { tab: returnTab } 
    });
  }

  approve() {
      if(!confirm(`Are you sure you want to Approve transaction ${this.channelRef}?`)) return;

      this.undertakingService.approveUndertaking(this.currentTxId!).subscribe({
          next: () => {
              this.showSuccess('Approved Successfully');
              this.router.navigate(['/undertaking-issuance/inquiries-records'], { 
                  queryParams: { tab: 'approved' } 
              });
          },
          error: (err) => this.showError('Approve', err)
      });
  }

  reject() {
      const reason = prompt('Please enter rejection reason:');
      if(reason === null) return; 

      this.undertakingService.rejectUndertaking(this.currentTxId!, reason || 'No reason provided').subscribe({
          next: () => {
              this.showSuccess('Rejected Successfully');
              this.router.navigate(['/undertaking-issuance/inquiries-records'], { 
                  queryParams: { tab: 'rejected' } 
              });
          },
          error: (err) => this.showError('Reject', err)
      });
  }

  amend() {
    if(!confirm(`Amend will move transaction ${this.channelRef} back to Pending/Draft. Continue?`)) return;
    
    if (!this.companyId) {
        this.snackBar.open('Company ID is missing', 'Close');
        return;
    }

    const payload = { ...this.formData, id: this.currentTxId };

    // Pass companyId as second argument
    this.undertakingService.saveDraft(payload, this.companyId).subscribe({
        next: (res) => {
            this.showSuccess('Moved to Pending for Amendment');
            this.router.navigate(['/undertaking-issuance/request-undertaking'], {
                queryParams: { transactionId: this.currentTxId }
            });
        },
        error: (err) => this.showError('Amend', err)
    });
  }

  updateRejected() {
    this.amend();
  }

  // ==========================================
  //  HELPERS
  // ==========================================

  private showSuccess(msg: string) {
    this.snackBar.open(`${msg} - ${this.channelRef}`, 'Close', { 
        duration: 4000, 
        panelClass: ['success-snackbar'] 
    });
  }

  private showError(action: string, err: any) {
    console.error(err);
    this.snackBar.open(`Failed to ${action} transaction. Server might be down.`, 'Close', { duration: 3000 });
  }

  // ==========================================
  //  FILE DOWNLOAD
  // ==========================================
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
        const base64Prefix = content.startsWith('data:') 
            ? '' 
            : `data:${mime};base64,`;
            
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
