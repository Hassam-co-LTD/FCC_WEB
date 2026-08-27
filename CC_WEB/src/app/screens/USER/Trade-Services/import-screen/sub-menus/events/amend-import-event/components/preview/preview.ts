import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ImportLcTransaction } from '../../../../../../../../../core/models/import-lc';
import { Router } from '@angular/router';
import { MatCard } from '@angular/material/card';
import { HttpClientModule } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../../../../../../../core/services/api.service';
import { ImportlcFormTransactionService } from '../../../../../../../../../core/services/user-service/importlc-form-transaction-service/importlc-form-transaction-service';
import { RejectDialogComponent } from '../../../../../../../../../shared/reject-dialog/reject-dialog';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
  imports: [
    CommonModule,
    MatIcon,
    DecimalPipe,
    MatCard,
    HttpClientModule,
    MatDialogModule
  ],
  standalone: true,
})
export class Preview {
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
    this.currentTx =
      this.transaction ||
      this.transactionService.getCurrentTransaction();

    const sessionData = JSON.parse(
      sessionStorage.getItem('userData') || '{}'
    );

    this.permissionNames = sessionData.permissionNames || [];

    if (!this.currentTx) {
      console.error('Preview: No transaction data found');
      this.router.navigate([
        '/dashboard/Trade-Services/import-screen/amend'
      ]);
      return;
    }

    this.viewMode = this.transactionService.getViewMode();
    this.initForm();
  }

  hasPermission(permission: string): boolean {
    return this.permissionNames.some(
      p => p.trim().toLowerCase() === permission.toLowerCase()
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
      applicableRules: [this.currentTx!.applicableRules],
      confirmationInstruction: [this.currentTx!.confirmationInstruction],
      featureIrrevocable: [this.currentTx!.featureIrrevocable],
      featureRevolving: [this.currentTx!.featureRevolving],
      featureTransferable: [this.currentTx!.featureTransferable],

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
      issuingBankCharges: [this.currentTx!.issuingBankCharges],
      outsideCountryCharges: [this.currentTx!.outsideCountryCharges],

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
    this.router.navigate([
      '/dashboard/Trade-Services/import-screen/approved-inquiry-records'
    ]);
  }

  submitLc(): void {
    if (!this.hasPermission('ILC_AmendSubmit')) return;

    if (this.viewMode === 'readonly') return;

    const tnxId = this.currentTx?.tnxId;

    if (!tnxId) {
      this.snackBar.open('Transaction ID missing', 'Close', {
        duration: 3000
      });
      return;
    }

    this.api.submitAmendment(tnxId, this.currentTx!).subscribe({
      next: (res) => {
        this.router.navigate([
          '/dashboard/Trade-Services/import-screen/success'
        ], {
          state: { transaction: res }
        });
      },
      error: () => {
        this.snackBar.open(
          'Error submitting transaction',
          'Close',
          { duration: 3000 }
        );
      }
    });
  }

  approveTransaction(): void {
    if (!this.hasPermission('ILC_AmendApprove')) return;

    if (!this.currentTx?.tnxId) return;

    this.api.approveAmendment(
      this.currentTx.tnxId,
      this.currentTx
    ).subscribe({
      next: (res) => {
        this.snackBar.open(
          'Transaction approved',
          'Close',
          { duration: 3000 }
        );

        this.router.navigate([
          '/dashboard/Trade-Services/import-screen/success'
        ], {
          state: { transaction: res }
        });
      },
      error: () => {
        this.snackBar.open(
          'Error approving transaction',
          'Close',
          { duration: 3000 }
        );
      }
    });
  }

  rejectTransaction(): void {
    if (!this.hasPermission('ILC_AmendReject')) return;

    const tnxId = this.currentTx?.tnxId;

    if (!tnxId) return;

    const dialogRef = this.dialog.open(
      RejectDialogComponent,
      {
        width: '400px',
        hasBackdrop: true,
        backdropClass: 'cdk-overlay-dark-backdrop',
        panelClass: 'custom-dialog-container'
      }
    );

    dialogRef.afterClosed().subscribe(
      (reason: string | undefined) => {
        if (!reason) return;

        this.api.rejectAmendment(tnxId, reason).subscribe({
          next: (res) => {
            this.snackBar.open(
              'Transaction rejected successfully',
              'Close',
              { duration: 3000 }
            );

            this.router.navigate([
              '/dashboard/Trade-Services/import-screen/success'
            ], {
              state: { transaction: res }
            });
          },
          error: () => {
            this.snackBar.open(
              'Error rejecting transaction',
              'Close',
              { duration: 3000 }
            );
          }
        });
      }
    );
  }

  downloadFile(index: number): void {
    if (!this.hasPermission('ILCAmendPreview')) {
      return;
    }

    const data = this.attachmentsArray.at(index)?.value;

    if (!data) return;

    const { file, fileName } = data;

    if (file instanceof Blob) {
      const url = URL.createObjectURL(file);
      this.triggerDownload(url, fileName);
      URL.revokeObjectURL(url);
      return;
    }

    if (
      typeof file === 'string' &&
      file.startsWith('data:')
    ) {
      const arr = file.split(',');
      const mime =
        arr[0].match(/:(.*?);/)?.[1] ?? '';

      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);

      for (let n = 0; n < bstr.length; n++) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      const blob = new Blob([u8arr], {
        type: mime
      });

      const url = URL.createObjectURL(blob);
      this.triggerDownload(url, fileName);
      URL.revokeObjectURL(url);
      return;
    }

    console.error('Unsupported file format', file);
  }

  private triggerDownload(
    url: string,
    fileName: string
  ): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  }

  trackByIndex(
    index: number,
    item: any
  ): any {
    return item?.id || index;
  }
}