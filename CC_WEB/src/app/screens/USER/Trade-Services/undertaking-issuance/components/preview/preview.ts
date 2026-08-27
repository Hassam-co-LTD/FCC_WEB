import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import {
  UndertakingIssuanceService
} from '../../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';

import { UndertakingGuarantee } from '../../../../../../core/models/undertaking-lc';
import {
  FormArray,
  FormBuilder,
  FormGroup
} from '@angular/forms';

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
    DatePipe,
    MatDividerModule
  ],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss']
})
export class Preview implements OnInit {

  // =========================================================
  // INPUT
  // =========================================================

  @Input() transaction!: UndertakingGuarantee;

  // =========================================================
  // VIEW MODE
  // =========================================================

  viewMode: 'submit' | 'readonly' = 'submit';

  // =========================================================
  // FORM
  // =========================================================

  undertakingForm!: FormGroup;

  // =========================================================
  // VIEWER
  // =========================================================

  isOpen = true;
  viewerOpen = false;
  viewerContent: SafeResourceUrl | null = null;
  isImage = false;
  isPdf = false;

  // =========================================================
  // CURRENT TRANSACTION
  // =========================================================

  currentTx: UndertakingGuarantee | null = null;

  // =========================================================
  // PERMISSIONS
  // =========================================================

  permissionGroupName = '';

  permissions: string[] = [];

