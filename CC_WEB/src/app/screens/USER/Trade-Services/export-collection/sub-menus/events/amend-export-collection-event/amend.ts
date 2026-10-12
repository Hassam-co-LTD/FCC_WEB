import { Component, OnInit } from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';

import { CommonModule } from '@angular/common';

import { MatSnackBar } from '@angular/material/snack-bar';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { finalize } from 'rxjs';

// SERVICES
import { ApiService } from '../../../../../../../core/services/api.service';

import { Sidebar } from '../../../../../../../core/sidebar/sidebar';

import { DynamicFields } from '../../../../../../../core/services/admin-service/dynamic-fields/dynamic-fields';

import { TransactionComparisonService } from '../../../../../../../core/services/admin-service/transaction-comparison.service';

// MODEL
import { ExportCollectionTransaction } from '../../../../../../../core/models/export-collection';

// CHILD COMPONENTS
import { GeneralDetails } from './components/general-details/general-details';

import { DrawerDraweeDetails } from './components/drawer-drawee-details/drawer-drawee-details';

import { BankDetailsComponent } from './components/bank-details/bank-details';

import { ShippingDetailsComponent } from './components/shipping-details/shipping-details';

import { PaymentAmountComponent } from './components/payment-amount/payment-amount';

import { CollectionInstructionsComponent } from './components/collection-instructions/collection-instructions';

import { License } from './components/license/license';

import { AttachmentsDocuments } from './components/attachments-documents/attachments-documents';

import { RejectDialogComponent } from '../../../../../../../shared/reject-dialog/reject-dialog';

@Component({
  selector: 'app-amend',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    GeneralDetails,
    DrawerDraweeDetails,
    BankDetailsComponent,
    PaymentAmountComponent,
    ShippingDetailsComponent,
    CollectionInstructionsComponent,
    License,
    AttachmentsDocuments,
    Sidebar,
    MatDialogModule,
    CommonModule,
    FormsModule,
    RouterOutlet,
    DynamicFields,
  ],

  templateUrl: './amend.html',

  styleUrls: ['./amend.scss'],
})
export class Amend implements OnInit {
  // ============================================================
  // BASIC VARIABLES
  // ============================================================

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

  eventType = '';

  eventRefNo = '';

  requestedMode = '';

  sourceTab = '';

  isSaving = false;

  isHistoricalView = false;

  permissionNames: string[] = [];

  // ============================================================
  // DYNAMIC FIELDS
  // ============================================================

  storeDynamicFieldsResponse: any[] = [];

  fields: any[] = [];

  dynamicFieldsForm!: FormGroup;

  isDynamicFieldsOpen = true;

  // ============================================================
  // REJECTED HISTORY / OLD VALUES
  // ============================================================

  storeRejectedTransaction: ExportCollectionTransaction | null = null;

  previousValues: { [key: string]: any } = {};

  previousDynamicValues: { [key: string]: any } = {};

  // ============================================================
  // EXPORT COLLECTION COMPARISON FIELDS
  // ============================================================

  private readonly exportCollectionFields = [
    // General Details
    'collectionType',
    'customerReference',
    'draweeReference',

    // Drawer / Drawee Details
    'drawerName',
    'drawerAddress1',
    'drawerAddress2',
    'drawerAddress3',
    'drawerAddress4',
    'draweeName',
    'beneficiaryName',
    'draweeAddress1',
    'draweeAddress2',
    'draweeAddress3',
    'draweeAddress4',

    // Bank Details
    'remittingBankName',
    'issuerReference',
    'principalAccount',
    'feeAccount',
    'presentingBankName',
    'bankAddress1',
    'bankAddress2',
    'bankAddress3',
    'bankAddress4',
    'collectingBankName',
    'swiftCode',
    'collectingReference',

    // Payment and Amount
    'currency',
    'amount',
    'paymentType',
    'tenor',
    'paymentReference',

    // Shipment Details
    'shippingMethod',
    'shipmentReference',
    'shippingFrom',
    'shippingTo',
    'shipmentDate',
    'incotermsRules',
    'incoterms',

    // Collection Instruction
    'advicePaymentBy',
    'adviceAcceptanceAndDueDateBy',
    'adviceReasonOfRefusalBy',
    'waiveAllChargesIfRefusedByDrawee',
    'protestInCaseOfNonPayment',
    'protestInCaseOfNonAcceptance',
    'acceptanceMayBeDeferredPendingArrival',
    'warehouseOrInsureGoodsIfNecessary',
    'openingCharges',
    'outsideCountryCharges',
    'referTo',
  ];

