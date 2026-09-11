import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

import { GeneralDetails } from './components/general-details/general-details';
import { AttachmentsDocuments } from './components/attachments-documents/attachments-documents';
import { BankDetailsComponent } from './components/bank-details/bank-details';
import { CollectionInstructionsComponent } from './components/collection-instructions/collection-instructions';
import { DrawerDraweeDetails } from './components/drawer-drawee-details/drawer-drawee-details';
import { License } from './components/license/license';
import { PaymentAmountComponent } from './components/payment-amount/payment-amount';
import { ShippingDetailsComponent } from './components/shipping-details/shipping-details';
import { Sidebar } from '../../../../core/sidebar/sidebar';

import { ApiService } from '../../../../core/services/api.service';
import { RejectDialogComponent } from '../../../../shared/reject-dialog/reject-dialog';
import { AuthService } from '../../../../core/services/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExportCollectionTransaction } from '../../../../core/models/export-collection';
import { ExportCollectionFormTransactionService } from '../../../../core/services/user-service/export-collection-form-transaction-service/export-collection-form-transaction';
import { DynamicFields } from '../../../../core/services/admin-service/dynamic-fields/dynamic-fields';
@Component({
  selector: 'app-export-collection',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GeneralDetails,
    AttachmentsDocuments,
    BankDetailsComponent,
    CollectionInstructionsComponent,
    DrawerDraweeDetails,
    License,
    ShippingDetailsComponent,
    PaymentAmountComponent,
    MatDialogModule,
    Sidebar,
    RouterModule,
    DynamicFields,
  ],
  templateUrl: './export-collection.html',
  styleUrls: ['./export-collection.scss'],
})
export class ExportCollection implements OnInit {
  currentStep = 0;

  ExportCollectionForm!: FormGroup;

  mode: 'CREATE' | 'UPDATE' | 'REJECTED' = 'CREATE';

  screenMode: 'EDIT' | 'SUBMITTED' | 'APPROVED' | 'FINAL' = 'EDIT';

  currentTx: ExportCollectionTransaction = {} as ExportCollectionTransaction;

  showUpdateSubmit = false;
  showApproveReject = false;

  rejectionReason = '';

  tnxId = '';

  companyId = '';

  // =========================================================
  // PERMISSIONS
  // =========================================================

  permissionNames: string[] = [];

  // =========================================================
  // SIDEBAR STEPS
  // =========================================================

