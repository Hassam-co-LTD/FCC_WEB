
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ImportLcTransaction } from '../../../../../../../core/models/import-lc';
import { ApiService } from "../../../../../../../core/services/api.service";
import { Sidebar } from '../../../../../../../core/sidebar/sidebar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Attachments } from '../../../components/attachments/attachments';
import { InstructionToBank } from './components/instruction-to-bank/instruction-to-bank';
import { Licenses } from './components/licenses/licenses';
import { NarrativeDetails } from './components/narrative-details/narrative-details';
import { ShipmentDetails } from './components/shipment-details/shipment-details';
import { PaymentDetails } from './components/payment-details/payment-details';
import { AmountChargeDetails } from './components/amount-charge-details/amount-charge-details';
import { BankDetails } from './components/bank-details/bank-details';
import { ApplicantBeneficiary } from './components/applicant-beneficiary/applicant-beneficiary';
import { GeneralDetails } from './components/general-details/general-details';
import { RejectDialogComponent } from '../../../../../../../shared/reject-dialog/reject-dialog';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-amend-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GeneralDetails,
    ApplicantBeneficiary,
    BankDetails,
    AmountChargeDetails,
    PaymentDetails,
    ShipmentDetails,
    NarrativeDetails,
    Licenses,
    InstructionToBank,
    Attachments,
    MatDialogModule,
    Sidebar,
    RouterOutlet,],
  templateUrl: './amend.html',
  styleUrls: ['./amend.scss']
})
export class AmendScreen implements OnInit {

  currentStep = 0;
  importForm!: FormGroup;

  mode: 'CREATE' | 'UPDATE' | 'REJECTED' = 'CREATE';
  screenMode: 'EDIT' | 'SUBMITTED' | 'APPROVED' | 'FINAL' = 'EDIT';

  currentTx: ImportLcTransaction = {} as ImportLcTransaction;

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

  // ============================================================
  // PERMISSIONS
  // ============================================================

  permissionNames: string[] = [];

