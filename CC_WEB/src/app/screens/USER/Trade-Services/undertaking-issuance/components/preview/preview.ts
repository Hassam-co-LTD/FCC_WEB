import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { NgIf } from '@angular/common';
// --- SERVICE IMPORT ---
import { 
  UndertakingIssuanceService
} from '../../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';
import { UndertakingGuarantee } from '../../../../../../core/models/undertaking-lc';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../../../../core/services/api.service';
import { RejectDialogComponent } from '../../../../../../shared/reject-dialog/reject-dialog';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    DecimalPipe,
    MatDividerModule,
    NgIf,
  ],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
})
export class Preview implements OnInit {
  @Input() transaction!: UndertakingGuarantee;
  viewMode: 'submit' | 'readonly' = 'submit';
  undertakingForm!: FormGroup;
  isOpen = true;
  viewerOpen = false;
  viewerContent: SafeResourceUrl | null = null;
  isImage = false;
  isPdf = false;

  currentTx: UndertakingGuarantee | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private dialog: MatDialog,
    private transactionService: UndertakingIssuanceService,
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
      this.router.navigate(['/dashboard/Trade-Services/undertaking-issuance']);
      return;
    }
    this.viewMode = this.transactionService.getViewMode();
    this.initForm();
  }

  private initForm(): void {
    this.undertakingForm = this.fb.group({
      id: [this.currentTx!.id],
      tnxId: [this.currentTx!.tnxId],
      status: [this.currentTx!.status],
      createdOn: [this.currentTx!.createdOn],
      productType: [this.currentTx!.productType],
      modeOfTransmission: [this.currentTx!.modeOfTransmission],
      formOfUndertaking: [this.currentTx!.formOfUndertaking],
      purpose: [this.currentTx!.purpose],
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
      recipientBankName: [this.currentTx!.recipientBankName],
      issuerReference: [this.currentTx!.issuerReference],
      issuanceType: [this.currentTx!.issuanceType],
      swiftcode: [this.currentTx!.swiftcode],
      bankName: [this.currentTx!.bankName],
      bankAddress1: [this.currentTx!.bankAddress1],
      bankAddress2: [this.currentTx!.bankAddress2],
      bankAddress3: [this.currentTx!.bankAddress3],
      bankAddress4: [this.currentTx!.bankAddress4],
      bankCountry: [this.currentTx!.bankCountry],
      typeOfUndertaking: [this.currentTx!.typeOfUndertaking],
      effectiveOption: [this.currentTx!.effectiveOption],
      expiryType: [this.currentTx!.expiryType],
      expiryDate: [this.currentTx!.expiryDate],
      currency: [this.currentTx!.currency],
      undertakingAmount: [this.currentTx!.undertakingAmount],
      variationPlus: [this.currentTx!.variationPlus],
      variationMinus: [this.currentTx!.variationMinus],
      issuanceCharges: [this.currentTx!.issuanceCharges],
      correspondentCharges: [this.currentTx!.correspondentCharges],
      supplementaryInfo: [this.currentTx!.supplementaryInfo],
      textOfUndertakingInfo: [this.currentTx!.textOfUndertakingInfo],
      underlyingTransactionInfo: [this.currentTx!.underlyingTransactionInfo],
      presentationInfo: [this.currentTx!.presentationInfo],
      basicExtensionType: [this.currentTx!.basicExtensionType],
      increaseDecreaseType: [this.currentTx!.increaseDecreaseType],
      contractType: [this.currentTx!.contractType],
      contractDate: [this.currentTx!.contractDate],
      contractCurrency: [this.currentTx!.contractCurrency],
      contractAmount: [this.currentTx!.contractAmount],
      percentageCovered: [this.currentTx!.percentageCovered],
      contractNarrative: [this.currentTx!.contractNarrative],
      applicableRules: [this.currentTx!.applicableRules],
      countrySubdivision: [this.currentTx!.countrySubdivision],
      jurisdiction: [this.currentTx!.jurisdiction],
      demandOption: [this.currentTx!.demandOption],
      governingLawsType: [this.currentTx!.governingLawsType],
      languageType: [this.currentTx!.languageType],
      tsOption: [this.currentTx!.tsOption],
      deliveryType: [this.currentTx!.deliveryType],
      deliveryMode: [this.currentTx!.deliveryMode],
      deliveryTo: [this.currentTx!.deliveryTo],
      principalAccount: [this.currentTx!.principalAccount],
      feeAccount: [this.currentTx!.feeAccount],
      otherInstructions: [this.currentTx!.otherInstructions],
      // attachments: this.fb.array(this.currentTx!.attachments ?? [])
    });

    // 🔒 Read-only mode (Success page)
    if (this.viewMode === 'readonly') {
      this.undertakingForm.disable({ emitEvent: false });
    }
  }

  get attachmentsArray(): FormArray {
    return this.undertakingForm.get('attachments') as FormArray;
  }

  back() {
    this.router.navigate([
      '/dashboard/Trade-Services/undertaking-issuance/inquiries-records',
    ]);
  }

  /** SUBMIT */
  submitForm(): void {
    if (!this.hasPermission('UTG_AmendPreviewSubmit')) {
      console.warn('Submit blocked: missing UTG_AmendPreviewSubmit permission');

     
      return;
    }

    if (this.viewMode === 'readonly') return;

    const tnxId = this.currentTx?.tnxId;
    if (!tnxId) {
      this.snackBar.open('Transaction ID missing', 'Close', { duration: 3000 });
      return;
    }

    this.api.submitUndertaking(tnxId, this.currentTx!).subscribe({
      next: (res) => {
        this.router.navigate(
          ['/dashboard/Trade-Services/undertaking-issuance/success'],
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
    if (!this.hasPermission('UTG_AmendPreviewApprove')) {
      console.warn(
        'Approve blocked: missing UTG_AmendPreviewApprove permission',
      );

      this.snackBar.open(
        'You do not have permission to approve this transaction.',
        'Close',
        { duration: 3000 },
      );

      return;
    }
    if (!this.currentTx?.tnxId) return;

    this.api
      .approveUndertaking(this.currentTx.tnxId, this.currentTx)
      .subscribe({
        next: (res) => {
          this.snackBar.open('Transaction approved', 'Close', {
            duration: 3000,
          });
          this.router.navigate(
            ['/dashboard/Trade-Services/undertaking-issuance/success'],
            { state: { transaction: res } },
          );
        },
        error: () =>
          this.snackBar.open('Error approving transaction', 'Close', {
            duration: 3000,
          }),
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
    if (!this.hasPermission('UTG_AmendPreviewReject')) {
      console.warn('Reject blocked: missing UTG_AmendPreviewReject permission');

      this.snackBar.open(
        'You do not have permission to reject this transaction.',
        'Close',
        { duration: 3000 },
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
      this.api.rejectUndertaking(tnxId, reason).subscribe({
        next: (res) => {
          this.snackBar.open('Transaction rejected successfully', 'Close', {
            duration: 3000,
          });
          this.router.navigate(
            ['/dashboard/Trade-Services/undertaking-issuance/success'],
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

  // ==========================================
  //  HELPERS
  // ==========================================

  private showSuccess(msg: string) {
    this.snackBar.open(`${msg} - ${this.currentTx?.id}`, 'Close', {
      duration: 4000,
      panelClass: ['success-snackbar'],
    });
  }

  private showError(action: string, err: any) {
    console.error(err);
    this.snackBar.open(
      `Failed to ${action} transaction. Server might be down.`,
      'Close',
      { duration: 3000 },
    );
  }

  // ==========================================
  //  FILE DOWNLOAD
  // ==========================================
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