  canSubmit = false;
  canReject = false;
  canApprove = false;
  canDownload = false;

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private dialog: MatDialog,
    private transactionService: UndertakingIssuanceService
  ) {}

  // =========================================================
  // ON INIT
  // =========================================================

  ngOnInit(): void {

    // ---------------------------------------------------------
    // LOAD PERMISSIONS FIRST
    // ---------------------------------------------------------

    this.loadPermissions();

    // ---------------------------------------------------------
    // GET CURRENT TRANSACTION
    // ---------------------------------------------------------

    this.currentTx =
      this.transaction
      ||
      this.transactionService.getCurrentTransaction();

    if (!this.currentTx) {

      console.error(
        'Preview: No transaction data found'
      );

      this.router.navigate([
        '/dashboard/Trade-Services/undertaking-issuance'
      ]);

      return;
    }

    // ---------------------------------------------------------
    // VIEW MODE
    // ---------------------------------------------------------

    this.viewMode =
      this.transactionService.getViewMode();

    // ---------------------------------------------------------
    // INITIALIZE FORM
    // ---------------------------------------------------------

    this.initForm();
  }

  // =========================================================
  // LOAD PERMISSIONS
  // =========================================================

  private loadPermissions(): void {

    // ---------------------------------------------------------
    // PERMISSION GROUP
    // ---------------------------------------------------------

    this.permissionGroupName =
      sessionStorage.getItem('permissionGroupName') || '';

    // ---------------------------------------------------------
    // PERMISSION JSON
    // ---------------------------------------------------------

    const permissionJson =
      sessionStorage.getItem('permissions');

    console.log(
      '========== UNDERTAKING PERMISSIONS =========='
    );

    console.log(
      'Permission Group:',
      this.permissionGroupName
    );

    console.log(
      'Permission JSON:',
      permissionJson
    );

    // ---------------------------------------------------------
    // RESET
    // ---------------------------------------------------------

    this.permissions = [];

    // ---------------------------------------------------------
    // PARSE PERMISSIONS
    // ---------------------------------------------------------

    if (permissionJson) {

      try {

        const parsedPermissions =
          JSON.parse(permissionJson);

        if (Array.isArray(parsedPermissions)) {

          this.permissions =
            parsedPermissions;

        } else {

          this.permissions = [];

        }

      } catch (error) {

        console.error(
          'Error parsing permissions:',
          error
        );

        this.permissions = [];
      }
    }

    // ---------------------------------------------------------
    // PERMISSION GROUP CHECK
    // ---------------------------------------------------------

    const isUndertaking =
      this.permissionGroupName === 'Undertaking_Guarantee';

    // ---------------------------------------------------------
    // INDIVIDUAL PERMISSIONS
    // ---------------------------------------------------------

    this.canSubmit =
      isUndertaking &&
      this.permissions.includes(
        'UTG_AmendPreviewSubmit'
      );

    this.canReject =
      isUndertaking &&
      this.permissions.includes(
        'UTG_AmendPreviewReject'
      );

    this.canApprove =
      isUndertaking &&
      this.permissions.includes(
        'UTG_AmendPreviewApprove'
      );

    this.canDownload =
      isUndertaking &&
      this.permissions.includes(
        'UTG_AmendPreviewDownload'
      );

    // ---------------------------------------------------------
    // DEBUG
    // ---------------------------------------------------------

    console.log(
      'Permissions:',
      this.permissions
    );

    console.log(
      'Can Submit:',
      this.canSubmit
    );

    console.log(
      'Can Reject:',
      this.canReject
    );

    console.log(
      'Can Approve:',
      this.canApprove
    );

    console.log(
      'Can Download:',
      this.canDownload
    );

    console.log(
      '=============================================='
    );
  }

  // =========================================================
  // GENERIC PERMISSION CHECK
  // =========================================================

  hasPermission(permission: string): boolean {

    return (
      this.permissions.includes(permission)
    );
  }

  // =========================================================
  // INITIALIZE FORM
  // =========================================================

  private initForm(): void {

    this.undertakingForm =
      this.fb.group({

        id: [
          this.currentTx!.id
        ],

        tnxId: [
          this.currentTx!.tnxId
        ],

        status: [
          this.currentTx!.status
        ],

        createdOn: [
          this.currentTx!.createdOn
        ],

        productType: [
          this.currentTx!.productType
        ],

        modeOfTransmission: [
          this.currentTx!.modeOfTransmission
        ],

        formOfUndertaking: [
          this.currentTx!.formOfUndertaking
        ],

        purpose: [
          this.currentTx!.purpose
        ],

        applicantName: [
          this.currentTx!.applicantName
        ],

        applicantAddress1: [
          this.currentTx!.applicantAddress1
        ],

        applicantAddress2: [
          this.currentTx!.applicantAddress2
        ],

        applicantAddress3: [
          this.currentTx!.applicantAddress3
        ],

        applicantAddress4: [
          this.currentTx!.applicantAddress4
        ],

        applicantCountry: [
          this.currentTx!.applicantCountry
        ],

        beneficiaryName: [
          this.currentTx!.beneficiaryName
        ],

        beneficiaryAddress1: [
          this.currentTx!.beneficiaryAddress1
        ],

        beneficiaryAddress2: [
          this.currentTx!.beneficiaryAddress2
        ],

        beneficiaryAddress3: [
          this.currentTx!.beneficiaryAddress3
        ],

        beneficiaryAddress4: [
          this.currentTx!.beneficiaryAddress4
        ],

        beneficiaryCountry: [
          this.currentTx!.beneficiaryCountry
        ],

        recipientBankName: [
          this.currentTx!.recipientBankName
        ],

        issuerReference: [
          this.currentTx!.issuerReference
        ],

        issuanceType: [
          this.currentTx!.issuanceType
        ],

        swiftcode: [
          this.currentTx!.swiftcode
        ],

        bankName: [
          this.currentTx!.bankName
        ],

        bankAddress1: [
          this.currentTx!.bankAddress1
        ],

        bankAddress2: [
          this.currentTx!.bankAddress2
        ],

        bankAddress3: [
          this.currentTx!.bankAddress3
        ],

        bankAddress4: [
          this.currentTx!.bankAddress4
        ],

        bankCountry: [
          this.currentTx!.bankCountry
        ],

        typeOfUndertaking: [
          this.currentTx!.typeOfUndertaking
        ],

        effectiveOption: [
          this.currentTx!.effectiveOption
        ],

        expiryType: [
          this.currentTx!.expiryType
        ],

        expiryDate: [
          this.currentTx!.expiryDate
        ],

        currency: [
          this.currentTx!.currency
        ],

        undertakingAmount: [
          this.currentTx!.undertakingAmount
        ],

        variationPlus: [
          this.currentTx!.variationPlus
        ],

        variationMinus: [
          this.currentTx!.variationMinus
        ],

        issuanceCharges: [
          this.currentTx!.issuanceCharges
        ],

        correspondentCharges: [
          this.currentTx!.correspondentCharges
        ],

        supplementaryInfo: [
          this.currentTx!.supplementaryInfo
        ],

        textOfUndertakingInfo: [
          this.currentTx!.textOfUndertakingInfo
        ],

        underlyingTransactionInfo: [
          this.currentTx!.underlyingTransactionInfo
        ],

        presentationInfo: [
          this.currentTx!.presentationInfo
        ],

        basicExtensionType: [
          this.currentTx!.basicExtensionType
        ],

        increaseDecreaseType: [
          this.currentTx!.increaseDecreaseType
        ],

        contractType: [
          this.currentTx!.contractType
        ],

        contractDate: [
          this.currentTx!.contractDate
        ],

        contractCurrency: [
          this.currentTx!.contractCurrency
        ],

        contractAmount: [
          this.currentTx!.contractAmount
        ],

        percentageCovered: [
          this.currentTx!.percentageCovered
        ],

        contractNarrative: [
          this.currentTx!.contractNarrative
        ],

        applicableRules: [
          this.currentTx!.applicableRules
        ],

        countrySubdivision: [
          this.currentTx!.countrySubdivision
        ],

        jurisdiction: [
          this.currentTx!.jurisdiction
        ],

        demandOption: [
          this.currentTx!.demandOption
        ],

        governingLawsType: [
          this.currentTx!.governingLawsType
        ],

        languageType: [
          this.currentTx!.languageType
        ],

        tsOption: [
          this.currentTx!.tsOption
        ],

        deliveryType: [
          this.currentTx!.deliveryType
        ],

        deliveryMode: [
          this.currentTx!.deliveryMode
        ],

        deliveryTo: [
          this.currentTx!.deliveryTo
        ],

        principalAccount: [
          this.currentTx!.principalAccount
        ],

        feeAccount: [
          this.currentTx!.feeAccount
        ],

        otherInstructions: [
          this.currentTx!.otherInstructions
        ]

        // attachments:
        // this.fb.array(this.currentTx!.attachments ?? [])
      });

    // ---------------------------------------------------------
    // READONLY MODE
    // ---------------------------------------------------------

    if (
      this.viewMode === 'readonly'
    ) {

      this.undertakingForm.disable({
        emitEvent: false
      });
    }
  }

  // =========================================================
  // ATTACHMENTS
  // =========================================================

  get attachmentsArray(): FormArray {

    return this.undertakingForm
      .get('attachments') as FormArray;
  }

  // =========================================================
  // BACK
  // =========================================================

  back(): void {

    this.router.navigate([
      '/dashboard/Trade-Services/undertaking-issuance/inquiries-records'
    ]);
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  submitForm(): void {

    // -------------------------------------------------------
    // VIEW MODE CHECK
    // -------------------------------------------------------

    if (
      this.viewMode === 'readonly'
    ) {

      console.warn(
        'Submit blocked: readonly mode'
      );

      return;
    }

    // -------------------------------------------------------
    // PERMISSION CHECK
    // -------------------------------------------------------

    if (
      !this.hasPermission(
        'UTG_AmendPreviewSubmit'
      )
    ) {

      console.warn(
        'Submit blocked: missing UTG_AmendPreviewSubmit permission'
      );

      this.snackBar.open(
        'You do not have permission to submit this transaction.',
        'Close',
        { duration: 3000 }
      );

      return;
    }

    // -------------------------------------------------------
    // STATUS CHECK
    // -------------------------------------------------------

    if (
      this.currentTx?.status !== 'I'
    ) {

      console.warn(
        'Submit blocked: invalid transaction status'
      );

      return;
    }

    // -------------------------------------------------------
    // TNX ID
    // -------------------------------------------------------

    const tnxId =
      this.currentTx?.tnxId;

    if (!tnxId) {

      this.snackBar.open(
        'Transaction ID missing',
        'Close',
        { duration: 3000 }
      );

      return;
    }

    // -------------------------------------------------------
    // API
    // -------------------------------------------------------

    this.api
      .submitUndertaking(
        tnxId,
        this.currentTx!
      )
      .subscribe({

        next: (res) => {

          this.router.navigate(
            [
              '/dashboard/Trade-Services/undertaking-issuance/success'
            ],
            {
              state: {
                transaction: res
              }
            }
          );
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

  // =========================================================
  // APPROVE
  // =========================================================

  approveTransaction(): void {

    // -------------------------------------------------------
    // PERMISSION CHECK
    // -------------------------------------------------------

    if (
      !this.hasPermission(
        'UTG_AmendPreviewApprove'
      )
    ) {

      console.warn(
        'Approve blocked: missing UTG_AmendPreviewApprove permission'
      );

      this.snackBar.open(
        'You do not have permission to approve this transaction.',
        'Close',
        { duration: 3000 }
      );

      return;
    }

    // -------------------------------------------------------
    // STATUS CHECK
    // -------------------------------------------------------

    if (
      this.currentTx?.status !== 'S'
    ) {

      console.warn(
        'Approve blocked: invalid transaction status'
      );

      return;
    }

    // -------------------------------------------------------
    // TNX ID
    // -------------------------------------------------------

    const tnxId =
      this.currentTx?.tnxId;

    if (!tnxId) {

      this.snackBar.open(
        'Transaction ID missing',
        'Close',
        { duration: 3000 }
      );

      return;
    }

    // -------------------------------------------------------
    // API
    // -------------------------------------------------------

    this.api
      .approveUndertaking(
        tnxId,
        this.currentTx
      )
      .subscribe({

        next: (res) => {

          this.snackBar.open(
            'Transaction approved',
            'Close',
            { duration: 3000 }
          );

          this.router.navigate(
            [
              '/dashboard/Trade-Services/undertaking-issuance/success'
            ],
            {
              state: {
                transaction: res
              }
            }
          );
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

  // =========================================================
  // REJECT
  // =========================================================

  rejectTransaction(): void {

    // -------------------------------------------------------
    // PERMISSION CHECK
    // -------------------------------------------------------

    if (
      !this.hasPermission(
        'UTG_AmendPreviewReject'
      )
    ) {

      console.warn(
        'Reject blocked: missing UTG_AmendPreviewReject permission'
      );

      this.snackBar.open(
        'You do not have permission to reject this transaction.',
        'Close',
        { duration: 3000 }
      );

      return;
    }

    // -------------------------------------------------------
    // STATUS CHECK
    // -------------------------------------------------------

    if (
      this.currentTx?.status !== 'S'
    ) {

      console.warn(
        'Reject blocked: invalid transaction status'
      );

      return;
    }

    // -------------------------------------------------------
    // TNX ID
    // -------------------------------------------------------

    const tnxId =
      this.currentTx?.tnxId;

    if (!tnxId) {

      this.snackBar.open(
        'Transaction ID missing',
        'Close',
        { duration: 3000 }
      );

      return;
    }

    // -------------------------------------------------------
    // OPEN REJECT DIALOG
    // -------------------------------------------------------

    const dialogRef =
      this.dialog.open(
        RejectDialogComponent,
        {
          width: '400px',
          hasBackdrop: true,
          backdropClass:
            'cdk-overlay-dark-backdrop',
          panelClass:
            'custom-dialog-container'
        }
      );

    // -------------------------------------------------------
    // REJECTION REASON
    // -------------------------------------------------------

    dialogRef
      .afterClosed()
      .subscribe(
        (
          reason: string | undefined
        ) => {

          if (!reason) {
            return;
          }

          // ---------------------------------------------------
          // API
          // ---------------------------------------------------

          this.api
            .rejectUndertaking(
              tnxId,
              reason
            )
            .subscribe({

              next: (res) => {

                this.snackBar.open(
                  'Transaction rejected successfully',
                  'Close',
                  { duration: 3000 }
                );

                this.router.navigate(
                  [
                    '/dashboard/Trade-Services/undertaking-issuance/success'
                  ],
                  {
                    state: {
                      transaction: res
                    }
                  }
                );
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

  // =========================================================
  // FILE DOWNLOAD
  // =========================================================

  downloadFile(index: number): void {

    // -------------------------------------------------------
    // PERMISSION CHECK
    // -------------------------------------------------------

    if (
      !this.hasPermission(
        'UTG_AmendPreviewDownload'
      )
    ) {

      console.warn(
        'Download blocked: missing UTG_AmendPreviewDownload permission'
      );

      this.snackBar.open(
        'You do not have permission to download attachments.',
        'Close',
        { duration: 3000 }
      );

      return;
    }

    // -------------------------------------------------------
    // GET ATTACHMENT
    // -------------------------------------------------------

    const currentTx =
      this.attachmentsArray
        .at(index)
        ?.value;

    if (!currentTx) {
      return;
    }

    const {
      file,
      fileName
    } = currentTx;

    // -------------------------------------------------------
    // BLOB
    // -------------------------------------------------------

    if (
      file instanceof Blob
    ) {

      const url =
        URL.createObjectURL(file);

      this.triggerDownload(
        url,
        fileName
      );

      URL.revokeObjectURL(url);

      return;
    }

    // -------------------------------------------------------
    // BASE64
    // -------------------------------------------------------

    if (
      typeof file === 'string' &&
      file.startsWith('currentTx:')
    ) {

      const arr =
        file.split(',');

      const mime =
        arr[0]
          .match(/:(.*?);/)
          ?.[1] ?? '';

      const bstr =
        atob(arr[1]);

      const u8arr =
        new Uint8Array(
          bstr.length
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
            type: mime
          }
        );

      const url =
        URL.createObjectURL(blob);

      this.triggerDownload(
        url,
        fileName
      );

      URL.revokeObjectURL(url);

      return;
    }

    console.error(
      'Unsupported file format',
      file
    );
  }

  // =========================================================
  // TRIGGER DOWNLOAD
  // =========================================================

  private triggerDownload(
    url: string,
    fileName: string
  ): void {

    const a =
      document.createElement('a');

    a.href = url;
    a.download = fileName;

    a.click();
  }

  // =========================================================
  // SUCCESS MESSAGE
  // =========================================================

  private showSuccess(
    msg: string
  ): void {

    this.snackBar.open(
      `${msg} - ${this.currentTx?.id}`,
      'Close',
      {
        duration: 4000,
        panelClass: [
          'success-snackbar'
        ]
      }
    );
  }

  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  private showError(
    action: string,
    err: any
  ): void {

    console.error(err);

    this.snackBar.open(
      `Failed to ${action} transaction. Server might be down.`,
      'Close',
      {
        duration: 3000
      }
    );
  }

  // =========================================================
  // TRACK BY
  // =========================================================

  trackByIndex(
    index: number,
    item: any
  ): any {

    return item?.id || index;
  }
}