import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule, DecimalPipe } from '@angular/common';

import { MatIcon } from '@angular/material/icon';
import { MatCard } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { ApiService } from '../../../../../../core/services/api.service';

import { ImportlcFormTransactionService } from '../../../../../../core/services/user-service/importlc-form-transaction-service/importlc-form-transaction-service';

import { ImportLcTransaction } from '../../../../../../core/models/import-lc';

import { RejectDialogComponent } from '../../../../../../shared/reject-dialog/reject-dialog';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
  imports: [
    CommonModule,
    MatIcon,
    DecimalPipe,
    MatCard,
    MatButtonModule,
    HttpClientModule,
    MatDialogModule
  ],
  standalone: true
})
export class Preview implements OnInit {
  @Input() transaction!: ImportLcTransaction;

  viewMode: 'submit' | 'readonly' = 'submit';

  importForm!: FormGroup;

  isOpen = true;
  viewerOpen = false;
  viewerContent: SafeResourceUrl | null = null;
  isImage = false;
  isPdf = false;
  currentTx: ImportLcTransaction | null = null;

  permissionNames: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private dialog: MatDialog,
    private transactionService: ImportlcFormTransactionService
  ) {}

  ngOnInit(): void {
    // Get permissions from session
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    this.permissionNames = userData.permissionNames || [];

    this.currentTx =
      this.transaction || this.transactionService.getCurrentTransaction();

    if (!this.currentTx) {
      console.error('Preview: No transaction data found');
      this.router.navigate(['/import-screen']);
      return;
    }

    this.viewMode = this.transactionService.getViewMode();
    this.initForm();
  }

  hasPermission(permission: string): boolean {
    return this.permissionNames.some(
      (p) => p.trim().toLowerCase() === permission.toLowerCase(),
    );
  }

  private initForm(): void {
    this.importForm = this.fb.group({
      id: [this.currentTx!.id],
      tnxId: [this.currentTx!.tnxId],
      status: [this.currentTx!.status],
      createdOn: [this.currentTx!.createdOn],

      productType: [this.currentTx!.productType],
      modeOfTransmission: [this.currentTx!.modeOfTransmission],
      expiryDate: [this.currentTx!.expiryDate],
      placeOfExpiry: [this.currentTx!.placeOfExpiry],
      featureIrrevocable: [this.currentTx!.featureIrrevocable],
      featureRevolving: [this.currentTx!.featureRevolving],
      featureTransferable: [this.currentTx!.featureTransferable],
      applicableRules: [this.currentTx!.applicableRules],
      confirmationInstruction: [this.currentTx!.confirmationInstruction],

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
      beneficiaryCountry: [this.currentTx!.beneficiaryCountry],

      issuingBankName: [this.currentTx!.issuingBankName],
      issuerReference: [this.currentTx!.issuerReference],
      advisingBankName: [this.currentTx!.advisingBankName],
      adviseThroughBankName: [this.currentTx!.adviseThroughBankName],

      currency: [this.currentTx!.currency],
      amount: [this.currentTx!.amount],
      additionalAmount: [this.currentTx!.additionalAmount],
      variationType: [this.currentTx!.variationType],
      variationPlus: [this.currentTx!.variationPlus],
      variationMinus: [this.currentTx!.variationMinus],

      creditAvailableWith: [this.currentTx!.creditAvailableWith],
      bankName: [this.currentTx!.bankName],
      creditAvailableBy: [this.currentTx!.creditAvailableBy],
      paymentDraftAt: [this.currentTx!.paymentDraftAt],

      shipmentFrom: [this.currentTx!.shipmentFrom],
      shipmentTo: [this.currentTx!.shipmentTo],
      placeOfLoading: [this.currentTx!.placeOfLoading],
      placeOfDischarge: [this.currentTx!.placeOfDischarge],
      lastShipmentDate: [this.currentTx!.lastShipmentDate],
      shipmentPeriodNarrative: [this.currentTx!.shipmentPeriodNarrative],
      partialShipment: [this.currentTx!.partialShipment],
      transhipment: [this.currentTx!.transhipment],

      descriptionOfGoods: [this.currentTx!.descriptionOfGoods],
      documentsRequired: [this.currentTx!.documentsRequired],
      additionalInstructions: [this.currentTx!.additionalInstructions],
      otherDetails: [this.currentTx!.otherDetails],

      principalAccount: [this.currentTx!.principalAccount],
      feeAccount: [this.currentTx!.feeAccount],
      otherInstructions: [this.currentTx!.otherInstructions],

      attachments: this.fb.array(this.currentTx!.attachments ?? [])
    });

    if (this.viewMode === 'readonly') {
      this.importForm.disable({ emitEvent: false });
    }
  }

  get attachmentsArray(): FormArray {
    return this.importForm.get('attachments') as FormArray;
  }

  back(): void {
    if (!this.hasPermission('ILC_Inquiry')) {
      this.snackBar.open(
        'You do not have permission to view Import LC records.',
        'Close',
        { duration: 3000 },
      );
      return;
    }

    this.router.navigate(['/dashboard/Trade-Services/import-screen/inquiries']);
  }

  submitLc(): void {
    if (!this.hasPermission('ILC_InquirySubmit')) {
      this.snackBar.open(
        'You do not have permission to submit an Import LC.',
        'Close',
        { duration: 3000 },
      );
      return;
    }

    if (this.viewMode === 'readonly') return;

    const tnxId = this.currentTx?.tnxId;

    if (!tnxId) {
      this.snackBar.open('Transaction ID missing', 'Close', { duration: 3000 });
      return;
    }

    this.api.submitTransaction(tnxId, this.currentTx!).subscribe({
      next: (res) => {
        this.router.navigate(
          ['/dashboard/Trade-Services/import-screen/success'],
          { state: { transaction: res } },
        );
      },
      error: (error) => {
        console.error('Error submitting transaction:', error);
        this.snackBar.open('Error submitting transaction', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  approveTransaction(): void {
    if (!this.hasPermission('ILC_InquiryApprove')) {
      this.snackBar.open(
        'You do not have permission to approve an Import LC.',
        'Close',
        { duration: 3000 },
      );
      return;
    }

    const tnxId = this.currentTx?.tnxId;

    if (!tnxId) {
      this.snackBar.open('Transaction ID missing', 'Close', { duration: 3000 });
      return;
    }

    this.api.approveTransaction(tnxId, this.currentTx!).subscribe({
      next: (res) => {
        this.snackBar.open('Transaction approved', 'Close', { duration: 3000 });

        this.router.navigate(
          ['/dashboard/Trade-Services/import-screen/success'],
          { state: { transaction: res } },
        );
      },
      error: (error) => {
        console.error('Error approving transaction:', error);
        this.snackBar.open('Error approving transaction', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  rejectTransaction(): void {
    if (!this.hasPermission('ILC_InquiryReject')) {
      this.snackBar.open(
        'You do not have permission to reject an Import LC.',
        'Close',
        { duration: 3000 },
      );
      return;
    }

    const tnxId = this.currentTx?.tnxId;

    if (!tnxId) {
      this.snackBar.open('Transaction ID missing', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: '400px',
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe((reason: string | undefined) => {
      if (!reason) return;

      this.api.rejectTransaction(tnxId, reason).subscribe({
        next: (res) => {
          this.snackBar.open('Transaction rejected successfully', 'Close', {
            duration: 3000,
          });

          this.router.navigate(
            ['/dashboard/Trade-Services/import-screen/success'],
            { state: { transaction: res } },
          );
        },
        error: (error) => {
          console.error('Error rejecting transaction:', error);
          this.snackBar.open('Error rejecting transaction', 'Close', {
            duration: 3000,
          });
        }
      });
    });
  }

  downloadFile(index: number): void {
    if (!this.hasPermission('ILC_InquiryPreview')) {
      this.snackBar.open(
        'You do not have permission to download attachments.',
        'Close',
        { duration: 3000 },
      );
      return;
    }

    const currentAttachment = this.attachmentsArray.at(index)?.value;

    if (!currentAttachment) return;

    const { file, fileName } = currentAttachment;

    if (file instanceof Blob) {
      const url = URL.createObjectURL(file);
      this.triggerDownload(url, fileName);
      URL.revokeObjectURL(url);
      return;
    }

    if (typeof file === 'string' && file.startsWith('currentTx:')) {
      const arr = file.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] ?? '';

      try {
        const bstr = atob(arr[1]);
        const u8arr = new Uint8Array(bstr.length);

        for (let n = 0; n < bstr.length; n++) {
          u8arr[n] = bstr.charCodeAt(n);
        }

        const blob = new Blob([u8arr], { type: mime });
        const url = URL.createObjectURL(blob);

        this.triggerDownload(url, fileName);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error decoding attachment:', error);
        this.snackBar.open('Unable to download attachment', 'Close', {
          duration: 3000,
        });
      }
      return;
    }

    console.error('Unsupported file format', file);
    this.snackBar.open('Unsupported file format', 'Close', { duration: 3000 });
  }

  private triggerDownload(url: string, fileName: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'attachment';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  trackByIndex(index: number, item: any): any {
    return item?.id || index;
  }
}