import { Component, OnInit } from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import {
  Router,
  RouterOutlet,
  ActivatedRoute
} from '@angular/router';

import { CommonModule } from '@angular/common';

import { MatSnackBar } from '@angular/material/snack-bar';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { finalize } from 'rxjs';

import { ApiService } from '../../../../../../../core/services/api.service';

import { ShippingGuaranteeTransaction } from '../../../../../../../core/models/shipping-guarantee';

import { Sidebar } from '../../../../../../../core/sidebar/sidebar';
import { ApplicantBeneficiary } from '../../../../shipping-guarantee-screen/sub-menus/events/amend-shipping-guarantee-event/components/applicant-beneficiary/applicant-beneficiary';
import { GeneralDetails } from '../../../../shipping-guarantee-screen/sub-menus/events/amend-shipping-guarantee-event/components/general-details/general-details';
import { InstructionToBank } from '../../../../shipping-guarantee-screen/sub-menus/events/amend-shipping-guarantee-event/components/instruction-to-bank/instruction-to-bank';
import { BankDetails } from '../../../../shipping-guarantee-screen/sub-menus/events/amend-shipping-guarantee-event/components/bank-details/bank-details';
import { Attachments } from '../../../../shipping-guarantee-screen/sub-menus/events/amend-shipping-guarantee-event/components/attachments/attachments';
import { RejectDialogComponent } from '../../../../../../../shared/reject-dialog/reject-dialog';
import {TransactionComparisonService} from '../../../../../../../core/services/admin-service/transaction-comparison.service';


@Component({
  selector: 'app-amend',
  imports: [
    FormsModule,
    CommonModule,
    MatDialogModule,
    RouterOutlet,
    Sidebar,
    GeneralDetails,
    ApplicantBeneficiary,
    BankDetails,
    InstructionToBank,
    Attachments,
  ],
  standalone: true,
  templateUrl: './amend.html',

  styleUrls: ['./amend.scss']
})
export class Amend implements OnInit {
  currentStep = 0;

  ShippingGuaranteeForm!: FormGroup;

  mode: 'CREATE' | 'UPDATE' | 'REJECTED' = 'CREATE';

  screenMode:
    | 'EDIT'
    | 'SUBMITTED'
    | 'APPROVED'
    | 'FINAL' = 'EDIT';

  currentTx: ShippingGuaranteeTransaction =
    {} as ShippingGuaranteeTransaction;


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


  // =========================================================
  // PERMISSIONS
  // =========================================================

  permissionNames: string[] = [];


  hasPermission(permission: string): boolean {

    return this.permissionNames.some(
      p =>
        p.trim().toLowerCase() ===
        permission.toLowerCase()
    );

  }


  // =========================================================
  // SIDEBAR STEPS
  // =========================================================