  exportCollectionSteps = [
    { label: 'General Details' },
    { label: 'Drawer & Drawee Details' },
    { label: 'Bank Details' },
    { label: 'Payment & Amount' },
    { label: 'Shipment Details' },
    { label: 'Collection Instruction' },
    { label: 'License' },
    { label: 'Attachments' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private transactionService: ExportCollectionFormTransactionService,
    private authservice: AuthService,
  ) {
    this.buildForm();
  }

  // =========================================================
  // LOAD PERMISSIONS
  // =========================================================

  private loadPermissions(): void {
    const storedPermissions = sessionStorage.getItem('permissionNames');

    if (storedPermissions) {
      try {
        this.permissionNames = JSON.parse(storedPermissions);

        console.log(
          'Export Collection Permission Names:',
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

  // =========================================================
  // SCROLL SPY
  // =========================================================

  private setupScrollSpy(): void {
    setTimeout(() => {
      const scrollArea = document.querySelector('.scroll-area') as HTMLElement;

      if (!scrollArea) {
        return;
      }

      scrollArea.addEventListener('scroll', () => {
        const sections = Array.from(
          scrollArea.querySelectorAll('section[id^="section-"]'),
        ) as HTMLElement[];

        const scrollTop = scrollArea.scrollTop;

        const activationOffset = 120;

        let activeIndex = 0;

        for (let i = 0; i < sections.length; i++) {
          if (sections[i].offsetTop <= scrollTop + activationOffset) {
            activeIndex = i;
          } else {
            break;
          }
        }

        this.currentStep = activeIndex;
      });
    }, 300);
  }

  // =========================================================
  // ON INIT
  // =========================================================

  ngOnInit(): void {
    // Load permissions first
    this.loadPermissions();

    const navState = history.state;

    if (navState?.mode) {
      this.screenMode = navState.mode;
    }

    this.companyId = this.authservice.getCompanyId() || '';

    this.tnxId = this.route.snapshot.paramMap.get('tnxId') || '';

    setTimeout(() => {
      const scrollArea = document.querySelector('.scroll-area') as HTMLElement;

      const sections = Array.from(
        document.querySelectorAll(
          '.scroll-area > section[id^="section-"]:not(#section-10)',
        ),
      ) as HTMLElement[];

      if (!scrollArea || sections.length === 0) {
        return;
      }

      const updateActiveStep = () => {
        const containerRect = scrollArea.getBoundingClientRect();

        const targetPosition = containerRect.top + 20;

        let closestIndex = 0;

        let smallestDistance = Infinity;

        sections.forEach((section, index) => {
          const sectionRect = section.getBoundingClientRect();

          const distance = Math.abs(sectionRect.top - targetPosition);

          if (distance < smallestDistance) {
            smallestDistance = distance;

            closestIndex = index;
          }
        });

        this.currentStep = closestIndex;
      };

      scrollArea.addEventListener('scroll', updateActiveStep);

      updateActiveStep();
    }, 300);

    this.route.paramMap.subscribe((params) => {
      const tnxId = params.get('tnxId');

      if (tnxId) {
        this.enterEditModeExportCollection(tnxId);
      } else {
        this.enterCreateMode();
      }
    });

    // load dynamic fields

    this.loadDynamicFields();
  }

  // -----------------------------
  // FORM CREATION
  // -----------------------------
  private buildForm(): void {
    this.ExportCollectionForm = this.fb.group({
      generalDetails: this.fb.group({
        collectionType: [''],
        customerReference: [''],
        draweeReference: [''],
      }),

      DrawerDraweeDetails: this.fb.group({
        drawerName: [''],
        drawerAddress1: [''],
        drawerAddress2: [''],
        drawerAddress3: [''],
        drawerAddress4: [''],

        draweeName: [''],
        beneficiaryName: [''],

        draweeAddress1: [''],
        draweeAddress2: [''],
        draweeAddress3: [''],
        draweeAddress4: [''],
      }),

      bankDetails: this.fb.group({
        remittingBankName: [''],
        issuerReference: [''],
        principalAccount: [''],
        feeAccount: [''],
        presentingBankName: [''],

        bankAddress1: [''],
        bankAddress2: [''],
        bankAddress3: [''],
        bankAddress4: [''],

        collectingBankName: [''],
        swiftCode: [''],
        collectingReference: [''],
      }),

      PaymentAndAmount: this.fb.group({
        currency: [''],

        amount: ['', Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)],

        paymentType: [''],
        tenor: [''],
        paymentReference: [''],
      }),

      ShipmentDetails: this.fb.group({
        shippingMethod: [''],
        shipmentReference: [''],
        shippingFrom: [''],
        shippingTo: [''],
        shipmentDate: [''],
        incotermsRules: [''],
        incoterms: [''],
      }),

      CollectionInstruction: this.fb.group({
        advicePaymentBy: [''],
        adviceAcceptanceAndDueDateBy: [''],
        adviceReasonOfRefusalBy: [''],

        waiveAllChargesIfRefusedByDrawee: [''],

        protestInCaseOfNonPayment: [''],
        protestInCaseOfNonAcceptance: [''],

        acceptanceMayBeDeferredPendingArrival: ['Allowed'],

        warehouseOrInsureGoodsIfNecessary: ['Not Allowed'],

        openingCharges: [''],
        outsideCountryCharges: [''],
        referTo: [''],
      }),

      attachments: this.fb.array([]),
    });
  }

  // =========================================================
  // CREATE MODE
  // =========================================================

  private enterCreateMode(): void {
    this.mode = 'CREATE';

    this.showUpdateSubmit = false;

    this.showApproveReject = false;

    this.currentTx = {} as ExportCollectionTransaction;

    this.ExportCollectionForm.reset();

    this.buildForm();
  }

  // =========================================================
  // EDIT MODE
  // =========================================================

  private enterEditModeExportCollection(tnxId: string): void {
    this.mode = 'UPDATE';

    this.api.getTransactionByTnxIdExportCollection(tnxId).subscribe({
      next: (tx) => {
        this.currentTx = tx;

        console.log('loading transaction  from backend ', tx);

        this.patchForm(tx);

        switch (tx.status) {
          case 'I':
            this.mode = 'UPDATE';

            this.screenMode = 'EDIT';

            this.ExportCollectionForm.enable();

            break;

          case 'S':
            this.mode = 'UPDATE';

            this.screenMode = 'SUBMITTED';

            this.ExportCollectionForm.disable();

            break;

          case 'A':
            this.mode = 'UPDATE';

            this.screenMode = 'APPROVED';

            this.ExportCollectionForm.disable();

            break;

          case 'R':
            this.mode = 'REJECTED';

            this.screenMode = 'EDIT';

            this.ExportCollectionForm.enable();

            break;

          default:
            this.mode = 'UPDATE';

            this.screenMode = 'FINAL';

            this.ExportCollectionForm.disable();

            break;
        }
      },

      error: () => {
        this.snackBar.open('Transaction not found', 'Close', {
          duration: 3000,
        });

        this.router.navigate(['/page-not-found']);
      },
    });
  }

  // =========================================================
  // FORM GETTERS
  // =========================================================

  get generalDetails(): FormGroup {
    return this.ExportCollectionForm.get('generalDetails') as FormGroup;
  }

  get DrawerDraweeDetails(): FormGroup {
    return this.ExportCollectionForm.get('DrawerDraweeDetails') as FormGroup;
  }

  get bankDetails(): FormGroup {
    return this.ExportCollectionForm.get('bankDetails') as FormGroup;
  }

  get PaymentAndAmount(): FormGroup {
    return this.ExportCollectionForm.get('PaymentAndAmount') as FormGroup;
  }

  get ShipmentDetails(): FormGroup {
    return this.ExportCollectionForm.get('ShipmentDetails') as FormGroup;
  }

  get CollectionInstruction(): FormGroup {
    return this.ExportCollectionForm.get('CollectionInstruction') as FormGroup;
  }

  get attachmentsArray(): FormArray {
    return this.ExportCollectionForm.get('attachments') as FormArray;
  }

  // =========================================================
  // PATCH FORM
  // =========================================================

  private patchForm(tx: ExportCollectionTransaction): void {
    this.ExportCollectionForm.patchValue({
      generalDetails: tx,

      DrawerDraweeDetails: tx,

      bankDetails: tx,

      PaymentAndAmount: tx,

      ShipmentDetails: tx,

      CollectionInstruction: tx,
    });

    // Store existing dynamic field values
    this.storeDynamicFieldsResponse = tx.dynamicFields || [];

    // Patch dynamic field values into dynamic fields form
    this.patchDynamicValues();
  }

  // =========================================================
  // SCROLL
  // =========================================================

  scrollToSection(index: number): void {
    this.currentStep = index;

    const section = document.getElementById(`section-${index}`);

    section?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  // =========================================================
  // FLATTEN FORM
  // =========================================================

  private flattenForm(): ExportCollectionTransaction {
    const dynamicFormValues = this.dynamicFieldsForm?.getRawValue() || {};

    const dynamicFields = this.fields.map((field: any) => ({
      fieldId: field.fieldId,
      value: dynamicFormValues[field.fieldName] ?? '',
    }));
    return {
      companyId: this.companyId,

      ...this.ExportCollectionForm.value.generalDetails,

      ...this.ExportCollectionForm.value.DrawerDraweeDetails,

      ...this.ExportCollectionForm.value.bankDetails,

      ...this.ExportCollectionForm.value.PaymentAndAmount,

      ...this.ExportCollectionForm.value.ShipmentDetails,

      ...this.ExportCollectionForm.value.CollectionInstruction,
      dynamicFields: dynamicFields,
      attachments: this.ExportCollectionForm.value.attachments,
    };
  }

  // =========================================================
  // CREATE / SAVE
  // Permission: Create
  // =========================================================

  saveForm(): void {
    if (!this.hasPermission('EC_CreateSave')) {
      this.snackBar.open(
        'You do not have permission to create an Export Collection.',
        'Close',
        { duration: 3000 },
      );

      return;
    }

    if (this.ExportCollectionForm.invalid) {
      this.ExportCollectionForm.markAllAsTouched();

      this.snackBar.open(
        'Please complete all required fields before saving.',
        'Close',
        { duration: 3000 },
      );

      return;
    }

    const payload = this.flattenForm();

    console.log('Payload before saving draft:', payload);

    this.api.savePendingExportCollection(payload).subscribe({
      next: (res: ExportCollectionTransaction) => {
        this.snackBar.open(
          `Draft saved successfully (TNX ID: ${res.tnxId})`,
          'Close',
          { duration: 5000 },
        );

        setTimeout(
          () =>
            this.router.navigate(
              ['dashboard/Trade-Services/export-collection/inquiries-records'],
              {
                queryParams: {
                  tab: 'pending',
                },
              },
            ),
          50,
        );
      },

      error: () => {
        this.snackBar.open('Error saving draft', 'Close', { duration: 3000 });
      },
    });
  }

  // =========================================================
  // SUBMIT
  // Permission: Submit
  // =========================================================

  submitCollection(): void {
    if (!this.hasPermission('EC_InquirySubmit')) {
      this.snackBar.open(
        'You do not have permission to submit this transaction.',
        'Close',
        { duration: 3000 },
      );

      return;
    }

    const tnxId = this.currentTx?.tnxId;

    if (!tnxId) {
      this.snackBar.open(
        'Transaction ID not found. Please save the draft first.',
        'Close',
        { duration: 3000 },
      );

      return;
    }

    const payload = {
      ...this.flattenForm(),

      event: 'CRE',

      tnxId: this.tnxId,
    };

    this.api.submitTransactionExportCollection(tnxId, payload).subscribe({
      next: (res: ExportCollectionTransaction) => {
        this.transactionService.addOrUpdateTransaction(res);

        this.router.navigate(
          ['dashboard/Trade-Services/export-collection/success'],
          {
            state: {
              source: 'EXPORT_COLLECTION',

              transaction: res,
            },
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

  // =========================================================
  // BACK
  // =========================================================

  back(): void {
    this.router.navigate(['/dashboard']);
  }

  // =========================================================
  // ATTACHMENTS
  // =========================================================

  updateAttachments(files: File[]): void {
    const arr = this.ExportCollectionForm.get('attachments') as FormArray;

    arr.clear();

    files.forEach((file) => {
      arr.push(
        this.fb.group({
          title: file.name.replace(/\.[^/.]+$/, ''),

          fileName: file.name,

          size: file.size,

          type: file.type,

          file: file,
        }),
      );
    });
  }

  // =========================================================
  // UPDATE / AMEND
  // Permission: Amend
  // =========================================================

  update(): void {
    if (!this.hasPermission('EC_InquiryPendingUpdate')) {
      this.snackBar.open(
        'You do not have permission to amend this transaction.',
        'Close',
        { duration: 3000 },
      );

      return;
    }

    if (this.ExportCollectionForm.invalid || !this.currentTx?.tnxId) {
      this.snackBar.open('Invalid form or missing transaction ID', 'Close', {
        duration: 3000,
      });

      return;
    }

    const payload = this.flattenForm();

    payload.tnxId = this.tnxId;

    console.log('Payload before update:', payload);

    if (!payload.tnxId) {
      console.error('TNX ID is missing!');

      return;
    }
    console.log('sending payload  for the backend ', payload);
    this.api.updatePendingByTnxIdExportCollection(payload).subscribe({
      next: (res) => {
        this.snackBar.open(
          `Data successfully updated (${res.tnxId})`,
          'Close',
          { duration: 3000 },
        );

        setTimeout(
          () =>
            this.router.navigate(
              ['dashboard/Trade-Services/export-collection/inquiries-records'],
              {
                queryParams: {
                  tab: 'pending',
                },
              },
            ),
          300,
        );
      },

      error: () => {
        this.snackBar.open('Error updating transaction', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  // =========================================================
  // APPROVE
  // Permission: Approve
  // =========================================================

  approve(): void {
    if (!this.hasPermission('EC_InquiryApprove')) {
      this.snackBar.open(
        'You do not have permission to approve this transaction.',
        'Close',
        { duration: 3000 },
      );

      return;
    }

    this.api
      .approveTransactionExportCollection(this.currentTx.tnxId!, this.currentTx)
      .subscribe({
        next: () => this.navigateBack('approved'),

        error: () =>
          this.snackBar.open('Approval failed', 'Close', { duration: 3000 }),
      });
  }

  // =========================================================
  // REJECT
  // Permission: Reject
  // =========================================================

  openReject(): void {
    if (!this.hasPermission('EC_InquiryReject')) {
      this.snackBar.open(
        'You do not have permission to reject this transaction.',
        'Close',
        { duration: 3000 },
      );

      return;
    }

    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((reason: string | undefined) => {
      if (!reason) {
        return;
      }

      this.api
        .rejectTransactionExportCollection(this.currentTx.tnxId!, reason)
        .subscribe({
          next: () => {
            this.snackBar.open('Transaction rejected successfully', 'Close', {
              duration: 3000,
            });

            this.navigateBack('rejected');
          },

          error: () => {
            this.snackBar.open('Failed to reject transaction', 'Close', {
              duration: 3000,
            });
          },
        });
    });
  }

  // =========================================================
  // NAVIGATE BACK
  // =========================================================

  private navigateBack(tab: string): void {
    this.router.navigate(
      ['/dashboard/Trade-Services/export-collection/inquiries-records'],
      {
        queryParamsHandling: 'merge',

        queryParams: {
          tab,
        },
      },
    );
  }

  // =========================================================
  // UPDATE REJECTED
  // Permission: Amend
  // =========================================================

  updateRejected(): void {
    if (!this.hasPermission('EC_InquiryRejectUpdate')) {
      this.snackBar.open(
        'You do not have permission to amend this transaction.',
        'Close',
        { duration: 3000 },
      );

      return;
    }

    if (this.ExportCollectionForm.invalid || !this.currentTx?.tnxId) {
      this.snackBar.open('Invalid form or missing transaction ID', 'Close', {
        duration: 3000,
      });

      return;
    }

    const payload = this.flattenForm();

    payload.tnxId = this.currentTx.tnxId;

    this.api
      .updateRejectedTransactionExportCollection(payload.tnxId, payload)
      .subscribe({
        next: (res) => {
          this.snackBar.open(
            `Rejected transaction updated and moved back to Pending (TNX: ${res.tnxId})`,
            'Close',
            { duration: 3000 },
          );

          this.router.navigate(
            ['dashboard/Trade-Services/export-collection/inquiries-records'],
            {
              queryParams: {
                tab: 'pending',
              },
            },
          );
        },

        error: () => {
          this.snackBar.open('Failed to update rejected transaction', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  //................ Dynamic fields...................

  storeDynamicFieldsResponse: any[] = [];
  fields: any[] = [];
  dynamicFieldsForm!: FormGroup;
  isDynamicFieldsOpen = true;

  private loadDynamicFields(): void {
    console.log(
      'Loading dynamic fields for ExportCollection screen with status A...',
    );
    this.api.getFieldsByScreenAndStatus('ExportScreen', 'A').subscribe({
      next: (res: any) => {
        console.log('Field definitions:', res);

        this.fields = res;
        console.log('Dynamic fields loaded:', this.fields);
        const group: any = {};

        this.fields.forEach((field: any) => {
          group[field.fieldName] = [''];
        });

        this.dynamicFieldsForm = this.fb.group(group);

        // patch values if customer already loaded
        this.patchDynamicValues();
      },

      error: (err: any) => console.error('Error loading dynamic fields:', err),
    });
  }

  // ---------------- PATCH DYNAMIC VALUES ----------------

  private patchDynamicValues(): void {
    if (
      !this.dynamicFieldsForm ||
      !this.fields?.length ||
      !this.storeDynamicFieldsResponse?.length
    )
      return;

    const patchObj: any = {};

    this.storeDynamicFieldsResponse.forEach((savedField: any) => {
      const fieldDefinition = this.fields.find(
        (f: any) => f.fieldId == savedField.fieldId,
      );

      if (fieldDefinition) {
        patchObj[fieldDefinition.fieldName] = savedField.value || '';
      }
    });

    console.log('Dynamic patch object:', patchObj);

    this.dynamicFieldsForm.patchValue(patchObj);
  }
}
