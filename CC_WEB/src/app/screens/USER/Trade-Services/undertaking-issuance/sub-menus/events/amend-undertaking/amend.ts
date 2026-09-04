import { Component, OnInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';

import { Attachments } from './components/attachments/attachments';
import { Sidebar } from '../../../../../../../core/sidebar/sidebar';
import { InstructionsBank } from '../../../components/instructions-bank/instructions-bank';
import { UndertakingDetails } from '../../../components/undertaking-details/undertaking-details';
import { ApplicationBeneficiary } from '../../../components/application-beneficiary/application-beneficiary';
import { generalDetails } from '../../../components/general-details/general-details';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BankDetails } from '../../../components/bank-details/bank-details';
import { UndertakingGuarantee } from '../../../../../../../core/models/undertaking-lc';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../../../../core/services/api.service';
import { finalize } from 'rxjs';
import { RejectDialogComponent } from '../../../../../../../shared/reject-dialog/reject-dialog';

@Component({
  selector: 'app-amend-screen',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    Sidebar,
    generalDetails,
    ApplicationBeneficiary,
    BankDetails,
    UndertakingDetails,
    InstructionsBank,
    Attachments,
  ],
  templateUrl: './amend.html',
  styleUrls: ['./amend.scss'],
})
export class AmendScreen implements OnInit {
  currentStep = 0;
  undertakingForm!: FormGroup;
  mode: 'CREATE' | 'UPDATE' | 'REJECTED' = 'CREATE';
  screenMode: 'EDIT' | 'SUBMITTED' | 'APPROVED' | 'FINAL' = 'EDIT';
  currentTx: UndertakingGuarantee = {} as UndertakingGuarantee;
  showUpdateSubmit = false;
  showApproveReject = false;
  rejectionReason = '';
  tnxId = '';
  companyId = '';
  eventType: string = '';
  eventRefNo: string = '';
  requestedMode: string = '';
  sourceTab: string = '';
  isSaving = false;
  isHistoricalView = false;

