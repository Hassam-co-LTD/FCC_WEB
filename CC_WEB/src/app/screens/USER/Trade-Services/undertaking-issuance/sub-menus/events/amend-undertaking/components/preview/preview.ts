import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { UndertakingIssuanceService } from '../../../../../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';
import { UndertakingGuarantee } from '../../../../../../../../../core/models/undertaking-lc';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../../../../../../../core/services/api.service';
import { RejectDialogComponent } from '../../../../../../../../../shared/reject-dialog/reject-dialog';

@Component({
  selector: 'app-preview',
  imports: [],
  templateUrl: './preview.html',
  styleUrl: './preview.scss',
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

  // =========================================================
  // PERMISSIONS
  // =========================================================

  permissionNames: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private dialog: MatDialog,
    private transactionService: UndertakingIssuanceService,
  ) {}

  ngOnInit(): void {
    // =========================================================
    // LOAD PERMISSIONS
    // =========================================================

    const sessionData = JSON.parse(
      sessionStorage.getItem('userData') || '{}',
    );

    this.permissionNames = Array.isArray(sessionData.permissionNames)
      ? sessionData.permissionNames
      : [];

    console.log(
      'UTG Preview Permission Names:',
      this.permissionNames,
    );

    // =========================================================
    // LOAD TRANSACTION
    // =========================================================

    this.currentTx =
      this.transaction ||
      this.transactionService.getCurrentTransaction();

    if (!this.currentTx) {
      console.error('Preview: No transaction data found');

      this.router.navigate([
        '/dashboard/Trade-Services/undertaking-issuance',
      ]);

      return;
    }

    this.viewMode = this.transactionService.getViewMode();

    this.initForm();
  }

  // =========================================================
  // PERMISSION CHECK
  // =========================================================

  hasPermission(permission: string): boolean {
    return this.permissionNames.some(
      (p) =>
        p?.trim().toLowerCase() ===
        permission.trim().toLowerCase(),
    );
  }

  // =========================================================
  // FORM INITIALIZATION
  // =========================================================

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
      textOfUndertakingInfo: [
        this.currentTx!.textOfUndertakingInfo,
      ],
      underlyingTransactionInfo: [
        this.currentTx!.underlyingTransactionInfo,
      ],
      presentationInfo: [this.currentTx!.presentationInfo],

      basicExtensionType: [
        this.currentTx!.basicExtensionType,
      ],
      increaseDecreaseType: [
        this.currentTx!.increaseDecreaseType,
      ],

      contractType: [this.currentTx!.contractType],
      contractDate: [this.currentTx!.contractDate],
      contractCurrency: [this.currentTx!.contractCurrency],
      contractAmount: [this.currentTx!.contractAmount],
      percentageCovered: [this.currentTx!.percentageCovered],
      contractNarrative: [this.currentTx!.contractNarrative],

      applicableRules: [this.currentTx!.applicableRules],
      countrySubdivision: [
        this.currentTx!.countrySubdivision,
      ],
      jurisdiction: [this.currentTx!.jurisdiction],
      demandOption: [this.currentTx!.demandOption],
      governingLawsType: [
        this.currentTx!.governingLawsType,
      ],
      languageType: [this.currentTx!.languageType],
      tsOption: [this.currentTx!.tsOption],

      deliveryType: [this.currentTx!.deliveryType],
      deliveryMode: [this.currentTx!.deliveryMode],
      deliveryTo: [this.currentTx!.deliveryTo],
      principalAccount: [this.currentTx!.principalAccount],
      feeAccount: [this.currentTx!.feeAccount],
      otherInstructions: [
        this.currentTx!.otherInstructions,
      ],

      // =====================================================
      // ATTACHMENTS
      // =====================================================

      attachments: this.fb.array(
        ((this.currentTx as any).attachments || []).map(
          (attachment: any) =>
            this.fb.group({
              id: [attachment.id],
              type: [attachment.type],
              fileName: [attachment.fileName],
              size: [attachment.size],
              file: [attachment.file],
            }),
        ),
      ),
    });

    // =========================================================
    // READ-ONLY MODE
    // =========================================================

    if (this.viewMode === 'readonly') {
      this.undertakingForm.disable({
        emitEvent: false,
      });
    }
  }

  // =========================================================
  // ATTACHMENTS
  // =========================================================

  get attachmentsArray(): FormArray {
    return this.undertakingForm.get(
      'attachments',
    ) as FormArray;
  }

  // =========================================================
  // BACK
  // =========================================================

  back(): void {
    this.router.navigate([
      '/dashboard/Trade-Services/undertaking-issuance/inquiries-records',
    ]);
  }

  // =========================================================
  // SUBMIT
  // Permission:
  // UTG_AmendPreviewSubmit
  // =========================================================

  submitForm(): void {
    if (!this.hasPermission('UTG_AmendPreviewSubmit')) {
      console.warn(
        'User does not have UTG_AmendPreviewSubmit permission',
      );

      this.snackBar.open(
        'You do not have permission to submit this transaction',
        'Close',
        {
          duration: 3000,
        },
      );

      return;
    }

    if (this.viewMode === 'readonly') {
      return;
    }

    const tnxId = this.currentTx?.tnxId;

    if (!tnxId) {
      this.snackBar.open(
        'Transaction ID missing',
        'Close',
        {
          duration: 3000,
        },
      );

      return;
    }

    this.api
      .submitUtgAmendment(
        tnxId,
        this.currentTx!,
      )
      .subscribe({
        next: (res) => {
          this.router.navigate(
            [
              '/dashboard/Trade-Services/undertaking-issuance/success',
            ],
            {
              state: {
                transaction: res,
              },
            },
          );
        },

        error: () => {
          this.snackBar.open(
            'Error submitting transaction',
            'Close',
            {
              duration: 3000,
            },
          );
        },
      });
  }

  // =========================================================
  // APPROVE
  // Permission:
  // UTG_AmendPreviewApprove
  // =========================================================

  approveTransaction(): void {
    if (!this.hasPermission('UTG_AmendPreviewApprove')) {
      console.warn(
        'User does not have UTG_AmendPreviewApprove permission',
      );

      this.snackBar.open(
        'You do not have permission to approve this transaction',
        'Close',
        {
          duration: 3000,
        },
      );

      return;
    }

    if (this.viewMode === 'readonly') {
      return;
    }

    if (!this.currentTx?.tnxId) {
      this.snackBar.open(
        'Transaction ID missing',
        'Close',
        {
          duration: 3000,
        },
      );

      return;
    }

    this.api
      .approveUtgAmendment(
        this.currentTx.tnxId,
        this.currentTx,
      )
      .subscribe({
        next: (res) => {
          this.snackBar.open(
            'Transaction approved',
            'Close',
            {
              duration: 3000,
            },
          );

          this.router.navigate(
            [
              '/dashboard/Trade-Services/undertaking-issuance/success',
            ],
            {
              state: {
                transaction: res,
              },
            },
          );
        },

        error: () => {
          this.snackBar.open(
            'Error approving transaction',
            'Close',
            {
              duration: 3000,
            },
          );
        },
      });
  }

  // =========================================================
  // REJECT
  // Permission:
  // UTG_AmendPreviewReject
  // =========================================================

  rejectTransaction(): void {
    if (!this.hasPermission('UTG_AmendPreviewReject')) {
      console.warn(
        'User does not have UTG_AmendPreviewReject permission',
      );

      this.snackBar.open(
        'You do not have permission to reject this transaction',
        'Close',
        {
          duration: 3000,
        },
      );

      return;
    }

    if (this.viewMode === 'readonly') {
      return;
    }

    const tnxId = this.currentTx?.tnxId;

    if (!tnxId) {
      this.snackBar.open(
        'Transaction ID missing',
        'Close',
        {
          duration: 3000,
        },
      );

      return;
    }

    const dialogRef = this.dialog.open(
      RejectDialogComponent,
      {
        width: '400px',
        hasBackdrop: true,
        backdropClass:
          'cdk-overlay-dark-backdrop',
        panelClass:
          'custom-dialog-container',
      },
    );

    dialogRef
      .afterClosed()
      .subscribe(
        (
          reason: string | undefined,
        ) => {
          if (!reason) {
            return;
          }

          this.api
            .rejectUtgAmendment(
              tnxId,
              reason,
            )
            .subscribe({
              next: (res) => {
                this.snackBar.open(
                  'Transaction rejected successfully',
                  'Close',
                  {
                    duration: 3000,
                  },
                );

                this.router.navigate(
                  [
                    '/dashboard/Trade-Services/undertaking-issuance/success',
                  ],
                  {
                    state: {
                      transaction: res,
                    },
                  },
                );
              },

              error: () => {
                this.snackBar.open(
                  'Error rejecting transaction',
                  'Close',
                  {
                    duration: 3000,
                  },
                );
              },
            });
        },
      );
  }

  // =========================================================
  // FILE DOWNLOAD
  // Permission:
  // UTG_AmendPreviewDownload
  // =========================================================

  downloadFile(index: number): void {
    if (!this.hasPermission('UTG_AmendPreviewDownload')) {
      console.warn(
        'User does not have UTG_AmendPreviewDownload permission',
      );

      this.snackBar.open(
        'You do not have permission to download attachments',
        'Close',
        {
          duration: 3000,
        },
      );

      return;
    }

    const attachment =
      this.attachmentsArray.at(index)?.value;

    if (!attachment) {
      return;
    }

    const { file, fileName } = attachment;

    if (file instanceof Blob) {
      const url =
        URL.createObjectURL(file);

      this.triggerDownload(
        url,
        fileName,
      );

      URL.revokeObjectURL(url);

      return;
    }

    if (
      typeof file === 'string' &&
      file.startsWith('currentTx:')
    ) {
      const arr = file.split(',');

      const mime =
        arr[0].match(
          /:(.*?);/,
        )?.[1] ?? '';

      const bstr = atob(arr[1]);

      const u8arr =
        new Uint8Array(
          bstr.length,
        );

      for (
        let n = 0;
        n < bstr.length;
        n++
      ) {
        u8arr[n] =
          bstr.charCodeAt(n);
      }

      const blob =
        new Blob(
          [u8arr],
          {
            type: mime,
          },
        );

      const url =
        URL.createObjectURL(blob);

      this.triggerDownload(
        url,
        fileName,
      );

      URL.revokeObjectURL(url);

      return;
    }

    console.error(
      'Unsupported file format',
      file,
    );
  }

  // =========================================================
  // TRIGGER DOWNLOAD
  // =========================================================

  private triggerDownload(
    url: string,
    fileName: string,
  ): void {
    const a =
      document.createElement('a');

    a.href = url;
    a.download =
      fileName || 'download';

    document.body.appendChild(a);

    a.click();

    a.remove();
  }

  // =========================================================
  // HELPERS
  // =========================================================

  private showSuccess(
    msg: string,
  ): void {
    this.snackBar.open(
      `${msg} - ${this.currentTx?.id}`,
      'Close',
      {
        duration: 4000,
        panelClass: [
          'success-snackbar',
        ],
      },
    );
  }

  private showError(
    action: string,
    err: any,
  ): void {
    console.error(err);

    this.snackBar.open(
      `Failed to ${action} transaction. Server might be down.`,
      'Close',
      {
        duration: 3000,
      },
    );
  }

  trackByIndex(
    index: number,
    item: any,
  ): any {
    return item?.id || index;
  }
}