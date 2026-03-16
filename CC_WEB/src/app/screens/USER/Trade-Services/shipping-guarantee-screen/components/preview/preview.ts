import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from "@angular/material/icon";
import { ShippingGuaranteeTransaction } from '../../../../../../core/models/shipping-guarantee';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ShippingGuaranteeFormTransactionService } from '../../../../../../core/services/user-service/shipping-guarantee-form-transaction-service/shipping-guarantee-form-transaction-service';
import { ApiService } from '../../../../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RejectDialogComponent } from '../../../../../../shared/reject-dialog/reject-dialog';
import { Dialog } from '@angular/cdk/dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIcon, MatDialogModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss']
})
export class Preview implements OnInit {
  @Input() transaction!: ShippingGuaranteeTransaction;
  viewMode: 'submit' | 'readonly' = 'submit';

  ShippingGuaranteeForm!: FormGroup;

  isOpen = true;
  viewerOpen = false;
  viewerContent: SafeResourceUrl | null = null;
  isImage = false;
  isPdf = false;
  currentTx: ShippingGuaranteeTransaction | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private dialog: MatDialog,
    private transactionService: ShippingGuaranteeFormTransactionService
  ) { }

  ngOnInit(): void {
    this.currentTx = this.transaction //  Priority: @Input() transaction (Success page)
      ||
      this.transactionService.getCurrentTransaction(); //  Fallback: service (Preview before submit)

    if (!this.currentTx) {
      console.error('Preview: No transaction data found');
      this.router.navigate(['/shipping-guarantee']);
      return;
    }
    this.viewMode = this.transactionService.getViewMode();
    this.initForm();
  }

  private initForm(): void {
    this.ShippingGuaranteeForm = this.fb.group({
      id: [this.currentTx!.id],
      tnxId: [this.currentTx!.tnxId],
      status: [this.currentTx!.status],
      createdOn: [this.currentTx!.createdOn],
      // createdBy: [this.currentTx!.createdBy],

      expiryDate: [this.currentTx!.expiryDate],
      beneficiaryReference: [this.currentTx!.beneficiaryReference],
      customerReference: [this.currentTx!.customerReference],
      billoflading: [this.currentTx!.billoflading],
      modeOfShipment: [this.currentTx!.modeOfShipment],
      shippingDetails: [this.currentTx!.shippingDetails],
      description: [this.currentTx!.description],
      
      applicantName: [this.currentTx!.applicantName],
      applicantAddress1: [this.currentTx!.applicantAddress1],
      applicantAddress2: [this.currentTx!.applicantAddress2],
      applicantCountry: [this.currentTx!.applicantCountry],

      beneficiaryName: [this.currentTx!.beneficiaryName],
      beneficiaryAddress1: [this.currentTx!.beneficiaryAddress1],
      beneficiaryAddress2: [this.currentTx!.beneficiaryAddress2],
      beneficiaryCountry: [this.currentTx!.beneficiaryCountry],

      bankName: [this.currentTx!.bankName],
      issuerReference: [this.currentTx!.issuerReference],
      currency: [this.currentTx!.currency],
      amount: [this.currentTx!.amount],

      principalAccount: [this.currentTx!.principalAccount],
      feeAccount: [this.currentTx!.feeAccount],
      otherInstructions: [this.currentTx!.otherInstructions],

      attachments: this.fb.array(this.currentTx!.attachments ?? [])
    });
    // 🔒 Read-only mode (Success page)
    if (this.viewMode === 'readonly') {
      this.ShippingGuaranteeForm.disable({ emitEvent: false });
    }
  }

  get attachmentsArray(): FormArray {
    return this.ShippingGuaranteeForm.get('attachments') as FormArray;
  }
  
back() {
  this.router.navigate(['/shipping-guarantee/inquiries-records'])
}

  /** SUBMIT */
  submit(): void {
    if (this.viewMode === 'readonly') return;

    const tnxId = this.currentTx?.tnxId;
    if (!tnxId) {
      this.snackBar.open('Transaction ID missing', 'Close', { duration: 3000 });
      return;
    }

    this.api.submitShippingGuaranteeByTnxId(tnxId, this.currentTx!).subscribe({
      next: (res) => {
        this.router.navigate(['/shipping-guarantee/success'], {
          state: { transaction: res }
        });
      },
      error: () => {
        this.snackBar.open('Error submitting transaction', 'Close', { duration: 3000 });
      }
    });
  } 

  approveTransaction(): void {
    if (!this.currentTx?.tnxId) return;

    this.api.approveTransactionForShippingGuarantee(this.currentTx.tnxId, this.currentTx).subscribe({
      next: (res) => {
        this.snackBar.open('Transaction approved', 'Close', { duration: 3000 });
        this.router.navigate(['/shipping-guarantee/success'], { state: { transaction: res } });
      },
      error: () => this.snackBar.open('Error approving transaction', 'Close', { duration: 3000 })
    });
  }

  // rejectTransaction(): void {
  //   if (!this.currentTx?.tnxId) return;

  //   this.api.rejectTransaction(this.currentTx.tnxId, {rejectionReason: this.rejectionReason! }).subscribe({
  //     next: (res) => {
  //       this.snackBar.open('Transaction rejected', 'Close', { duration: 3000 });
  //       this.router.navigate(['/import-screen/success'], { state: { transaction: res } });
  //     },
  //     error: () => this.snackBar.open('Error rejecting transaction', 'Close', { duration: 3000 })
  //   });
  // }
  rejectTransaction(): void {
    const tnxId = this.currentTx?.tnxId;
    if (!tnxId) return;

    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: '400px', hasBackdrop: true,                        // ensure overlay backdrop
      backdropClass: 'cdk-overlay-dark-backdrop', // dark semi-transparent backdrop
      panelClass: 'custom-dialog-container'     // white dialog box 
       });

    dialogRef.afterClosed().subscribe((reason: string | undefined) => {
      if (!reason) return; // user cancelled
      this.api.rejectTransactionForShippingGuarantee(tnxId, reason ).subscribe({
        next: (res) => {
          this.snackBar.open('Transaction rejected successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/shipping-guarantee/success'], { state: { transaction: res } });
        },
        error: () => this.snackBar.open('Error rejecting transaction', 'Close', { duration: 3000 })
      });
    });
  }


  downloadFile(index: number) {
    const currentTx = this.attachmentsArray.at(index)?.value;
    if (!currentTx) return;

    const { file, fileName } = currentTx;

    if (file instanceof Blob) {
      const url = URL.createObjectURL(file);
      this.triggerDownload(url, fileName);
      URL.revokeObjectURL(url);
      return;
    }

    if (typeof file === 'string' && file.startsWith('currentTx:')) {
      const arr = file.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] ?? '';
      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);
      for (let n = 0; n < bstr.length; n++) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const url = URL.createObjectURL(blob);
      this.triggerDownload(url, fileName);
      URL.revokeObjectURL(url);
      return;
    }

    console.error("Unsupported file format", file);
  }

  private triggerDownload(url: string, fileName: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  }

  trackByIndex(index: number, item: any): any {
    return item?.id || index;
  }

}