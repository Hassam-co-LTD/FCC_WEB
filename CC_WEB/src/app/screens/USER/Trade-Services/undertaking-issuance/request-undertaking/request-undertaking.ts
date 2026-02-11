import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// COMPONENTS
import { Sidebar } from "../../../../../core/sidebar/sidebar";
import { generalDetails } from "../components/general-details/general-details";
import { ApplicationBeneficiary } from "../components/application-beneficiary/application-beneficiary";
import { BankDetails } from "../components/bank-details/bank-details";
import { UndertakingDetails } from "../components/undertaking-details/undertaking-details";
import { InstructionsBank } from "../components/instructions-bank/instructions-bank";
import { Attachments } from "../components/attachments/attachments";
import { RejectDialogComponent } from '../../../../../shared/reject-dialog/reject-dialog';

// SERVICE
import { UndertakingIssuanceService, UndertakingTransaction } from '../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-request-undertaking',
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
  templateUrl: './request-undertaking.html',
  styleUrls: ['./request-undertaking.scss'],
})
export class RequestUndertaking implements OnInit {
  
  // References
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  // Form & Data State
  undertakingForm!: FormGroup;
  currentStep = 0;
  companyId = '';
  currentTx: UndertakingTransaction | null = null;
  currentTransactionId: string | number | null = null;
  channelRef: string = 'New Transaction';
  isLoading = false; // Add loading state

  // UI State Flags
  pageMode: 'CREATE' | 'EDIT' | 'CHECKER' | 'VIEW' | 'CORRECT' = 'CREATE';

  // Sidebar Steps
  undertakingSteps = [
    { label: "General Details", id: "section-0" },
    { label: "Applicant & Beneficiary", id: "section-1" },
    { label: "Bank Details", id: "section-2" },
    { label: "Undertaking Details", id: "section-3" },
    { label: "Instructions", id: "section-4" },
    { label: "Attachments", id: "section-5" },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private undertakingService: UndertakingIssuanceService,
    private authService: AuthService
  ) {
    this.buildForm();
  }

  ngOnInit() {
    this.companyId = this.authService.getCompanyId() || '';
    console.log('Company ID:', this.companyId);

    this.route.queryParams.subscribe(params => {
      const id = params['transactionId'];
      const modeParam = params['mode']; 
      
      if (id) {
        this.loadTransaction(id, modeParam);
      } else {
        this.enterCreateMode();
      }
    });
  }

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  private enterCreateMode(): void {
    this.pageMode = 'CREATE';
    this.currentTransactionId = null;
    this.channelRef = 'New Transaction';
    this.undertakingForm.reset();
    this.undertakingForm.enable();

    // Default Values
    this.generalDetails.patchValue({ 
      productType: 'Undertaking', 
      modeOfTransmission: 'SWIFT',
      currency: 'USD'
    });
  }

  private loadTransaction(id: string, modeParam?: string): void {
    this.currentTransactionId = id;
    this.isLoading = true;
    
    this.undertakingService.getTransactionById(id).subscribe({
      next: (tx: UndertakingTransaction) => {
        this.currentTx = tx;
        this.channelRef = tx.channelReference || `REF-${tx.id}`;
        this.isLoading = false;

        // Fill Form
        this.patchForm(tx);

        // Determine Page Mode
        const status = this.normalizeStatus(tx.status);

        if (modeParam === 'view') {
          this.setPageMode('VIEW');
          return;
        }

        switch (status) {
          case 'I': this.setPageMode('EDIT'); break;
          case 'S': this.setPageMode('CHECKER'); break;
          case 'A': this.setPageMode('VIEW'); break;
          case 'R': this.setPageMode('CORRECT'); break;
          default: this.setPageMode('VIEW');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Load Error:', err);
        this.snackBar.open('Transaction not found', 'Close', { duration: 5000 });
        this.router.navigate(['/undertaking-issuance/inquiries-records']);
      }
    });
  }

  private setPageMode(mode: 'CREATE' | 'EDIT' | 'CHECKER' | 'VIEW' | 'CORRECT') {
    this.pageMode = mode;
    if (mode === 'VIEW' || mode === 'CHECKER') {
      this.undertakingForm.disable();
    } else {
      this.undertakingForm.enable();
    }
  }

  private normalizeStatus(statusRaw: string): string {
    const s = (statusRaw || '').toLowerCase();
    if (s.includes('draft') || s === 'i') return 'I';
    if (s.includes('submit') || s === 's') return 'S';
    if (s.includes('approve') || s === 'a') return 'A';
    if (s.includes('reject') || s === 'r') return 'R';
    return 'I';
  }

  private patchForm(tx: UndertakingTransaction) {
    const data = tx.formData || {};
    console.log('Patching Form Data:', data);

    this.undertakingForm.patchValue({
      generalDetails: data.generalDetails || {},
      applicantBeneficiary: data.applicantBeneficiary || {},
      bankForm: data.bankForm || {},
      undertakingDetails: data.undertakingDetails || {},
      instructions: data.instructions || {}
    });

    const files = data.attachments?.files || [];
    if (Array.isArray(files)) this.rebuildAttachments(files);
  }

  // ==========================================
  // BUTTON ACTIONS
  // ==========================================

  saveForm(): void {
    if (this.undertakingForm.invalid) {
      this.undertakingForm.markAllAsTouched();
      this.snackBar.open('Please fill required fields', 'Close', { duration: 3000 });
      return;
    }

    const rawForm = this.undertakingForm.getRawValue();

    if (!this.companyId) {
      this.snackBar.open('Company ID is missing', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.undertakingService.saveDraft(rawForm, this.companyId).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.navigateToSuccess(res.id, res.channelReference || 'REF', 'pending', 'Draft Saved Successfully');
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Error saving draft: ' + err.message, 'Close', { duration: 5000 });
      }
    });
  }

