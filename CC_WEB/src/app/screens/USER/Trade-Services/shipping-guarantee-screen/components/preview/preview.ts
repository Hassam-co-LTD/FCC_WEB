import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ShippingGuaranteeTransaction } from '../../../../../../core/models/shipping-guarantee';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ShippingGuaranteeFormTransactionService } from '../../../../../../core/services/user-service/shipping-guarantee-form-transaction-service/shipping-guarantee-form-transaction-service';
import { ApiService } from '../../../../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RejectDialogComponent } from '../../../../../../shared/reject-dialog/reject-dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIcon,
    MatDialogModule
  ],
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

  // =========================================================
  // PERMISSIONS
  // =========================================================

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

    // =========================================================
    // LOAD PERMISSIONS
    // =========================================================

    const storedPermissions = sessionStorage.getItem('permissionNames');

    if (storedPermissions) {
      try {
        const parsedPermissions = JSON.parse(storedPermissions);

        if (Array.isArray(parsedPermissions)) {
          this.permissionNames = parsedPermissions;
        } else {
          this.permissionNames = [];
        }

      } catch (error) {
        console.error(
          'Failed to parse permissionNames from sessionStorage',
          error
        );

        this.permissionNames = [];
      }
    }

    console.log(
      'Shipping Guarantee Preview Permissions:',
      this.permissionNames
    );

    // =========================================================
    // GET TRANSACTION
    // =========================================================

    this.currentTx =
      this.transaction ||
      this.transactionService.getCurrentTransaction();

    if (!this.currentTx) {

      console.error('Preview: No transaction data found');

      this.router.navigate([
        '/dashboard/Trade-Services/shipping-guarantee'
      ]);

      return;
    }

    this.viewMode = this.transactionService.getViewMode();

    this.initForm();
  }

  // =========================================================
  // FORM
  // =========================================================

  private initForm(): void {

    this.ShippingGuaranteeForm = this.fb.group({

      id: [this.currentTx!.id],

      tnxId: [this.currentTx!.tnxId],

      status: [this.currentTx!.status],

      createdOn: [this.currentTx!.createdOn],

      expiryDate: [this.currentTx!.expiryDate],

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

      attachments: this.fb.array(
        this.currentTx!.attachments ?? []
      )

    });

    // =========================================================
    // READ ONLY MODE
    // =========================================================

    if (this.viewMode === 'readonly') {

      this.ShippingGuaranteeForm.disable({
        emitEvent: false
      });

    }
  }

  // =========================================================
  // ATTACHMENTS
  // =========================================================

  get attachmentsArray(): FormArray {

    return this.ShippingGuaranteeForm.get(
      'attachments'
    ) as FormArray;

  }

  // =========================================================
  // BACK
  // =========================================================

  back(): void {

    this.router.navigate([
      '/dashboard/Trade-Services/shipping-guarantee/inquiries-records'
    ]);

  }

  // =========================================================
  // SUBMIT
  // =========================================================

  submit(): void {

    // Permission check
    if (!this.hasPermission('SG_AmendSubmit')) {
      console.warn(
        'User does not have SG_AmendSubmit permission'
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
        { duration: 3000 }
      );

      return;
    }

    this.api.submitSgByTnxId(
      tnxId,
      this.currentTx!
    ).subscribe({

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
          { duration: 3000 }
        );

      }

    });

  }

  // =========================================================
  // APPROVE
  // =========================================================

  approveTransaction(): void {

    // Permission check
    if (!this.hasPermission('SG_AmendApprove')) {
      console.warn(
        'User does not have SG_AmendApprove permission'
      );
      return;
    }

    if (!this.currentTx?.tnxId) {
      return;
    }

    this.api.approveTransactionSg(
      this.currentTx.tnxId,
      this.currentTx
    ).subscribe({

      next: (res) => {

        this.snackBar.open(
          'Transaction approved',
          'Close',
          { duration: 3000 }
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
          { duration: 3000 }
        );

      }

    });

  }

  // =========================================================
  // REJECT
  // =========================================================

  rejectTransaction(): void {

    // Permission check
    if (!this.hasPermission('SG_AmendPendingReject')) {
      console.warn(
        'User does not have SG_AmendPendingReject permission'
      );
      return;
    }

    const tnxId = this.currentTx?.tnxId;

    if (!tnxId) {
      return;
    }

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

        if (!reason) {
          return;
        }

        this.api.rejectTransactionSg(
          tnxId,
          reason
        ).subscribe({

          next: (res) => {

            this.snackBar.open(
              'Transaction rejected successfully',
              'Close',
              { duration: 3000 }
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
              { duration: 3000 }
            );

          }

        });

      }
    );

  }

  // =========================================================
  // DOWNLOAD ATTACHMENT
  // =========================================================

  downloadFile(index: number): void {

    const currentTx =
      this.attachmentsArray.at(index)?.value;

    if (!currentTx) {
      return;
    }

    const {
      file,
      fileName
    } = currentTx;

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

    if (
      typeof file === 'string' &&
      file.startsWith('data:')
    ) {

      const arr = file.split(',');

      const mime =
        arr[0].match(/:(.*?);/)?.[1] ?? '';

      const bstr =
        atob(arr[1]);

      const u8arr =
        new Uint8Array(bstr.length);

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
          { type: mime }
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
  // TRACK BY
  // =========================================================

  trackByIndex(
    index: number,
    item: any
  ): any {

    return item?.id || index;

  }

}