  shippingGuaranteeSteps = [
    { label: 'General Details' },
    { label: 'Applicant & Beneficiary' },
    { label: 'Bank Details' },
    { label: 'Instructions' },
    { label: 'Attachments' },
  ];


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private transactionComparisonService: TransactionComparisonService  
  ) {

    this.buildForm();

  }


  private loadPermissions(): void {
    const storedPermissions = sessionStorage.getItem('permissionNames');

    if (storedPermissions) {
      try {
        this.permissionNames = JSON.parse(storedPermissions);

        console.log('Import LC Amend Permissions:', this.permissionNames);
      } catch (error) {
        console.error('Error parsing permissionNames:', error);

        this.permissionNames = [];
      }
    } else {
      console.warn('permissionNames not found in sessionStorage');

      this.permissionNames = [];
    }
  }

  

  ngOnInit() {
    this.loadPermissions();
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
        { threshold: 0.4, root: document.querySelector('.scroll-area') },
      );
      sections.forEach((section) => observer.observe(section));
    }, 200);

    this.route.queryParamMap.subscribe((params) => {
      this.requestedMode = params.get('mode')!;
    });

    const sessionData =
      JSON.parse(
        sessionStorage.getItem('userData') || '{}'
      );

    this.companyId =
      sessionData.companyId ?? '';


    console.log(
      'Company ID:',
      this.companyId
    );


    // =======================================================
    // ROUTE
    // =======================================================

    this.route.paramMap.subscribe((params) => {
      this.tnxId = params.get('tnxId') || '';

      this.route.queryParamMap.subscribe((q) => {
        this.requestedMode = q.get('mode') ?? '';
        this.sourceTab = q.get('tab') ?? ''; // read tab
        this.eventType = q.get('eventType') ?? ''; // read eventType directly
        this.eventRefNo = q.get('eventRefNo') ?? '';

        console.log('tnxId:', this.tnxId);
        console.log('sourceTab:', this.sourceTab);
        console.log('eventType:', this.eventType);
        console.log('eventRefNo:', this.eventRefNo);

        if (this.tnxId) {

          this.enterEditMode(
            this.tnxId
          );

        } else {

          this.enterCreateMode();

        }

      });

    });

  }

  private buildForm(): void {
    this.ShippingGuaranteeForm = this.fb.group({
      generalDetailsForm: this.fb.group({
        expiryDate: [''],
        beneficiaryReference: [''],
        customerReference: [''],
        billoflading: [''],
        modeOfShipment: [''],
        shippingDetails: [''],
        description: [''],
      }),
      applicantBeneficiaryForm: this.fb.group({
        applicantName: [''],
        applicantAddress1: [''],
        applicantAddress2: [''],
        applicantAddress3: [''],
        applicantAddress4: [''],
        applicantCountry: [''],
        beneficiaryName: [''],
        beneficiaryAddress1: [''],
        beneficiaryAddress2: [''],
        beneficiaryAddress3: [''],
        beneficiaryAddress4: [''],
        beneficiaryCountry: [''],
      }),
      issuingbankForm: this.fb.group({
        bankName: [''],
        issuerReference: [''],
        currency: [''],
        amount: [''],
      }),
      instructionForm: this.fb.group({
        principalAccount: [''],
        feeAccount: [''],
        otherInstructions: [''],
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

    this.isHistoricalView = false;

    this.currentTx =
      {} as ShippingGuaranteeTransaction;

    this.ShippingGuaranteeForm.reset();

    this.buildForm();

  }
  private enterEditMode(tnxId: string): void {
    this.mode = 'UPDATE';

    // =======================================================
    // SCENARIO 3 (computed early so Scenario 1's guard can use it)
    // AMENDMENT TABS
    // =======================================================

    const isAmendmentTab =
      this.eventType === 'AMD' ||
      this.sourceTab === 'pending' ||
      this.sourceTab === 'submitted' ||
      this.sourceTab === 'approved' ||
      this.sourceTab === 'rejected';

    // =======================================================
    // SCENARIO 1
    // HISTORICAL EVENT
    // Skipped when on an amendment status tab (pending/submitted/approved/rejected),
    // since there eventRefNo should drive editability via its real status, not force read-only
    // =======================================================

    if (this.eventRefNo && !isAmendmentTab) {
      this.isHistoricalView = true;
      this.api.getAmendmentByEventRefNoSg(this.eventRefNo).subscribe({
        next: (event) => {
          this.currentTx = event;
          this.screenMode = 'APPROVED';
          this.ShippingGuaranteeForm.disable();
          this.patchForm(event);
        },
        error: () => {
          this.snackBar.open('Event snapshot not found', 'Close', {
            duration: 3000,
          });
          this.router.navigate([
            '/dashboard/Trade-Services/shipping-guarantee/inquiries-records',
          ]);
        },
      });
      return;
    }

    // =======================================================
    // SCENARIO 2
    // LIVE TAB
    // =======================================================

    if (this.sourceTab === 'live') {

      this.isHistoricalView = false;

      this.api.getAmendmentByTnxIdSg(tnxId).subscribe({
        next: (event) => {
          // Existing AMD draft found — load it
          this.currentTx = event;
          this.patchForm(event);

          if (event.status === 'S') {
            // AMD actively submitted/awaiting approval — read-only
            this.screenMode = 'SUBMITTED';
            this.ShippingGuaranteeForm.disable();
          } else {
            this.screenMode = 'EDIT';
            this.ShippingGuaranteeForm.enable();
          }
        },
        error: () => {
          // No existing AMD draft — load master LC data to pre-populate form
          // The AMD event will only be created when user clicks Save
          this.api.getTransactionSgByTnxId(tnxId).subscribe({
            next: (tx) => {
              // Only store tnxId on currentTx — no eventRefNo exists yet
              this.currentTx = {
                tnxId: tx.tnxId,
              } as ShippingGuaranteeTransaction;
              this.patchForm(tx);
              this.screenMode = 'EDIT';
              this.ShippingGuaranteeForm.enable();
            },
            error: () => {
              this.snackBar.open('Transaction not found', 'Close', {
                duration: 3000,
              });
              this.router.navigate([
                '/dashboard/Trade-Services/shipping-guarantee/inquiries-records',
              ]);
            },
          });
        },
      });
      return;
    }

    // =======================================================
    // SCENARIO 3
    // AMENDMENT TABS
    // Uses eventRefNo (when present) to fetch the exact amendment clicked,
    // instead of tnxId alone which can resolve to the latest amendment only
    // =======================================================


    if (isAmendmentTab) {

      this.isHistoricalView = false;

      const amendment$ = this.eventRefNo
        ? this.api.getAmendmentByEventRefNoSg(this.eventRefNo)
        : this.api.getAmendmentByTnxIdSg(tnxId);

      amendment$.subscribe({
        next: (event) => {
          this.currentTx = event;
          this.patchForm(event);
 if (event.status === 'S') {
  const refNo = event.eventRefNo || this.eventRefNo;

  if (refNo) {
    this.api.getEventRejectedTransactionSg(refNo).subscribe({
      next: (rejectedTx) => {
        this.storeRejectedTransaction = rejectedTx;
        console.log('Rejected transaction data:', rejectedTx);
        this.compareShippingGuaranteeData();
      },
      error: (err: any) => {
        console.log('Error fetching rejected transaction:', err);
      },
    });
  }
}
          switch (event.status) {
            case 'I':
              this.mode = 'UPDATE';
              this.screenMode = 'EDIT';
              this.ShippingGuaranteeForm.enable();
              break;
            case 'S':
              this.mode = 'UPDATE';
              this.screenMode = 'SUBMITTED';
              this.ShippingGuaranteeForm.disable();
              break;
            case 'A':
              this.mode = 'UPDATE';
              this.screenMode = 'APPROVED';
              this.ShippingGuaranteeForm.disable();
              break;
            case 'R':
              this.mode = 'REJECTED';
              this.screenMode = 'EDIT';
              this.ShippingGuaranteeForm.enable();
              break;
            default:
              this.mode = 'UPDATE';
              this.screenMode = 'FINAL';
              this.ShippingGuaranteeForm.disable();
          }
        },
        error: () => {
          this.snackBar.open('Amendment not found', 'Close', {
            duration: 3000,
          });
          this.router.navigate([
            '/dashboard/Trade-Services/shipping-guarantee/inquiries-records',
          ]);
        },
      });
      return;
    }

    // =======================================================
    // SCENARIO 4
    // MASTER TRANSACTION
    // =======================================================

    this.isHistoricalView = false;
    this.api.getTransactionSgByTnxId(tnxId).subscribe({
      next: (tx) => {
        this.currentTx = tx;
        this.patchForm(tx);

        switch (tx.status) {
          case 'I':
            this.mode = 'UPDATE';
            this.screenMode = 'EDIT';
            this.ShippingGuaranteeForm.enable();
            break;
          case 'S':
            this.mode = 'UPDATE';
            this.screenMode = 'SUBMITTED';
            this.ShippingGuaranteeForm.disable();
            break;
          case 'A':
            this.mode = 'UPDATE';
            if (this.requestedMode === 'EDIT') {
              this.screenMode = 'EDIT';
              this.ShippingGuaranteeForm.enable();
            } else {
              this.screenMode = 'APPROVED';
              this.ShippingGuaranteeForm.disable();
            }
            break;
          case 'R':
            this.mode = 'REJECTED';
            this.screenMode = 'EDIT';
            this.ShippingGuaranteeForm.enable();
            break;
          default:
            this.mode = 'UPDATE';
            this.screenMode = 'FINAL';
            this.ShippingGuaranteeForm.disable();
        }
      },
      error: () => {
        this.snackBar.open('Transaction not found', 'Close', {
          duration: 3000,
        });
        this.router.navigate([
          '/dashboard/Trade-Services/shipping-guarantee/inquiries-records',
        ]);
      },
    });
  }

  // Safe getters for html form access of the specific form groups
  get generalDetailsForm(): FormGroup {
    return this.ShippingGuaranteeForm.get('generalDetailsForm') as FormGroup;
  }
  get applicantBeneficiaryForm(): FormGroup {
    return this.ShippingGuaranteeForm.get(
      'applicantBeneficiaryForm',
    ) as FormGroup;
  }
  get issuingbankForm(): FormGroup {
    return this.ShippingGuaranteeForm.get('issuingbankForm') as FormGroup;
  }
  get instructionForm(): FormGroup {
    return this.ShippingGuaranteeForm.get('instructionForm') as FormGroup;
  }
  get attachmentsArray(): FormArray {
    return this.ShippingGuaranteeForm.get('attachments') as FormArray;
  }

  private patchForm(tx: ShippingGuaranteeTransaction): void {
    this.ShippingGuaranteeForm.patchValue({

      generalDetailsForm: tx,

      applicantBeneficiaryForm: tx,

      issuingbankForm: tx,
      instructionForm: tx,
    });

  }

  scrollToSection(index: number) {
    this.currentStep = index;
    const section = document.getElementById(`section-${index}`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private flattenForm(): ShippingGuaranteeTransaction {
    return {
      companyId: this.companyId,
      ...this.ShippingGuaranteeForm.value.generalDetailsForm,
      ...this.ShippingGuaranteeForm.value.applicantBeneficiaryForm,
      ...this.ShippingGuaranteeForm.value.issuingbankForm,
      ...this.ShippingGuaranteeForm.value.instructionForm,
      attachments: this.ShippingGuaranteeForm.value.attachments,
    };
  }

  saveForm(): void {
    if (!this.hasPermission('SG_AmendSave')) {
      return;
    }

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
    const tnxId = this.currentTx?.tnxId; // ← master LC tnxId, used for PUT /amend/{tnxId}

    if (!tnxId) {
      this.snackBar.open('Transaction ID missing. Cannot amend.', 'Close', {
        duration: 3000,
      });
      this.isSaving = false;

      return;

    }


    this.api
      .saveAmendTransactionSg(tnxId, payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (res: ShippingGuaranteeTransaction) => {
          this.currentTx = { ...this.currentTx, ...res };

          console.log(
            'Saved amendment, eventRefNo:',
            this.currentTx.eventRefNo,
          ); // verify here

          this.snackBar.open(
            `Amendment saved (Ref: ${res.eventRefNo ?? res.tnxId})`,
            'Close',
            { duration: 5000 },
          );
          setTimeout(
            () =>
              this.router.navigate([
                '/dashboard/Trade-Services/shipping-guarantee/approved-inquiry-records',
              ]),
            50,
          );
        },
        error: () => {
          this.snackBar.open('Error saving amendment', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  submitLc(): void {
    if (!this.hasPermission('SG_AmendSubmit')) {
      return;
    }

    const eventRefNo = this.currentTx?.eventRefNo;
    console.log('Submitting amendment, eventRefNo:', this.currentTx.eventRefNo);

    if (!eventRefNo) {
      this.snackBar.open('Please save the amendment draft first.', 'Close', {
        duration: 3000,
      });
      return;

    }


    const payload = {

      ...this.flattenForm(),

      event: 'AMD',
      tnxId: this.tnxId,
    };

    this.api.submitAmendmentSg(eventRefNo, payload).subscribe({
      next: (res) => {
        this.router.navigate(
          ['/dashboard/Trade-Services/shipping-guarantee/success'],
          {
            state: { source: 'IMPORT_LC_AMD', transaction: res },
          },
        );
        this.snackBar.open(
          `Amendment Submitted (Ref: ${res.eventRefNo ?? res.tnxId})`,
          'Close',
          { duration: 5000 },
        );
        setTimeout(
          () =>
            this.router.navigate([
              '/dashboard/Trade-Services/shipping-guarantee/approved-inquiry-records',
            ]),
          50,
        );
      },
      error: () =>
        this.snackBar.open('Error submitting amendment', 'Close', {
          duration: 3000,
        }),
    });
  }
  back() {
    this.router.navigate(['/dashboard']);
  }

  updateAttachments(files: File[]) {
    const arr = this.ShippingGuaranteeForm.get('attachments') as FormArray;
    arr.clear();
    files.forEach((file) =>
      arr.push(
        this.fb.group({
          title: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          size: file.size,
          type: file.type,
          file: file,
        }),
      ),
    );
  }

update(): void {
 

  const eventRefNo = this.currentTx?.eventRefNo || this.eventRefNo;

  if (this.ShippingGuaranteeForm.invalid || !eventRefNo) {
    this.snackBar.open('Invalid form or missing event reference', 'Close', {
      duration: 3000,
    });
    return;
  }

  if (this.isSaving) return;
  this.isSaving = true;

  const payload = this.flattenForm();
  payload.tnxId = this.currentTx?.tnxId || this.tnxId;

  this.api
    .updatePendingAmendmentSg(eventRefNo, payload)
    .pipe(finalize(() => (this.isSaving = false)))
    .subscribe({
      next: (res) => {
        this.currentTx = { ...this.currentTx, ...res };
        this.snackBar.open(
          `Amendment updated successfully (Ref: ${res.eventRefNo})`,
          'Close',
          { duration: 3000 },
        );
        setTimeout(() => this.navigateBack('pending'), 300);
      },
      error: () =>
        this.snackBar.open('Error updating amendment', 'Close', {
          duration: 3000,
        }),
    });
}
  approve(): void {
    if (!this.hasPermission('SG_AmendApprove')) {
      return;
    }
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
      tnxId: this.tnxId,
    };
    this.api.approveAmendmentSg(eventRefNo, payload).subscribe({
      next: () => {
        this.snackBar.open('Amendment approved. Live LC updated.', 'Close', {
          duration: 3000,
        });
        setTimeout(
          () =>
            this.router.navigate([
              '/dashboard/Trade-Services/shipping-guarantee/inquiries-records',
            ]),
          50,
        );
      },
      error: () =>
        this.snackBar.open('Approval failed', 'Close', { duration: 3000 }),
    });
  }

  openReject(): void {
    if (!this.hasPermission('SG_AmendReject')) {
      return;
    }

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
      this.api.rejectAmendmentSg(eventRefNo, reason).subscribe({
        next: () => {
          this.snackBar.open(
            'Amendment rejected. Live LC unchanged.',
            'Close',
            { duration: 3000 },
          );
          this.navigateBack('rejected');
        },
        error: () =>
          this.snackBar.open('Failed to reject amendment', 'Close', {
            duration: 3000,
          }),
      });
    });
  }

  private navigateBack(tab: string) {
    this.router.navigate(
      ['/dashboard/Trade-Services/shipping-guarantee/approved-inquiry-records'],
      {
        queryParams: { tab },
      },
    );
  }

 updateRejected(): void {
  if (!this.hasPermission('SG_AmendUpdateReject')) {
    this.snackBar.open(
      'You do not have permission to update this rejected amendment.',
      'Close',
      { duration: 3000 },
    );
    return;
  }

  const eventRefNo = this.currentTx?.eventRefNo || this.eventRefNo;

  if (this.ShippingGuaranteeForm.invalid || !eventRefNo) {
    this.snackBar.open('Invalid form or missing event reference', 'Close', {
      duration: 3000,
    });
    return;
  }

  if (this.isSaving) return;
  this.isSaving = true;

  const payload = this.flattenForm();
  payload.tnxId = this.currentTx?.tnxId || this.tnxId;

  this.api
    .updateRejectedAmendmentSg(eventRefNo, payload)
    .pipe(finalize(() => (this.isSaving = false)))
    .subscribe({
      next: (res) => {
        this.snackBar.open(
          `Rejected amendment updated and moved back to Pending (Ref: ${res.eventRefNo})`,
          'Close',
          { duration: 3000 },
        );
        this.navigateBack('pending');
      },
      error: () =>
        this.snackBar.open('Failed to update rejected amendment', 'Close', {
          duration: 3000,
        }),
    });
}

  // old and new values working
previousDynamicValues: { [key: string]: any } = {};
 storeRejectedTransaction: ShippingGuaranteeTransaction | null = null;

    previousValues: { [key: string]: any } = {};
private readonly shippingGuaranteeFields = [
  // General Details
  'expiryDate',
  'beneficiaryReference',
  'customerReference',
  'billoflading',
  'modeOfShipment',
  'shippingDetails',
  'description',

  // Applicant / Beneficiary Details
  'applicantName',
  'applicantAddress1',
  'applicantAddress2',
  'applicantAddress3',
  'applicantAddress4',
  'applicantCountry',
  'beneficiaryName',
  'beneficiaryAddress1',
  'beneficiaryAddress2',
  'beneficiaryAddress3',
  'beneficiaryAddress4',
  'beneficiaryCountry',

  // Issuing Bank Details
  'bankName',
  'issuerReference',
  'currency',
  'amount',
'presentingBankName',
 'bankAddress1',
  'bankAddress2',
   'bankAddress3',
'bankAddress4', 
'collectingBankName', 
'swiftCode',
 'collectingReference',
  //bank Details
  'remittingBankName',
  'issuerReference',

  // Instructions
  'principalAccount',
  'feeAccount',
  'otherInstructions',
];
  private compareShippingGuaranteeData(): void {
  this.previousValues = this.transactionComparisonService.compare(
    this.currentTx,
    this.storeRejectedTransaction,
    this.shippingGuaranteeFields,
  );

  this.previousDynamicValues =
    this.transactionComparisonService.compareDynamicFields(
      this.currentTx?.dynamicFields ?? [],
      this.storeRejectedTransaction?.dynamicFields ?? [],
    );

  console.log('Previous shipping guarantee values:', this.previousValues);
  console.log('Previous dynamic values:', this.previousDynamicValues);
}

    hasPreviousValue(field: string): boolean {
    return (
      this.previousValues &&
      Object.prototype.hasOwnProperty.call(this.previousValues, field) &&
      this.previousValues[field] !== null &&
      this.previousValues[field] !== undefined &&
      String(this.previousValues[field]).trim() !== ''
    );
  }

  // =====================================================
  // GET PREVIOUS EXPORT COLLECTION VALUE
  // =====================================================

  getPreviousValue(field: string): any {
    return this.previousValues?.[field] ?? '';
  }


}


