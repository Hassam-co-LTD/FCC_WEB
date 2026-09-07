import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatCard } from '@angular/material/card';
import { HttpClientModule } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../../../../../../../core/services/api.service';
import { RejectDialogComponent } from '../../../../../../../../../shared/reject-dialog/reject-dialog';
import { ShippingGuaranteeTransaction } from '../../../../../../../../../core/models/shipping-guarantee';
import { ShippingGuaranteeFormTransactionService } from '../../../../../../../../../core/services/user-service/shipping-guarantee-form-transaction-service/shipping-guarantee-form-transaction-service';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
  imports: [CommonModule, MatIcon, MatCard, HttpClientModule, MatDialogModule],
  standalone: true,
})
export class Preview {
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
    private transactionService: ShippingGuaranteeFormTransactionService,
  ) {}

  permissionNames: string[] = [];

  private loadPermissions(): void {
    const storedPermissions = sessionStorage.getItem('permissionNames');

    if (storedPermissions) {
      try {
        this.permissionNames = JSON.parse(storedPermissions);

        console.log(
          'Shipping Guarantee Permission Names:',
          this.permissionNames,
        );
      } catch (error) {
        console.error('Error parsing permissionNames:', error);

        this.permissionNames = [];
      }
    } else {
      console.warn('permissionNames not found in sessionStorage');

      this.permissionNames = [];
    }
  }

  // =========================================================
  // CHECK PERMISSION
  // =========================================================

  hasPermission(permission: string): boolean {
    return this.permissionNames.some(
      (p) => p?.trim().toLowerCase() === permission.trim().toLowerCase(),
    );
  }

  ngOnInit(): void {
    this.loadPermissions();
    this.currentTx =
      this.transaction || //  Priority: @Input() transaction (Success page)
      this.transactionService.getCurrentTransaction(); //  Fallback: service (Preview before submit)

    if (!this.currentTx) {
      console.error('Preview: No transaction data found');
      this.router.navigate([
        '/dashboard/Trade-Services/shipping-guarantee/amend',
      ]);
      return;
    }
    this.viewMode = this.transactionService.getViewMode();
    // ✅ Always fetch latest approved event metadata to show correct
    // eventType and eventRefNo — works for both CRE and AMD
    // if (this.currentTx.tnxId && !this.currentTx.eventRefNo) {
    //   this.api.getLatestApprovedEvent(this.currentTx.tnxId).subscribe({
    //     next: (event) => {
    //       this.currentTx!.eventType = event.eventType;
    //       this.currentTx!.eventRefNo = event.eventRefNo;
    //       this.currentTx!.eventSequence = event.eventSequence;
    //     },
    //     error: () => { } // badge shows '—' if nothing found yet
    //   });
    // }
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
      applicantAddress3: [this.currentTx!.applicantAddress3],
      applicantAddress4: [this.currentTx!.applicantAddress4],
      applicantCountry: [this.currentTx!.applicantCountry],

      beneficiaryName: [this.currentTx!.beneficiaryName],
      beneficiaryAddress1: [this.currentTx!.beneficiaryAddress1],
      beneficiaryAddress2: [this.currentTx!.beneficiaryAddress2],
      beneficiaryAddress3: [this.currentTx!.beneficiaryAddress3],
      beneficiaryAddress4: [this.currentTx!.beneficiaryAddress4],
      beneficiaryCountry: [this.currentTx!.beneficiaryCountry],

      bankName: [this.currentTx!.bankName],
      issuerReference: [this.currentTx!.issuerReference],
      currency: [this.currentTx!.currency],
      amount: [this.currentTx!.amount],

      principalAccount: [this.currentTx!.principalAccount],
      feeAccount: [this.currentTx!.feeAccount],
      otherInstructions: [this.currentTx!.otherInstructions],

      attachments: this.fb.array(this.currentTx!.attachments ?? []),
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
    this.router.navigate([
      '/dashboard/Trade-Services/shipping-guarantee/approved-inquiry-records',
    ]);
  }

  submit(): void {
     // Backend/API protection
    if (!this.hasPermission('SG_AmendSubmit')) {

      console.warn(
        'User does not have SG_AmendSubmit permission'
      );

      return;
    }

    if (this.viewMode === 'readonly') return;

    const tnxId = this.currentTx?.tnxId;
    if (!tnxId) {
      this.snackBar.open('Transaction ID missing', 'Close', { duration: 3000 });
      return;
    }

    this.api.submitAmendmentSg(tnxId, this.currentTx!).subscribe({
      next: (res) => {
        this.router.navigate(
          ['/dashboard/Trade-Services/shipping-guarantee/success'],
          {
            state: { transaction: res },
          },
        );
      },
      error: () => {
        this.snackBar.open('Error submitting transaction', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  approveTransaction(): void {

     // Backend/API protection
    if (!this.hasPermission('SG_AmendApprove')) {

      console.warn(
        'User does not have SG_AmendApprove permission'
      );

      return;
    }

    if (!this.currentTx?.tnxId) return;

    this.api
      .approveAmendmentSg(this.currentTx.tnxId, this.currentTx)
      .subscribe({
        next: (res) => {
          this.snackBar.open('Transaction approved', 'Close', {
            duration: 3000,
          });
          this.router.navigate(
            ['/dashboard/Trade-Services/shipping-guarantee/success'],
            { state: { transaction: res } },
          );
        },
        error: () =>
          this.snackBar.open('Error approving transaction', 'Close', {
            duration: 3000,
          }),
      });
  }

  rejectTransaction(): void {

    // Backend/API protection
    if (!this.hasPermission('SG_AmendReject')) {

      console.warn(
        'User does not have SG_AmendPendingReject permission'
      );

      return;
    }

    const tnxId = this.currentTx?.tnxId;
    if (!tnxId) return;

    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: '400px',
      hasBackdrop: true, // ensure overlay backdrop
      backdropClass: 'cdk-overlay-dark-backdrop', // dark semi-transparent backdrop
      panelClass: 'custom-dialog-container', // white dialog box
    });

    dialogRef.afterClosed().subscribe((reason: string | undefined) => {
      if (!reason) return; // user cancelled
      this.api.rejectAmendmentSg(tnxId, reason).subscribe({
        next: (res) => {
          this.snackBar.open('Transaction rejected successfully', 'Close', {
            duration: 3000,
          });
          this.router.navigate(
            ['/dashboard/Trade-Services/shipping-guarantee/success'],
            { state: { transaction: res } },
          );
        },
        error: () =>
          this.snackBar.open('Error rejecting transaction', 'Close', {
            duration: 3000,
          }),
      });
    });
  }

  downloadFile(index: number) {
    const data = this.attachmentsArray.at(index)?.value;
    if (!data) return;

    const { file, fileName } = data;

    if (file instanceof Blob) {
      const url = URL.createObjectURL(file);
      this.triggerDownload(url, fileName);
      URL.revokeObjectURL(url);
      return;
    }

    if (typeof file === 'string' && file.startsWith('data:')) {
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

    console.error('Unsupported file format', file);
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