  // ============================================================
  // STEPS
  // ============================================================

  exportCollectionSteps = [
    { label: 'General Details' },

    { label: 'Drawer & Drawee Details' },

    { label: 'Bank Details' },

    { label: 'Payment & Amount' },

    { label: 'Shipment Details' },

    { label: 'Collection Instruction' },

    { label: 'License' },

    { label: 'Attachments' },

    { label: 'Dynamic Fields' },
  ];

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private fb: FormBuilder,

    private router: Router,

    private snackBar: MatSnackBar,

    private api: ApiService,

    private route: ActivatedRoute,

    private dialog: MatDialog,

    private transactionComparisonService: TransactionComparisonService,
  ) {
    this.buildForm();
  }

  // ============================================================
  // NG ON INIT
  // ============================================================

  ngOnInit(): void {
    // ----------------------------------------------------------
    // Permissions
    // ----------------------------------------------------------

    const storedPermissions = sessionStorage.getItem('permissionNames');

    if (storedPermissions) {
      try {
        this.permissionNames = JSON.parse(storedPermissions);
      } catch {
        this.permissionNames = [];
      }
    }

    // ----------------------------------------------------------
    // Intersection Observer
    // ----------------------------------------------------------

    setTimeout(() => {
      const sections = document.querySelectorAll('section');

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.currentStep = Array.from(sections).indexOf(
                entry.target as HTMLElement,
              );
            }
          });
        },
        {
          threshold: 0.4,
          root: document.querySelector('.scroll-area'),
        },
      );

      sections.forEach((section) => observer.observe(section));
    }, 200);

    // ----------------------------------------------------------
    // Session Data
    // ----------------------------------------------------------

    const sessionData = JSON.parse(sessionStorage.getItem('userData') || '{}');

    this.companyId = sessionData.companyId ?? '';

    console.log('Company ID:', this.companyId);

    // ----------------------------------------------------------
    // Route
    // ----------------------------------------------------------

    this.tnxId = this.route.snapshot.paramMap.get('tnxId') || '';

    console.log('TNX ID:', this.tnxId);

    // ----------------------------------------------------------
    // Parameters
    // ----------------------------------------------------------

    this.route.paramMap.subscribe((params) => {
      this.tnxId = params.get('tnxId') || '';

      this.route.queryParamMap.subscribe((q) => {
        this.requestedMode = q.get('mode') ?? '';

        this.sourceTab = q.get('tab') ?? '';

        this.eventType = q.get('eventType') ?? '';

        this.eventRefNo = q.get('eventRefNo') ?? '';

        console.log('tnxId:', this.tnxId);

        console.log('sourceTab:', this.sourceTab);

        console.log('eventType:', this.eventType);

        console.log('eventRefNo:', this.eventRefNo);

        if (this.tnxId) {
          this.enterEditMode(this.tnxId);
        } else {
          this.enterCreateMode();
        }
      });
    });

    // ----------------------------------------------------------
    // LOAD DYNAMIC FIELD DEFINITIONS
    // ----------------------------------------------------------

    this.loadDynamicFields();
  }

  // ============================================================
  // PERMISSION
  // ============================================================

  hasPermission(permission: string): boolean {
    return this.permissionNames.some(
      (p) => p.trim().toLowerCase() === permission.toLowerCase(),
    );
  }

  // ============================================================
  // BUILD MAIN FORM
  // ============================================================

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
        adviceAcceptanceDate: [''],

        waiveCharges: [''],

        adviceReasonRefusal: [''],

        protestNonAcceptance: [''],

        acceptanceDeferred: [''],

        warehouseInsurance: [''],

        protestNonPayment: [''],

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

  // ============================================================
  // CREATE MODE
  // ============================================================

  private enterCreateMode(): void {
    this.mode = 'CREATE';

    this.showUpdateSubmit = false;

    this.showApproveReject = false;

    this.isHistoricalView = false;

    this.currentTx = {} as ExportCollectionTransaction;

    this.ExportCollectionForm.reset();

    this.buildForm();
  }

  // ============================================================
  // EDIT MODE
  // ============================================================

  private enterEditMode(tnxId: string): void {
    this.mode = 'UPDATE';

    const isAmendmentTab =
      this.eventType === 'AMD' ||
      this.sourceTab === 'pending' ||
      this.sourceTab === 'submitted' ||
      this.sourceTab === 'approved' ||
      this.sourceTab === 'rejected';

    // ========================================================
    // SCENARIO 1
    // HISTORICAL EVENT
    // ========================================================

    if (this.eventRefNo && !isAmendmentTab) {
      this.isHistoricalView = true;

      this.api
        .getAmendmentByEventRefNoExportCollection(this.eventRefNo)
        .subscribe({
          next: (event) => {
            this.currentTx = event;

            this.screenMode = 'APPROVED';

            this.ExportCollectionForm.disable();

            this.patchForm(event);
          },

          error: () => {
            this.snackBar.open('Event snapshot not found', 'Close', {
              duration: 3000,
            });

            this.router.navigate([
              'dashboard/Trade-Services/export-collection/inquiries-records',
            ]);
          },
        });

      return;
    }

    // ========================================================
    // SCENARIO 2
    // LIVE → START / CONTINUE AMENDMENT
    // ========================================================

    if (this.sourceTab === 'live') {
      this.isHistoricalView = false;

      this.api.getAmendmentByTnxIdExportCollection(tnxId).subscribe({
        next: (event) => {
          this.currentTx = event;

          this.patchForm(event);

          if (event.status === 'S') {
            this.screenMode = 'SUBMITTED';

            this.ExportCollectionForm.disable();
          } else {
            this.screenMode = 'EDIT';

            this.ExportCollectionForm.enable();
          }
        },

        error: () => {
          this.api.getTransactionByTnxIdExportCollection(tnxId).subscribe({
            next: (tx) => {
              this.currentTx = {
                tnxId: tx.tnxId,
              } as ExportCollectionTransaction;

              this.patchForm(tx);

              this.screenMode = 'EDIT';

              this.ExportCollectionForm.enable();
            },

            error: () => {
              this.snackBar.open('Transaction not found', 'Close', {
                duration: 3000,
              });

              this.router.navigate([
                'dashboard/Trade-Services/export-collection/inquiries-records',
              ]);
            },
          });
        },
      });

      return;
    }

    // ========================================================
    // SCENARIO 3
    // AMD TABS
    // ========================================================

    if (isAmendmentTab) {
      this.isHistoricalView = false;

      const amendment$ = this.eventRefNo
        ? this.api.getAmendmentByEventRefNoExportCollection(this.eventRefNo)
        : this.api.getAmendmentByTnxIdExportCollection(tnxId);

      amendment$.subscribe({
        next: (event) => {
          this.currentTx = event;

          this.patchForm(event);

          const status = (event as any).status ?? (event as any).eventLcStatus;

          // --------------------------------------------------
          // REJECTED HISTORY
          // --------------------------------------------------

          if (
            (this.sourceTab === 'submitted' || this.sourceTab === 'pending') &&
            event.eventRefNo
          ) {
            this.loadRejectedHistory(event.eventRefNo);
          }

          // --------------------------------------------------
          // PENDING
          // --------------------------------------------------

          if (
            this.sourceTab === 'pending' &&
            status !== 'S' &&
            status !== 'A'
          ) {
            this.mode = 'UPDATE';

            this.screenMode = 'EDIT';

            this.ExportCollectionForm.enable();

            return;
          }

          // --------------------------------------------------
          // STATUS
          // --------------------------------------------------

          switch (status) {
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
          }
        },

        error: () => {
          this.snackBar.open('Amendment not found', 'Close', {
            duration: 3000,
          });

          this.router.navigate([
            'dashboard/Trade-Services/export-collection/inquiries-records',
          ]);
        },
      });

      return;
    }

    // ========================================================
    // SCENARIO 4
    // MASTER TRANSACTION
    // ========================================================

    this.isHistoricalView = false;

    this.api.getTransactionByTnxIdExportCollection(tnxId).subscribe({
      next: (tx) => {
        this.currentTx = tx;

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

            if (this.requestedMode === 'EDIT') {
              this.screenMode = 'EDIT';

              this.ExportCollectionForm.enable();
            } else {
              this.screenMode = 'APPROVED';

              this.ExportCollectionForm.disable();
            }

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
        }
      },

      error: () => {
        this.snackBar.open('Transaction not found', 'Close', {
          duration: 3000,
        });

        this.router.navigate([
          'dashboard/Trade-Services/export-collection/inquiries-records',
        ]);
      },
    });
  }

  // ============================================================
  // FORM GETTERS
  // ============================================================

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

  // ============================================================
  // PATCH MAIN FORM + DYNAMIC FIELDS
  // ============================================================

  private patchForm(tx: ExportCollectionTransaction): void {
    // ----------------------------------------------------------
    // Main fields
    // ----------------------------------------------------------

    this.ExportCollectionForm.patchValue({
      generalDetails: tx,

      DrawerDraweeDetails: tx,

      bankDetails: tx,

      PaymentAndAmount: tx,

      ShipmentDetails: tx,

      CollectionInstruction: tx,
    });

    // ----------------------------------------------------------
    // IMPORTANT:
    // Store existing transaction dynamic fields
    // ----------------------------------------------------------

    this.storeDynamicFieldsResponse = tx.dynamicFields ?? [];

    console.log(
      'Stored transaction dynamic fields:',
      this.storeDynamicFieldsResponse,
    );

    // ----------------------------------------------------------
    // Patch dynamic fields
    // ----------------------------------------------------------

    this.patchDynamicValues();
  }

  // ============================================================
  // LOAD DYNAMIC FIELD DEFINITIONS
  // ============================================================

  private loadDynamicFields(): void {
    console.log('Loading dynamic fields for Export Collection...');

    /*
     * IMPORTANT:
     *
     * Verify the exact screen name in your database.
     *
     * If your DB uses "importLcEvent" for this screen,
     * keep that value.
     *
     * Otherwise use "exportCollectionEvent".
     */

    this.api
      .getFieldsByScreenAndStatus('exportCollectionEvent', 'A')
      .subscribe({
        next: (res: any[]) => {
          console.log('Field definitions:', res);

          this.fields = res ?? [];

          const group: any = {};

          this.fields.forEach((field: any) => {
            group[field.fieldName] = [''];
          });

          this.dynamicFieldsForm = this.fb.group(group);

          console.log('Dynamic fields form:', this.dynamicFieldsForm);

          // ----------------------------------------------------
          // Patch saved values
          // ----------------------------------------------------

          this.patchDynamicValues();
        },

        error: (err: any) => {
          console.error('Error loading dynamic fields:', err);
        },
      });
  }

  // ============================================================
  // PATCH DYNAMIC VALUES
  // ============================================================

  private patchDynamicValues(): void {
    if (
      !this.dynamicFieldsForm ||
      !this.fields?.length ||
      !this.storeDynamicFieldsResponse?.length
    ) {
      console.log('Dynamic values cannot be patched yet.', {
        formReady: !!this.dynamicFieldsForm,

        definitions: this.fields?.length,

        savedValues: this.storeDynamicFieldsResponse?.length,
      });

      return;
    }

    const patchObj: any = {};

    this.storeDynamicFieldsResponse.forEach((savedField: any) => {
      const fieldDefinition = this.fields.find(
        (field: any) => field.fieldId == savedField.fieldId,
      );

      if (fieldDefinition) {
        patchObj[fieldDefinition.fieldName] = savedField.value ?? '';
      }
    });

    console.log('Dynamic patch object:', patchObj);

    this.dynamicFieldsForm.patchValue(patchObj);
  }

  // ============================================================
  // BUILD DYNAMIC FIELDS PAYLOAD
  // ============================================================

  private buildDynamicFieldsPayload(): any[] {
    if (!this.dynamicFieldsForm || !this.fields?.length) {
      return [];
    }

    const dynamicFields = this.fields.map((field: any) => ({
      fieldId: field.fieldId,

      fieldName: field.fieldName,

      value: this.dynamicFieldsForm.get(field.fieldName)?.value ?? '',
    }));

    console.log('Dynamic fields payload:', dynamicFields);

    return dynamicFields;
  }

  // ============================================================
  // FLATTEN FORM
  // ============================================================

  private flattenForm(): ExportCollectionTransaction {
    return {
      companyId: this.companyId,

      ...this.ExportCollectionForm.getRawValue().generalDetails,

      ...this.ExportCollectionForm.getRawValue().DrawerDraweeDetails,

      ...this.ExportCollectionForm.getRawValue().bankDetails,

      ...this.ExportCollectionForm.getRawValue().PaymentAndAmount,

      ...this.ExportCollectionForm.getRawValue().ShipmentDetails,

      ...this.ExportCollectionForm.getRawValue().CollectionInstruction,

      attachments: this.ExportCollectionForm.getRawValue().attachments,

      // IMPORTANT
      dynamicFields: this.buildDynamicFieldsPayload(),
    };
  }

  // ============================================================
  // SAVE AMENDMENT DRAFT
  // ============================================================

  saveForm(): void {
    if (this.isSaving) return;

    this.isSaving = true;

    if (!this.companyId) {
      this.snackBar.open('Session expired or company not found.', 'Close', {
        duration: 3000,
      });

      this.isSaving = false;

      return;
    }

    const payload = this.flattenForm();

    console.log('Payload before saving draft:', payload);

    const tnxId = this.currentTx?.tnxId;

    if (!tnxId) {
      this.snackBar.open('Transaction ID missing. Cannot amend.', 'Close', {
        duration: 3000,
      });

      this.isSaving = false;

      return;
    }

    this.api
      .saveamendTransactionExportCollection(tnxId, payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (res: ExportCollectionTransaction) => {
          this.currentTx = {
            ...this.currentTx,
            ...res,
          };

          console.log(
            'Saved amendment, eventRefNo:',
            this.currentTx.eventRefNo,
          );

          this.snackBar.open(
            `Amendment saved (Ref: ${res.eventRefNo ?? res.tnxId})`,
            'Close',
            {
              duration: 5000,
            },
          );

          setTimeout(() => {
            this.router.navigate(
              [
                '/dashboard/Trade-Services/export-collection/approved-inquiry-records',
              ],
              {
                queryParams: {
                  tab: 'pending',
                },
              },
            );
          }, 50);
        },

        error: () => {
          this.snackBar.open('Error saving amendment', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  back(): void {
    this.router.navigate(['/dashboard']);
  }

  // ============================================================
  // SUBMIT AMENDMENT
  // ============================================================

  submit(): void {
    const eventRefNo = this.currentTx?.eventRefNo;

    console.log('Submitting amendment, eventRefNo:', eventRefNo);

    if (!eventRefNo) {
      this.snackBar.open('Please save the amendment draft first.', 'Close', {
        duration: 3000,
      });

      return;
    }

    const payload = {
      ...this.flattenForm(),

      event: 'AMD',

      tnxId: this.currentTx?.tnxId || this.tnxId,
    };

    console.log('Submit amendment payload:', payload);

    this.api.submitAmendmentExportCollection(eventRefNo, payload).subscribe({
      next: (res) => {
        this.router.navigate(
          ['/dashboard/Trade-Services/export-collection/success'],
          {
            state: {
              source: 'EXPORT_COLLECTION_AMD',

              transaction: res,
            },
          },
        );

        this.snackBar.open(
          `Amendment Submitted (Ref: ${res.eventRefNo ?? res.tnxId})`,
          'Close',
          {
            duration: 5000,
          },
        );

        setTimeout(
          () =>
            this.router.navigate([
              '/dashboard/Trade-Services/export-collection/approved-inquiry-records',
            ]),
          50,
        );
      },

      error: () => {
        this.snackBar.open('Error submitting amendment', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  // ============================================================
  // UPDATE PENDING AMENDMENT
  // ============================================================

  update(): void {
    const eventRefNo = this.currentTx?.eventRefNo || this.eventRefNo;

    if (this.ExportCollectionForm.invalid || !eventRefNo) {
      this.snackBar.open('Invalid form or missing event reference', 'Close', {
        duration: 3000,
      });

      return;
    }

    if (this.isSaving) return;

    this.isSaving = true;

    const payload = {
      ...this.flattenForm(),

      event: 'AMD',

      tnxId: this.currentTx?.tnxId || this.tnxId,
    };

    console.log('Pending amendment update payload:', payload);

    this.api
      .updatePendingAmendmentExportCollection(eventRefNo, payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (res) => {
          this.currentTx = {
            ...this.currentTx,
            ...res,
          };

          this.snackBar.open(
            `Amendment updated successfully (Ref: ${res.eventRefNo})`,
            'Close',
            {
              duration: 3000,
            },
          );

          setTimeout(() => this.navigateBack('pending'), 300);
        },

        error: () => {
          this.snackBar.open('Error updating amendment', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  // ============================================================
  // UPDATE REJECTED AMENDMENT
  // ============================================================

  updateRejected(): void {
    const eventRefNo = this.currentTx?.eventRefNo || this.eventRefNo;

    console.log('Updating rejected amendment:', {
      eventRefNo,
      tnxId: this.currentTx?.tnxId || this.tnxId,
    });

    if (this.ExportCollectionForm.invalid || !eventRefNo) {
      this.snackBar.open(
        'Invalid form or missing amendment reference',
        'Close',
        {
          duration: 3000,
        },
      );

      return;
    }

    if (this.isSaving) return;

    this.isSaving = true;

    const payload = {
      ...this.flattenForm(),

      event: 'AMD',

      tnxId: this.currentTx?.tnxId || this.tnxId,
    };

    console.log('Rejected amendment update payload:', payload);

    this.api
      .updateRejectedAmendmentExportCollection(eventRefNo, payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (res) => {
          this.currentTx = {
            ...this.currentTx,
            ...res,
          };

          this.snackBar.open(
            `Rejected amendment updated and moved back to Pending (Ref: ${
              res.eventRefNo
            })`,
            'Close',
            {
              duration: 3000,
            },
          );

          this.navigateBack('pending');
        },

        error: () => {
          this.snackBar.open('Failed to update rejected amendment', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  // ============================================================
  // APPROVE
  // ============================================================

  approve(): void {
    const eventRefNo = this.currentTx?.eventRefNo;

    if (!eventRefNo) {
      this.snackBar.open('Amendment reference not found.', 'Close', {
        duration: 3000,
      });

      return;
    }

    const payload = {
      ...this.flattenForm(),

      event: 'AMD',

      tnxId: this.currentTx?.tnxId || this.tnxId,
    };

    console.log('Approve amendment payload:', payload);

    this.api.approveAmendmentExportCollection(eventRefNo, payload).subscribe({
      next: () => {
        this.snackBar.open('Amendment approved. Live LC updated.', 'Close', {
          duration: 3000,
        });

        setTimeout(
          () =>
            this.router.navigate([
              '/dashboard/Trade-Services/export-collection/inquiries-records',
            ]),
          50,
        );
      },

      error: () => {
        this.snackBar.open('Approval failed', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  // ============================================================
  // REJECT
  // ============================================================

  openReject(): void {
    const eventRefNo = this.currentTx?.eventRefNo;

    if (!eventRefNo) {
      this.snackBar.open('Amendment reference not found.', 'Close', {
        duration: 3000,
      });

      return;
    }

    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((reason: string | undefined) => {
      if (!reason) return;

      this.api.rejectAmendmentExportCollection(eventRefNo, reason).subscribe({
        next: () => {
          this.snackBar.open(
            'Amendment rejected. Live LC unchanged.',
            'Close',
            {
              duration: 3000,
            },
          );

          this.navigateBack('rejected');
        },

        error: () => {
          this.snackBar.open('Failed to reject amendment', 'Close', {
            duration: 3000,
          });
        },
      });
    });
  }

  // ============================================================
  // ATTACHMENTS
  // ============================================================

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

  // ============================================================
  // REJECTED HISTORY
  // ============================================================

  private loadRejectedHistory(eventRefNo: string): void {
    this.api.getEventRejectedTransactionExportCollection(eventRefNo).subscribe({
      next: (rejectedTx) => {
        if (!rejectedTx) {
          console.log('No rejected history for', eventRefNo);

          return;
        }

        this.storeRejectedTransaction = rejectedTx;

        console.log('Rejected transaction data:', rejectedTx);

        this.compareExportCollectionData();
      },

      error: (err: any) => {
        console.log('Error fetching rejected transaction:', err);
      },
    });
  }

  // ============================================================
  // COMPARE OLD / NEW VALUES
  // ============================================================

  private compareExportCollectionData(): void {
    this.previousValues = this.transactionComparisonService.compare(
      this.currentTx,

      this.storeRejectedTransaction,

      this.exportCollectionFields,
    );

    this.previousDynamicValues =
      this.transactionComparisonService.compareDynamicFields(
        this.currentTx?.dynamicFields ?? [],

        this.storeRejectedTransaction?.dynamicFields ?? [],
      );

    console.log('Previous export collection values:', this.previousValues);

    console.log('Previous dynamic values:', this.previousDynamicValues);
  }

  // ============================================================
  // CHECK PREVIOUS VALUE
  // ============================================================

  hasPreviousValue(field: string): boolean {
    return (
      !!this.previousValues &&
      Object.prototype.hasOwnProperty.call(this.previousValues, field) &&
      this.previousValues[field] !== null &&
      this.previousValues[field] !== undefined &&
      String(this.previousValues[field]).trim() !== ''
    );
  }

  // ============================================================
  // GET PREVIOUS VALUE
  // ============================================================

  getPreviousValue(field: string): any {
    return this.previousValues?.[field] ?? '';
  }

  // ============================================================
  // SCROLL
  // ============================================================

  scrollToSection(index: number): void {
    this.currentStep = index;

    const section = document.getElementById(`section-${index}`);

    section?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  // ============================================================
  // NAVIGATION
  // ============================================================

  private navigateBack(tab: string): void {
    this.router.navigate(
      ['/dashboard/Trade-Services/export-collection/approved-inquiry-records'],
      {
        queryParams: {
          tab,
        },
      },
    );
  }

  // dynmamic fields section
}