  importSteps = [
    { label: "General Details" },
    { label: "Applicant Details" },
    { label: "Bank Details" },
    { label: "Amount & Charges" },
    { label: "Payment Details" },
    { label: "Shipment Details" },
    { label: "Narrative Details" },
    { label: "Licenses" },
    { label: "Instructions to Bank" },
    { label: "Attachments" }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {
    this.buildForm();
  }

  ngOnInit() {

    // ----------------------------------------------------------
    // LOAD PERMISSIONS
    // ----------------------------------------------------------

    this.loadPermissions();

    setTimeout(() => {
      const sections = document.querySelectorAll('section');
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.currentStep = Array.from(sections).indexOf(
                entry.target as HTMLElement
              );
            }
          });
        },
        {
          threshold: 0.4,
          root: document.querySelector('.scroll-area')
        }
      );

      sections.forEach(section => observer.observe(section));
    }, 200);

    this.route.queryParamMap.subscribe(params => {
      this.requestedMode = params.get('mode') ?? '';
    });

    const sessionData = JSON.parse(
      sessionStorage.getItem('userData') || '{}'
    );

    this.companyId = sessionData.companyId ?? '';

    console.log('Company ID from route:', this.companyId);

    this.tnxId = this.route.snapshot.paramMap.get('tnxId') || '';

    console.log('TNX ID from route:', this.tnxId);

    this.route.paramMap.subscribe(params => {

      this.tnxId = params.get('tnxId') || '';

      this.route.queryParamMap.subscribe(q => {

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
  }

  // ============================================================
  // LOAD PERMISSIONS
  // ============================================================

  private loadPermissions(): void {

    const storedPermissions =
      sessionStorage.getItem('permissionNames');

    if (storedPermissions) {

      try {

        this.permissionNames =
          JSON.parse(storedPermissions);

        console.log(
          'Import LC Amend Permissions:',
          this.permissionNames
        );

      } catch (error) {

        console.error(
          'Error parsing permissionNames:',
          error
        );

        this.permissionNames = [];
      }

    } else {

      console.warn(
        'permissionNames not found in sessionStorage'
      );

      this.permissionNames = [];
    }
  }

  // ============================================================
  // CHECK PERMISSION
  // ============================================================

  hasPermission(permission: string): boolean {

    return this.permissionNames.some(
      p =>
        p?.trim().toLowerCase() ===
        permission.trim().toLowerCase()
    );
  }

  private buildForm(): void {

    this.importForm = this.fb.group({

      generalDetails: this.fb.group({
        productType: ['backtoback'],
        modeOfTransmission: ['SWIFT'],
        expiryDate: [''],
        placeOfExpiry: ['beneficiary'],
        featureIrrevocable: [false],
        featureRevolving: [false],
        featureTransferable: [false],
        applicableRules: ['EUCP'],
        confirmationInstruction: ['confirm']
      }),

      applicantForm: this.fb.group({
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
        beneficiaryCountry: ['']
      }),

      bankForm: this.fb.group({
        issuingBankName: [''],
        issuerReference: [''],
        advisingBankName: [''],
        adviseThroughBankName: [''],
        bankName: ['']
      }),

      amountChargeForm: this.fb.group({
        currency: [''],
        amount: ['', Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)],
        variationType: ['percent'],
        variationPlus: [''],
        variationMinus: [''],
        issuingBankCharges: ['Applicant'],
        outsideCountryCharges: ['Beneficiary'],
        additionalAmount: ['']
      }),

      paymentDetailsForm: this.fb.group({
        creditAvailableWith: [''],
        bankName: [''],
        creditAvailableBy: ['Payment'],
        paymentDraftAt: ['Sight']
      }),

      shipmentForm: this.fb.group({
        shipmentFrom: [''],
        shipmentTo: [''],
        placeOfLoading: [''],
        placeOfDischarge: [''],
        lastShipmentDate: [''],
        shipmentPeriodNarrative: [''],
        partialShipment: ['Allowed'],
        transhipment: ['Not Allowed']
      }),

      narrativeForm: this.fb.group({
        descriptionOfGoods: [''],
        documentsRequired: [''],
        additionalInstructions: [''],
        otherDetails: ['']
      }),

      instructionForm: this.fb.group({
        principalAccount: [''],
        feeAccount: [''],
        otherInstructions: ['']
      }),

      attachments: this.fb.array([])
    });
  }

  private enterCreateMode(): void {
    this.mode = 'CREATE';
    this.showUpdateSubmit = false;
    this.showApproveReject = false;
    this.isHistoricalView = false;

    this.currentTx = {} as ImportLcTransaction;
    this.importForm.reset();
    this.buildForm();
  }

  private enterEditMode(tnxId: string): void {

    this.mode = 'UPDATE';

    if (this.eventRefNo) {

      this.isHistoricalView = true;

      this.api.getAmendmentByEventRefNo(this.eventRefNo).subscribe({

        next: event => {
          this.currentTx = event;
          this.screenMode = 'APPROVED';
          this.importForm.disable();
          this.patchForm(event);
        },

        error: () => {
          this.snackBar.open(
            'Event snapshot not found',
            'Close',
            { duration: 3000 }
          );

          this.router.navigate([
            '/dashboard/Trade-Services/import-screen/inquiries'
          ]);
        }
      });

      return;
    }

    if (this.sourceTab === 'live') {

      this.isHistoricalView = false;

      this.api.getAmendmentByTnxId(tnxId).subscribe({

        next: event => {

          this.currentTx = event;
          this.patchForm(event);

          if (event.status === 'I') {
            this.screenMode = 'EDIT';
            this.importForm.enable();
          } else {
            this.screenMode = 'SUBMITTED';
            this.importForm.disable();
          }
        },

        error: () => {

          this.api.getTransactionByTnxId(tnxId).subscribe({

            next: tx => {

              this.currentTx = {
                tnxId: tx.tnxId
              } as ImportLcTransaction;

              this.patchForm(tx);
              this.screenMode = 'EDIT';
              this.importForm.enable();
            },

            error: () => {
              this.snackBar.open(
                'Transaction not found',
                'Close',
                { duration: 3000 }
              );

              this.router.navigate([
                '/dashboard/Trade-Services/import-screen/inquiries'
              ]);
            }
          });
        }
      });

      return;
    }

    const isAmendmentTab =
      this.eventType === 'AMD' ||
      this.sourceTab === 'pending' ||
      this.sourceTab === 'submitted' ||
      this.sourceTab === 'approved' ||
      this.sourceTab === 'rejected';

    if (isAmendmentTab) {

      this.isHistoricalView = false;

      this.api.getAmendmentByTnxId(tnxId).subscribe({

        next: event => {

          this.currentTx = event;
          this.patchForm(event);

          switch (event.status) {

            case 'I':
              this.mode = 'UPDATE';
              this.screenMode = 'EDIT';
              this.importForm.enable();
              break;

            case 'S':
              this.mode = 'UPDATE';
              this.screenMode = 'SUBMITTED';
              this.importForm.disable();
              break;

            case 'A':
              this.mode = 'UPDATE';
              this.screenMode = 'APPROVED';
              this.importForm.disable();
              break;

            case 'R':
              this.mode = 'REJECTED';
              this.screenMode = 'EDIT';
              this.importForm.enable();
              break;

            default:
              this.mode = 'UPDATE';
              this.screenMode = 'FINAL';
              this.importForm.disable();
          }
        },

        error: () => {

          this.snackBar.open(
            'Amendment not found',
            'Close',
            { duration: 3000 }
          );

          this.router.navigate([
            '/dashboard/Trade-Services/import-screen/inquiries'
          ]);
        }
      });

      return;
    }

    this.isHistoricalView = false;

    this.api.getTransactionByTnxId(tnxId).subscribe({

      next: tx => {

        this.currentTx = tx;
        this.patchForm(tx);

        switch (tx.status) {

          case 'I':
            this.mode = 'UPDATE';
            this.screenMode = 'EDIT';
            this.importForm.enable();
            break;

          case 'S':
            this.mode = 'UPDATE';
            this.screenMode = 'SUBMITTED';
            this.importForm.disable();
            break;

          case 'A':
            this.mode = 'UPDATE';

            if (this.requestedMode === 'EDIT') {
              this.screenMode = 'EDIT';
              this.importForm.enable();
            } else {
              this.screenMode = 'APPROVED';
              this.importForm.disable();
            }

            break;

          case 'R':
            this.mode = 'REJECTED';
            this.screenMode = 'EDIT';
            this.importForm.enable();
            break;

          default:
            this.mode = 'UPDATE';
            this.screenMode = 'FINAL';
            this.importForm.disable();
        }
      },

      error: () => {

        this.snackBar.open(
          'Transaction not found',
          'Close',
          { duration: 3000 }
        );

        this.router.navigate([
          '/dashboard/Trade-Services/import-screen/inquiries'
        ]);
      }
    });
  }

  get generalDetailsForm(): FormGroup {
    return this.importForm.get('generalDetails') as FormGroup;
  }

  get applicantForm(): FormGroup {
    return this.importForm.get('applicantForm') as FormGroup;
  }

  get bankForm(): FormGroup {
    return this.importForm.get('bankForm') as FormGroup;
  }

  get amountChargeForm(): FormGroup {
    return this.importForm.get('amountChargeForm') as FormGroup;
  }

  get paymentDetailsForm(): FormGroup {
    return this.importForm.get('paymentDetailsForm') as FormGroup;
  }

  get shipmentForm(): FormGroup {
    return this.importForm.get('shipmentForm') as FormGroup;
  }

  get narrativeForm(): FormGroup {
    return this.importForm.get('narrativeForm') as FormGroup;
  }

  get instructionForm(): FormGroup {
    return this.importForm.get('instructionForm') as FormGroup;
  }

  get attachmentsArray(): FormArray {
    return this.importForm.get('attachments') as FormArray;
  }

  private patchForm(tx: ImportLcTransaction): void {

    this.importForm.patchValue({
      generalDetails: tx,
      applicantForm: tx,
      bankForm: tx,
      amountChargeForm: tx,
      paymentDetailsForm: tx,
      shipmentForm: tx,
      narrativeForm: tx,
      instructionForm: tx
    });
  }

  scrollToSection(index: number) {
    this.currentStep = index;

    document
      .getElementById(`section-${index}`)
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
  }

  private flattenForm(): ImportLcTransaction {

    return {
      companyId: this.companyId,
      ...this.importForm.value.generalDetails,
      ...this.importForm.value.applicantForm,
      ...this.importForm.value.bankForm,
      ...this.importForm.value.amountChargeForm,
      ...this.importForm.value.paymentDetailsForm,
      ...this.importForm.value.shipmentForm,
      ...this.importForm.value.narrativeForm,
      ...this.importForm.value.instructionForm,
      attachments: this.importForm.value.attachments
    };
  }

  saveForm(): void {

    if (this.isSaving) return;

    this.isSaving = true;

    if (!this.companyId) {
      this.snackBar.open(
        'Session expired or company not found.',
        'Close',
        { duration: 3000 }
      );

      this.isSaving = false;
      return;
    }

    const payload = this.flattenForm();

    console.log('Payload before saving draft:', payload);

    const tnxId = this.currentTx?.tnxId;

    if (!tnxId) {
      this.snackBar.open(
        'Transaction ID missing. Cannot amend.',
        'Close',
        { duration: 3000 }
      );

      this.isSaving = false;
      return;
    }

    this.api.saveamendTransaction(tnxId, payload)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe({

        next: (res: ImportLcTransaction) => {

          this.currentTx = {
            ...this.currentTx,
            ...res
          };

          this.snackBar.open(
            `Amendment saved (Ref: ${res.eventRefNo ?? res.tnxId})`,
            'Close',
            { duration: 5000 }
          );

          setTimeout(() =>
            this.router.navigate([
              '/dashboard/Trade-Services/import-screen/approved-inquiry-records'
            ]),
            50
          );
        },

        error: () => {
          this.snackBar.open(
            'Error saving amendment',
            'Close',
            { duration: 3000 }
          );
        }
      });
  }

  submitLc(): void {

    const eventRefNo = this.currentTx?.eventRefNo;

    if (!eventRefNo) {
      this.snackBar.open(
        'Please save the amendment draft first.',
        'Close',
        { duration: 3000 }
      );
      return;
    }

    const payload = {
      ...this.flattenForm(),
      event: 'AMD',
      tnxId: this.tnxId
    };

    this.api.submitAmendment(eventRefNo, payload).subscribe({

      next: res => {

        this.router.navigate([
          '/dashboard/Trade-Services/import-screen/success'
        ], {
          state: {
            source: 'IMPORT_LC_AMD',
            transaction: res
          }
        });

        this.snackBar.open(
          `Amendment Submitted (Ref: ${res.eventRefNo ?? res.tnxId})`,
          'Close',
          { duration: 5000 }
        );

        setTimeout(() =>
          this.router.navigate([
            '/dashboard/Trade-Services/import-screen/approved-inquiry-records'
          ]),
          50
        );
      },

      error: () =>
        this.snackBar.open(
          'Error submitting amendment',
          'Close',
          { duration: 3000 }
        )
    });
  }

  back() {
    this.router.navigate(['/dashboard']);
  }

  updateAttachments(files: File[]) {

    const arr = this.importForm.get('attachments') as FormArray;

    arr.clear();

    files.forEach(file =>
      arr.push(this.fb.group({
        title: file.name.replace(/\.[^/.]+$/, ""),
        fileName: file.name,
        size: file.size,
        type: file.type,
        file: file
      }))
    );
  }

  update(): void {

    if (
      this.importForm.invalid ||
      !this.currentTx?.tnxId
    ) {
      this.snackBar.open(
        'Invalid form or missing transaction ID',
        'Close',
        { duration: 3000 }
      );
      return;
    }

    const payload = this.flattenForm();

    payload.tnxId = this.tnxId;

    console.log('Payload before update:', payload);
  }

  approve(): void {

    const eventRefNo = this.currentTx?.eventRefNo;

    if (!eventRefNo) {
      this.snackBar.open(
        'Amendment reference not found.',
        'Close',
        { duration: 3000 }
      );
      return;
    }

    const payload = {
      ...this.flattenForm(),
      event: 'AMD',
      tnxId: this.tnxId
    };

    this.api.approveAmendment(eventRefNo, payload).subscribe({

      next: () => {

        this.snackBar.open(
          'Amendment approved. Live LC updated.',
          'Close',
          { duration: 3000 }
        );

        setTimeout(() =>
          this.router.navigate([
            '/dashboard/Trade-Services/import-screen/inquiries'
          ]),
          50
        );
      },

      error: () =>
        this.snackBar.open(
          'Approval failed',
          'Close',
          { duration: 3000 }
        )
    });
  }

  openReject(): void {

    const eventRefNo = this.currentTx?.eventRefNo;

    if (!eventRefNo) {
      this.snackBar.open(
        'Amendment reference not found.',
        'Close',
        { duration: 3000 }
      );
      return;
    }

    const dialogRef = this.dialog.open(
      RejectDialogComponent,
      { width: '400px' }
    );

    dialogRef.afterClosed().subscribe(
      (reason: string | undefined) => {

        if (!reason) return;

        this.api.rejectAmendment(eventRefNo, reason).subscribe({

          next: () => {

            this.snackBar.open(
              'Amendment rejected. Live LC unchanged.',
              'Close',
              { duration: 3000 }
            );

            this.navigateBack('rejected');
          },

          error: () =>
            this.snackBar.open(
              'Failed to reject amendment',
              'Close',
              { duration: 3000 }
            )
        });
      }
    );
  }

  private navigateBack(tab: string) {

    this.router.navigate([
      '/dashboard/Trade-Services/import-screen/approved-inquiry-records'
    ], {
      queryParams: { tab }
    });
  }

  updateRejected(): void {

    if (
      this.importForm.invalid ||
      !this.currentTx?.tnxId
    ) {
      this.snackBar.open(
        'Invalid form or missing transaction ID',
        'Close',
        { duration: 3000 }
      );
      return;
    }

    const payload = this.flattenForm();

    payload.tnxId = this.currentTx.tnxId;

    this.api.updateRejectedTransaction(
      payload.tnxId,
      payload
    ).subscribe({

      next: res => {

        this.snackBar.open(
          `Rejected transaction updated and moved back to Pending (TNX: ${res.tnxId})`,
          'Close',
          { duration: 3000 }
        );

        this.router.navigate([
          '/dashboard/Trade-Services/import-screen/inquiries'
        ]);
      },

      error: () =>
        this.snackBar.open(
          'Failed to update rejected transaction',
          'Close',
          { duration: 3000 }
        )
    });
  }
}