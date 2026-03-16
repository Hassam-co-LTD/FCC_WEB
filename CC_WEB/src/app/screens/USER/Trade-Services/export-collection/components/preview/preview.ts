import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SharedService } from '../../../../../../core/services/user-service/shared-form-service/shared-service'
import { ExportCollectionTransaction } from '../../../../../../core/models/export-collection';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ExportCollectionFormTransactionService } from '../../../../../../core/services/user-service/export-collection-form-transaction-service/export-collection-form-transaction';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RejectDialogComponent } from '../../../../../../shared/reject-dialog/reject-dialog';

@Component({
  selector: 'app-export-preview',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss']
})
export class Preview implements OnInit {
  @Input() transaction!: ExportCollectionTransaction;
  viewMode: 'submit' | 'readonly' = 'submit';

  ExportCollectionForm!: FormGroup;

  isOpen = true;
  viewerOpen = false;
  viewerContent: SafeResourceUrl | null = null;
  isImage = false;
  isPdf = false;
  currentTx: ExportCollectionTransaction | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private dialog: MatDialog,
    private transactionService: ExportCollectionFormTransactionService
  ) { }

  ngOnInit(): void {
    this.currentTx = this.transaction //  Priority: @Input() transaction (Success page)
      ||
      this.transactionService.getCurrentTransaction(); //  Fallback: service (Preview before submit)

    if (!this.currentTx) {
      console.error('Preview: No transaction data found');
      this.router.navigate(['/export-collection']);
      return;
    }
    this.viewMode = this.transactionService.getViewMode();
    this.initForm();
  }

    // Reconstruct form structure to match your HTML paths
  private initForm(): void {
    this.ExportCollectionForm = this.fb.group({
      id: [this.currentTx!.id],
      tnxId: [this.currentTx!.tnxId],
      status: [this.currentTx!.status],
      createdOn: [this.currentTx!.createdOn],

      collectionType: [this.currentTx!.collectionType],
      customerReference: [this.currentTx!.customerReference],
      draweeReference: [this.currentTx!.draweeReference],
    
       drawerName: [this.currentTx!.drawerName],
      drawerAddress1: [this.currentTx!.drawerAddress1],
      drawerAddress2: [this.currentTx!.drawerAddress2],
      drawerAddress3: [this.currentTx!.drawerAddress3],
      drawerAddress4: [this.currentTx!.drawerAddress4],
      draweeName: [this.currentTx!.draweeName],
      draweeAddress1: [this.currentTx!.draweeAddress1],
      draweeAddress2: [this.currentTx!.draweeAddress2],
      draweeAddress3: [this.currentTx!.draweeAddress3],
      draweeAddress4: [this.currentTx!.draweeAddress4],

      remittingBankName: [this.currentTx!.remittingBankName],
      issuerReference: [this.currentTx!.issuerReference],
      principalAccount: [this.currentTx!.principalAccount],
      feeAccount: [this.currentTx!.feeAccount],
      presentingBankName: [this.currentTx!.presentingBankName],
      bankAddress1: [this.currentTx!.bankAddress1],
      bankAddress2: [this.currentTx!.bankAddress2],
      bankAddress3: [this.currentTx!.bankAddress3],
      bankAddress4: [this.currentTx!.bankAddress4],
      collectingBankName: [this.currentTx!.collectingBankName],
      swiftCode: [this.currentTx!.swiftCode],
      collectingReference: [this.currentTx!.collectingReference],

      amount: [this.currentTx!.amount],
      currency: [this.currentTx!.currency],
      paymentType: [this.currentTx!.paymentType],
      tenor: [this.currentTx!.tenor],
      paymentReference: [this.currentTx!.paymentReference],

      shippingMethod: [this.currentTx!.shippingMethod],
      shipmentReference: [this.currentTx!.shipmentReference],
      shippingFrom: [this.currentTx!.shippingFrom],
      shippingTo: [this.currentTx!.shippingTo],
      shipmentDate: [this.currentTx!.shipmentDate],
      applicableRule: [this.currentTx!.applicableRule],
      incoterms: [this.currentTx!.incoterms],

      advicePaymentBy: [this.currentTx!.advicePaymentBy],
      adviceAcceptanceAndDueDateBy: [this.currentTx!.adviceAcceptanceAndDueDateBy],
      adviceReasonOfRefusalBy: [this.currentTx!.adviceReasonOfRefusalBy],
      openingCharges: [this.currentTx!.openingCharges],
      outsideCountryCharges: [this.currentTx!.outsideCountryCharges],
      waiveAllChargesIfRefusedByDrawee: [this.currentTx!.waiveAllChargesIfRefusedByDrawee],
      protestInCaseOfNonPayment: [this.currentTx!.protestInCaseOfNonPayment],
      protestInCaseOfNonAcceptance: [this.currentTx!.protestInCaseOfNonAcceptance],
      acceptanceMayBeDeferredPendingArrival: [this.currentTx!.acceptanceMayBeDeferredPendingArrival],
      warehouseOrInsureGoodsIfNecessary: [this.currentTx!.warehouseOrInsureGoodsIfNecessary],
      referTo: [this.currentTx!.referTo]
    });
  
  // 🔒 Read-only mode (Success page)
  if(this.viewMode === 'readonly') {
  this.ExportCollectionForm.disable({ emitEvent: false });
}
}

  back() {
    this.router.navigate(['/export-collection/inquiries-records'])
  }

  /** SUBMIT */
  submit(): void {
    if (this.viewMode === 'readonly') return;

    const tnxId = this.currentTx?.tnxId;
    if (!tnxId) {
      this.snackBar.open('Transaction ID missing', 'Close', { duration: 3000 });
      return;
    }

    this.api.submitExportCollectionByTnxId(tnxId, this.currentTx!).subscribe({
      next: (res) => {
        this.router.navigate(['/export-collection/success'], {
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

    this.api.approveTransactionForExportCollection(this.currentTx.tnxId, this.currentTx).subscribe({
      next: (res) => {
        this.snackBar.open('Transaction approved', 'Close', { duration: 3000 });
        this.router.navigate(['/export-collection/success'], { state: { transaction: res } });
      },
      error: () => this.snackBar.open('Error approving transaction', 'Close', { duration: 3000 })
    });
  }


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
      this.api.rejectTransactionForExportCollection(tnxId, reason ).subscribe({
        next: (res) => {
          this.snackBar.open('Transaction rejected successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/export-collection/success'], { state: { transaction: res } });
        },
        error: () => this.snackBar.open('Error rejecting transaction', 'Close', { duration: 3000 })
      });
    });
  }


  get attachmentsArray(): FormArray {
    return this.ExportCollectionForm.get('attachments') as FormArray;
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