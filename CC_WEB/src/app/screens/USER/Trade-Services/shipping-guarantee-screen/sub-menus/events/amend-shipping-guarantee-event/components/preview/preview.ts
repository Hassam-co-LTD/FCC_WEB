import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
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
    MatCard,
    HttpClientModule,
    MatDialogModule
  ],
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


  // =====================================================
  // PERMISSIONS
  // =====================================================

  permissionNames: string[] = [];

  hasPermission(permission: string): boolean {
    return this.permissionNames.some(
      p => p.trim().toLowerCase() === permission.trim().toLowerCase()
    );
  }


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private dialog: MatDialog,
    private transactionService: ShippingGuaranteeFormTransactionService
  ) { }


  ngOnInit(): void {

    // =====================================================
    // LOAD PERMISSIONS
    // =====================================================

    const storedPermissions =
      sessionStorage.getItem('permissionNames');

    if (storedPermissions) {
      try {
        this.permissionNames = JSON.parse(storedPermissions);
      } catch {
        this.permissionNames = [];
      }
    }

    console.log(
      'Shipping Guarantee Preview Permissions:',
      this.permissionNames
    );


    // =====================================================
    // LOAD TRANSACTION
    // =====================================================

    this.currentTx =
      this.transaction
      ||
      this.transactionService.getCurrentTransaction();


    if (!this.currentTx) {

      console.error(
        'Preview: No transaction data found'
      );

      this.router.navigate([
        '/dashboard/Trade-Services/shipping-guarantee/amend'
      ]);

      return;
    }


    this.viewMode =
      this.transactionService.getViewMode();


    this.initForm();
  }


  // =====================================================
  // INITIALIZE FORM
  // =====================================================

  private initForm(): void {

    this.ShippingGuaranteeForm = this.fb.group({

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

      expiryDate: [
        this.currentTx!.expiryDate
      ],

      beneficiaryReference: [
        this.currentTx!.beneficiaryReference
      ],

      customerReference: [
        this.currentTx!.customerReference
      ],

      billoflading: [
        this.currentTx!.billoflading
      ],

      modeOfShipment: [
        this.currentTx!.modeOfShipment
      ],

      shippingDetails: [
        this.currentTx!.shippingDetails
      ],

      description: [
        this.currentTx!.description
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


      bankName: [
        this.currentTx!.bankName
      ],

      issuerReference: [
        this.currentTx!.issuerReference
      ],

      currency: [
        this.currentTx!.currency
      ],

      amount: [
        this.currentTx!.amount
      ],


      principalAccount: [
        this.currentTx!.principalAccount
      ],

      feeAccount: [
        this.currentTx!.feeAccount
      ],

      otherInstructions: [
        this.currentTx!.otherInstructions
      ],


      attachments:
        this.fb.array(
          this.currentTx!.attachments ?? []
        )

    });


    // =====================================================
    // READ ONLY MODE
    // =====================================================

    if (this.viewMode === 'readonly') {

      this.ShippingGuaranteeForm.disable({
        emitEvent: false
      });

    }

  }


  // =====================================================
  // ATTACHMENTS
  // =====================================================

  get attachmentsArray(): FormArray {

    return this.ShippingGuaranteeForm.get(
      'attachments'
    ) as FormArray;

  }


  // =====================================================
  // BACK
  // =====================================================

  back(): void {

    this.router.navigate([
      '/dashboard/Trade-Services/shipping-guarantee/approved-inquiry-records'
    ]);

  }


  // =====================================================
  // SUBMIT
  // Permission: SG_AmendSubmit
  // =====================================================

  submit(): void {

    // Backend/API protection
    if (!this.hasPermission('SG_AmendSubmit')) {

      console.warn(
        'User does not have SG_AmendSubmit permission'
      );

      return;
    }


    if (this.viewMode === 'readonly') {
      return;
    }


    const tnxId =
      this.currentTx?.tnxId;


    if (!tnxId) {

      this.snackBar.open(
        'Transaction ID missing',
        'Close',
        {
          duration: 3000
        }
      );

      return;
    }


    this.api
      .submitAmendmentSg(
        tnxId,
        this.currentTx!
      )
      .subscribe({

        next: (res) => {

          this.router.navigate(
            [
              '/dashboard/Trade-Services/shipping-guarantee/success'
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
            {
              duration: 3000
            }
          );

        }

      });

  }


  // =====================================================
  // APPROVE
  // Permission: SG_AmendApprove
  // =====================================================


  // =====================================================
  // APPROVE
  // Permission: SG_AmendApprove
  // =====================================================

  approveTransaction(): void {

    // Backend/API protection
    if (!this.hasPermission('SG_AmendApprove')) {

      console.warn(
        'User does not have SG_AmendApprove permission'
      );

      return;
    }


    if (!this.currentTx?.tnxId) {
      return;
    }


    this.api
      .approveAmendmentSg(
        this.currentTx.tnxId,
        this.currentTx
      )
      .subscribe({

        next: (res) => {

          this.snackBar.open(
            'Transaction approved',
            'Close',
            {
              duration: 3000
            }
          );


          this.router.navigate(
            [
              '/dashboard/Trade-Services/shipping-guarantee/success'
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
            {
              duration: 3000
            }
          );

        }

      });

  }


  // =====================================================
  // REJECT
  // Permission: SG_AmendPendingReject
  // =====================================================

  rejectTransaction(): void {

    // Backend/API protection
    if (!this.hasPermission('SG_AmendReject')) {

      console.warn(
        'User does not have SG_AmendPendingReject permission'
      );

      return;
    }


    const tnxId =
      this.currentTx?.tnxId;


    if (!tnxId) {
      return;
    }


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


    dialogRef
      .afterClosed()
      .subscribe(
        (
          reason: string | undefined
        ) => {

          if (!reason) {
            return;
          }


          this.api
            .rejectAmendmentSg(
              tnxId,
              reason
            )
            .subscribe({

              next: (res) => {

                this.snackBar.open(
                  'Transaction rejected successfully',
                  'Close',
                  {
                    duration: 3000
                  }
                );


                this.router.navigate(
                  [
                    '/dashboard/Trade-Services/shipping-guarantee/success'
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
                  {
                    duration: 3000
                  }
                );

              }

            });

        }
      );

  }


  // =====================================================
  // DOWNLOAD ATTACHMENT
  // =====================================================

  downloadFile(index: number): void {

    const data =
      this.attachmentsArray
        .at(index)
        ?.value;


    if (!data) {
      return;
    }


    const {
      file,
      fileName
    } = data;


    // Blob
    if (file instanceof Blob) {

      const url =
        URL.createObjectURL(file);

      this.triggerDownload(
        url,
        fileName
      );

      URL.revokeObjectURL(url);

      return;
    }


    // Base64
    if (
      typeof file === 'string' &&
      file.startsWith('data:')
    ) {

      const arr =
        file.split(',');

      const mime =
        arr[0]
          .match(/:(.*?);/)?.[1] ?? '';


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


  // =====================================================
  // TRIGGER DOWNLOAD
  // =====================================================

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


  // =====================================================
  // TRACK BY
  // =====================================================

  trackByIndex(
    index: number,
    item: any
  ): any {

    return item?.id || index;

  }

}