  undertakingSteps = [
    { label: 'General Details' },
    { label: 'Applicant & Beneficiary' },
    { label: 'Bank Details' },
    { label: 'Undertaking Details' },
    { label: 'Instructions' },
    { label: 'Attachments' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {
    this.buildForm();
  }
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

    const sessionData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    this.companyId = sessionData.companyId ?? '';

    // this.companyId = this.authservice.getCompanyId() || '';
    console.log('Company ID from route:', this.companyId);
    this.tnxId = this.route.snapshot.paramMap.get('tnxId') || '';
    console.log('TNX ID from route:', this.tnxId);

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
          this.enterEditMode(this.tnxId);
        } else {
          this.enterCreateMode();
        }
      });
    });
  }

  private buildForm(): void {
    this.undertakingForm = this.fb.group({
      generalDetails: this.fb.group({
        productType: ['Undertaking'],
        modeOfTransmission: ['SWIFT'],
        formOfUndertaking: [''],
        purpose: [''],
      }),
      applicantBeneficiary: this.fb.group({
        // applicantName: ['', Validators.required],
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
      bankForm: this.fb.group({
        recipientBankName: [''],
        issuerReference: [''],
        issuanceType: [''],
        swiftcode: [''],
        bankName: [''],
        bankAddress1: [''],
        bankAddress2: [''],
        bankAddress3: [''],
        bankAddress4: [''],
        bankCountry: [''],
      }),
      undertakingDetails: this.fb.group({
        typeOfUndertaking: [''],
        effectiveOption: [''],
        expiryType: [''],
        expiryDate: [''],
        currency: ['USD'],
        undertakingAmount: [null],
        variationPlus: [''],
        variationMinus: [''],
        issuanceCharges: [''],
        correspondentCharges: [''],
        supplementaryInfo: [''],
        textOfUndertakingInfo: [''],
        underlyingTransactionInfo: [''],
        presentationInfo: [''],
        basicExtensionType: [''],
        increaseDecreaseType: [''],
        contractType: [''],
        contractDate: [''],
        contractCurrency: [''],
        contractAmount: [''],
        percentageCovered: [''],
        contractNarrative: [''],
        applicableRules: [''],
        countrySubdivision: [''],
        jurisdiction: [''],
        demandOption: [''],
        governingLawsType: [''],
        languageType: [''],
        tsOption: [''],
      }),
      instructions: this.fb.group({
        deliveryType: [''],
        deliveryMode: [''],
        deliveryTo: [''],
        principalAccount: [''],
        feeAccount: [''],
        otherInstructions: [''],
      }),
      attachments: this.fb.array([]),
    });
  }

  private enterCreateMode(): void {
    this.mode = 'CREATE';
    this.showUpdateSubmit = false;
    this.showApproveReject = false;
    this.isHistoricalView = false;
    this.currentTx = {} as UndertakingGuarantee;
    this.undertakingForm.reset();
    this.buildForm();
  }

  private enterEditMode(tnxId: string): void {
    this.mode = 'UPDATE';

    // ── SCENARIO 1 ─────────────────────────────────────────────────────────
    // eventRefNo present → specific historical event snapshot, always read-only
    // Triggered from Inquiries Live tab row click
    // ────────────────────────────────────────────────────────────────────────
    if (this.eventRefNo) {
      this.isHistoricalView = true;
      this.api.getUtgAmendmentByEventRefNo(this.eventRefNo).subscribe({
        next: (event) => {
          this.currentTx = event;
          this.screenMode = 'APPROVED';
          this.undertakingForm.disable();
          this.patchForm(event);
        },
        error: () => {
          this.snackBar.open('Event snapshot not found', 'Close', {
            duration: 3000,
          });
          this.router.navigate([
            '/dashboard/Trade-Services/undertaking-issuance/inquiries-records',
          ]);
        },
      });
      return;
    }

    // ── SCENARIO 2 ─────────────────────────────────────────────────────────
    // sourceTab='live', no eventRefNo → user wants to initiate/continue an amendment
    // Triggered from ApprovedInquiryRecords Live tab row click
    // Try to load existing AMD draft; if none exists, pre-populate from master LC
    // ────────────────────────────────────────────────────────────────────────
    if (this.sourceTab === 'live') {
      this.isHistoricalView = false;

      this.api.getAmendmentByTnxId(tnxId).subscribe({
        next: (event) => {
          // Existing AMD draft found — load it
          this.currentTx = event;
          this.patchForm(event);

          if (event.status === 'I') {
            this.screenMode = 'EDIT';
            this.undertakingForm.enable();
          } else {
            // AMD already submitted/approved — shouldn't normally happen from Live tab
            // but handle defensively: show read-only
            this.screenMode = 'SUBMITTED';
            this.undertakingForm.disable();
          }
        },
        error: () => {
          // No existing AMD draft — load master LC data to pre-populate form
          // The AMD event will only be created when user clicks Save
          this.api.getUndertakingByTnxId(tnxId).subscribe({
            next: (tx) => {
              // Only store tnxId on currentTx — no eventRefNo exists yet
              this.currentTx = { tnxId: tx.tnxId } as UndertakingGuarantee;
              this.patchForm(tx);
              this.screenMode = 'EDIT';
              this.undertakingForm.enable();
            },
            error: () => {
              this.snackBar.open('Transaction not found', 'Close', {
                duration: 3000,
              });
              this.router.navigate([
                '/dashboard/Trade-Services/undertaking-issuance/inquiries-records',
              ]);
            },
          });
        },
      });
      return;
    }

    // ── SCENARIO 3 ─────────────────────────────────────────────────────────
    // AMD event tabs (pending/submitted/approved/rejected with eventType=AMD)
    // Triggered from ApprovedInquiryRecords non-live tabs
    // ────────────────────────────────────────────────────────────────────────
    const isAmendmentTab =
      this.eventType === 'AMD' ||
      this.sourceTab === 'pending' ||
      this.sourceTab === 'submitted' ||
      this.sourceTab === 'approved' ||
      this.sourceTab === 'rejected';

    if (isAmendmentTab) {
      this.isHistoricalView = false;

      this.api.getUtgAmendmentByTnxId(tnxId).subscribe({
        next: (event) => {
          this.currentTx = event;
          this.patchForm(event);

          switch (event.status) {
            case 'I':
              this.mode = 'UPDATE';
              this.screenMode = 'EDIT';
              this.undertakingForm.enable();
              break;
            case 'S':
              this.mode = 'UPDATE';
              this.screenMode = 'SUBMITTED';
              this.undertakingForm.disable();
              break;
            case 'A':
              this.mode = 'UPDATE';
              this.screenMode = 'APPROVED';
              this.undertakingForm.disable();
              break;
            case 'R':
              this.mode = 'REJECTED';
              this.screenMode = 'EDIT';
              this.undertakingForm.enable();
              break;
            default:
              this.mode = 'UPDATE';
              this.screenMode = 'FINAL';
              this.undertakingForm.disable();
          }
        },
        error: () => {
          this.snackBar.open('Amendment not found', 'Close', {
            duration: 3000,
          });
          this.router.navigate([
            '/dashboard/Trade-Services/undertaking-issuance/inquiries-records',
          ]);
        },
      });
      return;
    }

    // ── SCENARIO 4 ─────────────────────────────────────────────────────────
    // Master LC (Enquiries non-live tabs with eventType=CRE or unset)
    // ────────────────────────────────────────────────────────────────────────
    this.isHistoricalView = false;
    this.api.getUndertakingByTnxId(tnxId).subscribe({
      next: (tx) => {
        this.currentTx = tx;
        this.patchForm(tx);

        switch (tx.status) {
          case 'I':
            this.mode = 'UPDATE';
            this.screenMode = 'EDIT';
            this.undertakingForm.enable();
            break;
          case 'S':
            this.mode = 'UPDATE';
            this.screenMode = 'SUBMITTED';
            this.undertakingForm.disable();
            break;
          case 'A':
            this.mode = 'UPDATE';
            if (this.requestedMode === 'EDIT') {
              this.screenMode = 'EDIT';
              this.undertakingForm.enable();
            } else {
              this.screenMode = 'APPROVED';
              this.undertakingForm.disable();
            }
            break;
          case 'R':
            this.mode = 'REJECTED';
            this.screenMode = 'EDIT';
            this.undertakingForm.enable();
            break;
          default:
            this.mode = 'UPDATE';
            this.screenMode = 'FINAL';
            this.undertakingForm.disable();
        }
      },
      error: () => {
        this.snackBar.open('Transaction not found', 'Close', {
          duration: 3000,
        });
        this.router.navigate([
          '/dashboard/Trade-Services/undertaking-issuance/inquiries-records',
        ]);
      },
    });
  }

  get generalDetails(): FormGroup {
    return this.undertakingForm.get('generalDetails') as FormGroup;
  }
  get applicantBeneficiary(): FormGroup {
    return this.undertakingForm.get('applicantBeneficiary') as FormGroup;
  }
  get bankForm(): FormGroup {
    return this.undertakingForm.get('bankForm') as FormGroup;
  }
  get undertakingDetails(): FormGroup {
    return this.undertakingForm.get('undertakingDetails') as FormGroup;
  }
  get instructions(): FormGroup {
    return this.undertakingForm.get('instructions') as FormGroup;
  }

  private patchForm(tx: UndertakingGuarantee): void {
    this.undertakingForm.patchValue({
      generalDetails: tx,
      applicantBeneficiary: tx,
      bankForm: tx,
      undertakingDetails: tx,
      instructions: tx,
    });
  }

  scrollToSection(i: number) {
    this.currentStep = i;
    const section = document.getElementById(`section-${i}`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private flattenForm(): UndertakingGuarantee {
    return {
      companyId: this.companyId,
      ...this.undertakingForm.value.generalDetails,
      ...this.undertakingForm.value.applicantBeneficiary,
      ...this.undertakingForm.value.bankForm,
      ...this.undertakingForm.value.undertakingDetails,
      ...this.undertakingForm.value.instructions,
      attachments: this.undertakingForm.value.attachments,
    };
  }

  saveForm(): void {

     if (!this.hasPermission('UTG_Amend')) {
       this.snackBar.open(
         'You do not have permission to amend Undertaking.',
         'Close',
         { duration: 3000 },
       );

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
      .saveUtgAmendTransaction(tnxId, payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (res: UndertakingGuarantee) => {
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
                '/dashboard/Trade-Services/undertaking-issuance/approved-inquiry-records',
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

  submitForm(): void {
     if (!this.hasPermission('UTG_Amend')) {
       this.snackBar.open(
         'You do not have permission to submit Undertaking amendments.',
         'Close',
         { duration: 3000 },
       );

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
      ...this.flattenForm(), // merge current form data
      event: 'AMD',
      tnxId: this.tnxId,
    };

    this.api.submitUtgAmendment(eventRefNo, payload).subscribe({
      next: (res) => {
        this.router.navigate(
          ['/dashboard/Trade-Services/undertaking-issuance/success'],
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
              '/dashboard/Trade-Services/undertaking-issuance/approved-inquiry-records',
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
    const arr = this.undertakingForm.get('attachments') as FormArray;
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
     if (!this.hasPermission('UTG_Amend')) {
       this.snackBar.open(
         'You do not have permission to update Undertaking.',
         'Close',
         { duration: 3000 },
       );

       return;
     }

    if (this.undertakingForm.invalid || !this.currentTx?.tnxId) {
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
  }

  approve(): void {

    if (!this.hasPermission('UTG_Approve')) {
      this.snackBar.open(
        'You do not have permission to approve Undertaking amendments.',
        'Close',
        { duration: 3000 },
      );

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
      ...this.flattenForm(), // merge current form data
      event: 'AMD',
      tnxId: this.tnxId,
    };
    this.api.approveUtgAmendment(eventRefNo, payload).subscribe({
      next: () => {
        this.snackBar.open('Amendment approved. Live LC updated.', 'Close', {
          duration: 3000,
        });
        setTimeout(
          () =>
            this.router.navigate([
              '/dashboard/Trade-Services/undertaking-issuance/inquiries-records',
            ]),
          50,
        );
      },
      error: () =>
        this.snackBar.open('Approval failed', 'Close', { duration: 3000 }),
    });
  }

  openReject(): void {
    
    if (!this.hasPermission('UTG_Approve')) {
      this.snackBar.open(
        'You do not have permission to reject Undertaking amendments.',
        'Close',
        { duration: 3000 },
      );

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
      this.api.rejectUtgAmendment(eventRefNo, reason).subscribe({
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
      [
        '/dashboard/Trade-Services/undertaking-issuance/approved-inquiry-records',
      ],
      {
        queryParams: { tab },
      },
    );
  }

  updateRejected(): void {
    
    if (!this.hasPermission('UTG_Amend')) {
      this.snackBar.open(
        'You do not have permission to update rejected Undertaking.',
        'Close',
        { duration: 3000 },
      );

      return;
    }

    if (this.undertakingForm.invalid || !this.currentTx?.tnxId) {
      this.snackBar.open('Invalid form or missing transaction ID', 'Close', {
        duration: 3000,
      });
      return;
    }

    const payload = this.flattenForm(); // flatten form values
    payload.tnxId = this.currentTx.tnxId;

    this.api.updateRejectedUndertaking(payload.tnxId, payload).subscribe({
      next: (res) => {
        this.snackBar.open(
          `Rejected transaction updated and moved back to Pending (TNX: ${res.tnxId})`,
          'Close',
          { duration: 3000 },
        );

        // Navigate back to inquiries with Pending tab
        this.router.navigate([
          '/dashboard/Trade-Services/undertaking-issuance/inquiries',
        ]);
      },
      error: () => {
        this.snackBar.open('Failed to update rejected transaction', 'Close', {
          duration: 3000,
        });
      },
    });
  }
}
