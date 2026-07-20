import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { ShippingGuaranteeTransaction } from '../../../../../../../core/models/shipping-guarantee';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../../../../../core/services/api.service';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { RejectDialogComponent } from '../../../../../../../shared/reject-dialog/reject-dialog';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../../../../../../core/sidebar/sidebar';

@Component({
  selector: 'app-amend',
  imports: [FormsModule, CommonModule, MatDialogModule,
    Sidebar],
  templateUrl: './amend.html',
  styleUrl: './amend.scss',
})
export class Amend implements OnInit{
  currentStep = 0;
  ShippingGuaranteeForm!: FormGroup;
  mode: 'CREATE' | 'UPDATE' | 'REJECTED' = 'CREATE';
  screenMode: 'EDIT' | 'SUBMITTED' | 'APPROVED' | 'FINAL' = 'EDIT';
  currentTx: ShippingGuaranteeTransaction = {} as ShippingGuaranteeTransaction;
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

  shippingGuaranteeSteps = [
    { label: 'General Details' },
    { label: 'Applicant & Beneficiary' },
    { label: 'Bank Details' },
    { label: 'Instructions' },
    { label: 'Attachments' }
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
    setTimeout(() => {
      const sections = document.querySelectorAll('section');
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.currentStep = Array.from(sections).indexOf(entry.target as HTMLElement);
            }
          });
        },
        { threshold: 0.4, root: document.querySelector('.scroll-area') }
      );
      sections.forEach(section => observer.observe(section));
    }, 200);

    this.route.queryParamMap.subscribe(params => {
      this.requestedMode = params.get('mode')!;
    });

    const sessionData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    this.companyId = sessionData.companyId ?? '';

    // this.companyId = this.authservice.getCompanyId() || '';
    console.log('Company ID from route:', this.companyId);
    this.tnxId = this.route.snapshot.paramMap.get('tnxId') || '';
    console.log('TNX ID from route:', this.tnxId);

    this.route.paramMap.subscribe(params => {
      this.tnxId = params.get('tnxId') || '';

      this.route.queryParamMap.subscribe(q => {
        this.requestedMode = q.get('mode') ?? '';
        this.sourceTab = q.get('tab') ?? '';        // read tab
        this.eventType = q.get('eventType') ?? '';  // read eventType directly
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
    this.currentTx = {} as ShippingGuaranteeTransaction;
    this.ShippingGuaranteeForm.reset();
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
      this.api.getAmendmentByEventRefNo(this.eventRefNo).subscribe({
        next: (event) => {
          this.currentTx = event;
          this.screenMode = 'APPROVED';
          this.ShippingGuaranteeForm.disable();
          this.patchForm(event);
        },
        error: () => {
          this.snackBar.open('Event snapshot not found', 'Close', { duration: 3000 });
          this.router.navigate(['/shipping-guarantee/inquiries-records']);
        }
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
            this.ShippingGuaranteeForm.enable();
          } else {
            // AMD already submitted/approved — shouldn't normally happen from Live tab
            // but handle defensively: show read-only
            this.screenMode = 'SUBMITTED';
            this.ShippingGuaranteeForm.disable();
          }
        },
        error: () => {
          // No existing AMD draft — load master LC data to pre-populate form
          // The AMD event will only be created when user clicks Save
          this.api.getTransactionByTnxId(tnxId).subscribe({
            next: (tx) => {
              // Only store tnxId on currentTx — no eventRefNo exists yet
              this.currentTx = { tnxId: tx.tnxId } as ShippingGuaranteeTransaction;
              this.patchForm(tx);
              this.screenMode = 'EDIT';
              this.ShippingGuaranteeForm.enable();
            },
            error: () => {
              this.snackBar.open('Transaction not found', 'Close', { duration: 3000 });
              this.router.navigate(['/shipping-guarantee/inquiries-records']);
            }
          });
        }
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

      this.api.getAmendmentByTnxId(tnxId).subscribe({
        next: (event) => {
          this.currentTx = event;
          this.patchForm(event);

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
          this.snackBar.open('Amendment not found', 'Close', { duration: 3000 });
          this.router.navigate(['/shipping-guarantee/inquiries-records']);
        }
      });
      return;
    }

    // ── SCENARIO 4 ─────────────────────────────────────────────────────────
    // Master LC (Enquiries non-live tabs with eventType=CRE or unset)
    // ────────────────────────────────────────────────────────────────────────
    this.isHistoricalView = false;
    this.api.getTransactionByTnxId(tnxId).subscribe({
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
        this.snackBar.open('Transaction not found', 'Close', { duration: 3000 });
        this.router.navigate(['/shipping-guarantee/inquiries-records']);
      }
    });
  }

  
    // Safe getters for html form access of the specific form groups 
    get generalDetailsForm(): FormGroup { return this.ShippingGuaranteeForm.get('generalDetailsForm') as FormGroup; }
    get applicantBeneficiaryForm(): FormGroup { return this.ShippingGuaranteeForm.get('applicantBeneficiaryForm') as FormGroup; }
    get issuingbankForm(): FormGroup { return this.ShippingGuaranteeForm.get('issuingbankForm') as FormGroup; }
    get instructionForm(): FormGroup { return this.ShippingGuaranteeForm.get('instructionForm') as FormGroup; }
    get attachmentsArray(): FormArray { return this.ShippingGuaranteeForm.get('attachments') as FormArray; }
  


  private patchForm(tx: ShippingGuaranteeTransaction): void {
    this.ShippingGuaranteeForm.patchValue({
      generalDetailsForm: tx,
      applicantBeneficiaryForm: tx,
      issuingbankForm: tx,
      instructionForm: tx
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
        attachments: this.ShippingGuaranteeForm.value.attachments
      };
    }

  saveForm(): void {
    if (this.isSaving) return;
    this.isSaving = true;

    if (!this.companyId) {
      this.snackBar.open('Session expired or company not found.', 'Close', { duration: 3000 });
      this.isSaving = false;
      return;
    }


    const payload = this.flattenForm();
    console.log("Payload before saving draft:", payload);
    const tnxId = this.currentTx?.tnxId;  // ← master LC tnxId, used for PUT /amend/{tnxId}

    if (!tnxId) {
      this.snackBar.open('Transaction ID missing. Cannot amend.', 'Close', { duration: 3000 });
      this.isSaving = false;
      return;
    }

    this.api.saveamendTransaction(tnxId, payload).pipe(
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: (res: ShippingGuaranteeTransaction) => {
        this.currentTx = { ...this.currentTx, ...res };

        console.log('Saved amendment, eventRefNo:', this.currentTx.eventRefNo); // verify here

        this.snackBar.open(
          `Amendment saved (Ref: ${res.eventRefNo ?? res.tnxId})`,
          'Close',
          { duration: 5000 });
        setTimeout(() => this.router.navigate(['/shipping-guarantee/approved-inquiry-records']), 50
        );
      },
      error: () => {
        this.snackBar.open('Error saving amendment', 'Close', { duration: 3000 });
      }
    });
  }


  submitLc(): void {
    const eventRefNo = this.currentTx?.eventRefNo;
    console.log('Submitting amendment, eventRefNo:', this.currentTx.eventRefNo);

    if (!eventRefNo) {
      this.snackBar.open('Please save the amendment draft first.', 'Close', { duration: 3000 });
      return;
    }

    const payload = {
      ...this.flattenForm(), // merge current form data
      event: 'AMD',
      tnxId: this.tnxId,
    }

    this.api.submitAmendment(eventRefNo, payload).subscribe({
      next: (res) => {
        this.router.navigate(['/shipping-guarantee/success'], {
          state: { source: 'IMPORT_LC_AMD', transaction: res }
        });
        this.snackBar.open(
          `Amendment Submitted (Ref: ${res.eventRefNo ?? res.tnxId})`,
          'Close',
          { duration: 5000 });
        setTimeout(() => this.router.navigate(['/shipping-guarantee/approved-inquiry-records']), 50
        );
      },
      error: () => this.snackBar.open('Error submitting amendment', 'Close', { duration: 3000 })
    });
  }
  back() {
    this.router.navigate(['/dashboard']);
  }

  updateAttachments(files: File[]) {
    const arr = this.ShippingGuaranteeForm.get('attachments') as FormArray;
    arr.clear();
    files.forEach(file => arr.push(this.fb.group({
      title: file.name.replace(/\.[^/.]+$/, ""),
      fileName: file.name,
      size: file.size,
      type: file.type,
      file: file
    })));
  }

  update(): void {
    if (this.ShippingGuaranteeForm.invalid || !this.currentTx?.tnxId) {
      this.snackBar.open('Invalid form or missing transaction ID', 'Close', { duration: 3000 });
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
    const eventRefNo = this.currentTx?.eventRefNo;
    if (!eventRefNo) {
      this.snackBar.open('Amendment reference not found.', 'Close', { duration: 3000 });
      return;
    }
    const payload = {
      ...this.flattenForm(), // merge current form data
      event: 'AMD',
      tnxId: this.tnxId,
    }
    this.api.approveAmendment(eventRefNo, payload).subscribe({
      next: () => {
        this.snackBar.open('Amendment approved. Live LC updated.', 'Close', { duration: 3000 });
        setTimeout(() => this.router.navigate(['/shipping-guarantee/inquiries-records']), 50
        );
      },
      error: () => this.snackBar.open('Approval failed', 'Close', { duration: 3000 })
    });
  }


  openReject(): void {
    const eventRefNo = this.currentTx?.eventRefNo;
    if (!eventRefNo) {
      this.snackBar.open('Amendment reference not found.', 'Close', { duration: 3000 });
      return;
    }
    const dialogRef = this.dialog.open(RejectDialogComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe((reason: string | undefined) => {
      if (!reason) return;
      this.api.rejectAmendment(eventRefNo, reason).subscribe({
        next: () => {
          this.snackBar.open('Amendment rejected. Live LC unchanged.', 'Close', { duration: 3000 });
          this.navigateBack('rejected');
        },
        error: () => this.snackBar.open('Failed to reject amendment', 'Close', { duration: 3000 })
      });
    });
  }


  private navigateBack(tab: string) {
    this.router.navigate(['/shipping-guarantee/approved-inquiry-records'], {
      queryParams: { tab }
    });
  }

  updateRejected(): void {
    if (this.ShippingGuaranteeForm.invalid || !this.currentTx?.tnxId) {
      this.snackBar.open('Invalid form or missing transaction ID', 'Close', { duration: 3000 });
      return;
    }

    const payload = this.flattenForm(); // flatten form values
    payload.tnxId = this.currentTx.tnxId;

    this.api.updateRejectedTransaction(payload.tnxId, payload).subscribe({
      next: (res) => {
        this.snackBar.open(
          `Rejected transaction updated and moved back to Pending (TNX: ${res.tnxId})`,
          'Close',
          { duration: 3000 }
        );

        // Navigate back to inquiries with Pending tab
        this.router.navigate(['/shipping-guarantee/inquiries-records'], {
          queryParams: { tab: 'pending' }
        });
      },
      error: () => {
        this.snackBar.open('Failed to update rejected transaction', 'Close', { duration: 3000 });
      }
    });
  }
}