  update(): void {
    if (!this.currentTransactionId) return;
    
    const rawForm = this.undertakingForm.getRawValue();
    rawForm.id = this.currentTransactionId;
    rawForm.status = this.currentTx?.status;

    this.isLoading = true;
    this.undertakingService.updateDraft(rawForm).subscribe({
      next: () => {
        this.isLoading = false;
        const targetTab = this.pageMode === 'CORRECT' ? 'rejected' : 'pending';
        this.navigateToSuccess(this.currentTransactionId!, this.channelRef, targetTab, 'Transaction Updated');
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Error updating transaction: ' + err.message, 'Close', { duration: 5000 });
      }
    });
  }

  submit(): void {
    if (!this.currentTransactionId) {
      this.snackBar.open('Please save as draft first', 'Close', { duration: 3000 });
      return;
    }

    const rawForm = this.undertakingForm.getRawValue();
    rawForm.id = this.currentTransactionId;

    this.isLoading = true;
    this.undertakingService.submitTransaction(this.currentTransactionId, rawForm).subscribe({
      next: () => {
        this.undertakingService.refreshTransactions('submitted').subscribe(() => {
          this.isLoading = false;
          this.navigateToSuccess(this.currentTransactionId!, this.channelRef, 'submitted', 'Transaction Submitted for Approval');
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Error submitting transaction: ' + err.message, 'Close', { duration: 5000 });
      }
    });
  }

  approve(): void {
    if (!this.currentTransactionId) return;

    const confirmApprove = confirm('Are you sure you want to approve this transaction?');
    if (!confirmApprove) return;

    this.isLoading = true;
    this.undertakingService.approveUndertaking(this.currentTransactionId).subscribe({
      next: () => {
        this.undertakingService.refreshTransactions('approved').subscribe(() => {
          this.isLoading = false;
          this.navigateToSuccess(this.currentTransactionId!, this.channelRef, 'approved', 'Transaction Approved Successfully');
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Error approving transaction: ' + err.message, 'Close', { duration: 5000 });
      }
    });
  }

  reject(): void {
    if (!this.currentTransactionId) return;

    console.log('Opening reject dialog for transaction:', this.currentTransactionId);

    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: '500px',
      data: { tnxId: this.channelRef },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(reason => {
      console.log('Dialog closed with reason:', reason);
      
      if (reason && typeof reason === 'string' && reason.trim().length > 0) {
        this.executeReject(reason.trim());
      } else {
        console.log('Dialog cancelled or no reason provided');
      }
    });
  }

  private executeReject(reason: string): void {
    console.log('Executing reject with reason:', reason);
    
    this.isLoading = true;
    this.undertakingService.rejectUndertaking(this.currentTransactionId!, reason).subscribe({
      next: (res) => {
        console.log('Reject successful:', res);
        this.undertakingService.refreshTransactions('rejected').subscribe(() => {
          this.isLoading = false;
          this.navigateToSuccess(this.currentTransactionId!, this.channelRef, 'rejected', 'Transaction Rejected Successfully');
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error in reject:', err);
        
        let errorMessage = 'Error rejecting transaction';
        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  back(): void {
    let tab = 'pending';
    if (this.pageMode === 'CHECKER') tab = 'submitted';
    if (this.pageMode === 'VIEW') tab = 'approved';
    if (this.pageMode === 'CORRECT') tab = 'rejected';

    this.router.navigate(['/undertaking-issuance/inquiries-records'], { queryParams: { tab } });
  }

  // ==========================================
  // NAVIGATION HELPER
  // ==========================================

  private navigateToSuccess(id: string | number, reference: string, targetTab: string, successMessage: string) {
    const successPath = '/undertaking-issuance/success';
    const listingPath = '/undertaking-issuance/inquiries-records';
    const createPath = '/undertaking-issuance/request-undertaking/general-details';

    this.router.navigate([successPath], {
      state: {
        source: 'UNDERTAKING_ISSUANCE',
        tnxId: id,
        channelReference: reference,
        message: successMessage,
        labels: {
          listingLabel: `Go to ${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)} Records`,
          createLabel: 'Create New Undertaking'
        },
        routes: {
          listingRoute: `${listingPath}?tab=${targetTab}`,
          createRoute: createPath
        }
      }
    });
  }

  // ==========================================
  // UTILITIES
  // ==========================================

  scrollToSection(index: number) {
    this.currentStep = index;
    const element = document.getElementById(`section-${index}`);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onScroll(event: Event): void {
    const container = event.target as HTMLElement;
    const scrollPosition = container.scrollTop + 150;
    for (let i = 0; i < this.undertakingSteps.length; i++) {
      const element = document.getElementById(`section-${i}`);
      if (element) {
        if (scrollPosition >= element.offsetTop && scrollPosition < (element.offsetTop + element.offsetHeight)) {
          this.currentStep = i;
          break;
        }
      }
    }
  }

  private buildForm(): void {
    this.undertakingForm = this.fb.group({
      generalDetails: this.fb.group({
        productType: ['Undertaking'],
        modeOfTransmission: ['SWIFT'],
        formOfUndertaking: [''],
        purpose: ['']
      }),
      applicantBeneficiary: this.fb.group({
        applicantName: ['', Validators.required],
        applicantAddress1: [''],
        applicantAddress2: [''],
        applicantAddress3: [''],
        beneficiaryName: ['', Validators.required],
        beneficiaryAddress1: [''],
        beneficiaryAddress2: [''],
        beneficiaryAddress3: [''],
        beneficiaryCountry: ['']
      }),
      bankForm: this.fb.group({
        recipientBankName: [''],
        issuerReference: [''],
        issuanceType: [''],
        swift: [''],
        bankName: [''],
        address1: [''],
        address2: [''],
        address3: [''],
        country: ['']
      }),
      undertakingDetails: this.fb.group({
        typeOfUndertaking: [''],
        effectiveOption: [''],
        expiryType: [''],
        expiryDate: ['', Validators.required],
        currency: ['USD'],
        undertakingAmount: [null, Validators.required],
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
        contractReference: [''],
        applicableRules: [''],
        subdivision: [''],
        jurisdiction: [''],
        demandOption: [''],
        governingLawsType: [''],
        languageType: [''],
        tsOption: ['']
      }),
      instructions: this.fb.group({
        deliveryType: [''],
        deliveryMode: [''],
        deliveryTo: [''],
        principalAccount: [''],
        feeAccount: [''],
        otherInstructions: ['']
      }),
      attachments: this.fb.array([])
    });
  }

  private rebuildAttachments(files: any[]) { /* Logic */ }
  updateAttachments(files: File[]) { /* Logic */ }

  get generalDetails(): FormGroup { return this.undertakingForm.get('generalDetails') as FormGroup; }
  get applicantBeneficiary(): FormGroup { return this.undertakingForm.get('applicantBeneficiary') as FormGroup; }
  get bankForm(): FormGroup { return this.undertakingForm.get('bankForm') as FormGroup; }
  get undertakingDetails(): FormGroup { return this.undertakingForm.get('undertakingDetails') as FormGroup; }
  get instructions(): FormGroup { return this.undertakingForm.get('instructions') as FormGroup; }
}