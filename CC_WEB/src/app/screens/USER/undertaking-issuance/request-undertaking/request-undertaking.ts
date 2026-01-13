import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

// COMPONENTS
import { Sidebar } from "../../../../core/sidebar/sidebar";
import { generalDetails } from "../components/general-details/general-details";
import { ApplicationBeneficiary } from "../components/application-beneficiary/application-beneficiary";
import { BankDetails } from "../components/bank-details/bank-details";
import { UndertakingDetails } from "../components/undertaking-details/undertaking-details";
import { InstructionsBank } from "../components/instructions-bank/instructions-bank";
import { Attachments } from "../components/attachments/attachments";

// SERVICE
import { UndertakingIssuanceService } from '../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';

@Component({
  selector: 'app-request-undertaking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSnackBarModule,
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
  
  // 1. References
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  // 2. Form & State
  undertakingForm!: FormGroup;
  currentStep = 0;
  mode: 'CREATE' | 'UPDATE' = 'CREATE';
  showUpdateSubmit = false;
  currentTransactionId: string | number | null = null;
  
  // This will display the formatted ID (e.g. UND2026011200100)
  channelRef: string = 'New Transaction';

  // 3. Sidebar Configuration
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
    private undertakingService: UndertakingIssuanceService
  ) {
    this.buildForm();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['transactionId'];
      if (id) {
        this.enterEditMode(id);
      } else {
        this.enterCreateMode();
      }
    });
  }

  // ==========================================
  //  SCROLL & NAVIGATION LOGIC
  // ==========================================

  scrollToSection(index: number) {
    this.currentStep = index;
    const element = document.getElementById(`section-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onScroll(event: Event): void {
    const container = event.target as HTMLElement;
    const scrollPosition = container.scrollTop + 150;

    for (let i = 0; i < this.undertakingSteps.length; i++) {
      const element = document.getElementById(`section-${i}`);
      if (element) {
        const top = element.offsetTop;
        const bottom = top + element.offsetHeight;

        if (scrollPosition >= top && scrollPosition < bottom) {
          this.currentStep = i;
          break; 
        }
      }
    }
  }

  // ==========================================
  //  FORM BUILDER
  // ==========================================

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
        undertakingAmount: [null, [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
        variationPlus: [''],
        variationMinus: [''],
        issuanceCharges: [''],
        correspondentCharges: [''],
        supplementaryInfo: [''],
        
        // --- FIXED: CamelCase consistency and added missing fields ---
        textOfUndertakingInfo: [''],      // Fixed casing
        underlyingTransactionInfo: [''],  // Fixed casing
        presentationInfo: [''],
        
        // Added missing fields so patchValue works
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
        demandOption: [''],        // Fixed casing (was DemandOption)
        governingLawsType: [''],   // Fixed casing (was governinglawsType)
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

  get generalDetails(): FormGroup { return this.undertakingForm.get('generalDetails') as FormGroup; }
  get applicantBeneficiary(): FormGroup { return this.undertakingForm.get('applicantBeneficiary') as FormGroup; }
  get bankForm(): FormGroup { return this.undertakingForm.get('bankForm') as FormGroup; }
  get undertakingDetails(): FormGroup { return this.undertakingForm.get('undertakingDetails') as FormGroup; }
  get instructions(): FormGroup { return this.undertakingForm.get('instructions') as FormGroup; }
  get attachmentsArray(): FormArray { return this.undertakingForm.get('attachments') as FormArray; }

  // ==========================================
  //  MODES (Create vs Edit)
  // ==========================================

  private enterCreateMode(): void {
    this.mode = 'CREATE';
    this.showUpdateSubmit = false;
    this.currentTransactionId = null;
    this.channelRef = 'New Transaction';
    this.undertakingForm.reset();
    
    // Defaults
    this.generalDetails.patchValue({ 
        productType: 'Undertaking', 
        modeOfTransmission: 'SWIFT',
        currency: 'USD'
    });
  }

  private enterEditMode(id: string): void {
    this.mode = 'UPDATE';
    this.showUpdateSubmit = true;
    this.currentTransactionId = id;

    // Use the Service which handles the ID formatting
    this.undertakingService.getTransactionById(id).subscribe({
      next: (tx) => {
        // Here we get the auto-generated "UND2026..." reference
        this.channelRef = tx.channelReference || `REF-${tx.id}`;
        
        // 1. Prefer 'formData' (nested JSON), otherwise fallback to flat 'tx'
        const data = tx.formData || tx; 
        
        // 2. Patch the Form
        this.undertakingForm.patchValue({
             generalDetails: data.generalDetails || {},
             applicantBeneficiary: data.applicantBeneficiary || {},
             bankForm: data.bankForm || {},
             undertakingDetails: data.undertakingDetails || {},
             instructions: data.instructions || {}
        });

        // 3. Patch Attachments (Rebuild Array)
        if (data.attachments && Array.isArray(data.attachments.files)) {
            this.rebuildAttachments(data.attachments.files);
        } else if (data.attachments && Array.isArray(data.attachments)) {
             this.rebuildAttachments(data.attachments);
        }
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Transaction not found', 'Close', { duration: 3000 });
        this.router.navigate(['/undertaking-issuance/inquiries-records']);
      }
    });
  }

  private rebuildAttachments(files: any[]) {
      this.attachmentsArray.clear();
      files.forEach((file: any) => {
          this.attachmentsArray.push(this.fb.group({
              fileName: file.fileName,
              size: file.size,
              type: file.type,
              content: file.content || null 
          }));
      });
  }

  // ==========================================
  //  PAYLOAD BUILDER
  // ==========================================

  private createPayload(): any {
    const rawForm = this.undertakingForm.getRawValue();
    const safeValue = (val: any) => (val === '' || val === undefined) ? null : val;

    return {
       id: this.currentTransactionId,
       // We send the channel reference back so the backend knows it exists
       channelReference: this.channelRef !== 'New Transaction' ? this.channelRef : null,
       
       productType: safeValue(rawForm.generalDetails?.productType),
       applicantName: safeValue(rawForm.applicantBeneficiary?.applicantName),
       beneficiaryName: safeValue(rawForm.applicantBeneficiary?.beneficiaryName),
       
       undertakingAmount: rawForm.undertakingDetails?.undertakingAmount ? Number(rawForm.undertakingDetails.undertakingAmount) : null,
       currency: safeValue(rawForm.undertakingDetails?.currency),
       expiryDate: safeValue(rawForm.undertakingDetails?.expiryDate),
       
       formData: rawForm
    };
  }

  // ==========================================
  //  ACTIONS
  // ==========================================

// Helper to handle success navigation
  private navigateToSuccess(transaction: any) {
    this.router.navigate(['/undertaking-issuance/success'], { // Ensure this route exists in your routes.ts
      state: {
        transaction: transaction,
        tnxId: transaction.id, // or transaction.tnxId depending on backend
        channelReference: transaction.channelReference,
        
        // Dynamic Labels for the Success Screen
        labels: {
          listingLabel: 'Undertaking Listing',
          createLabel: 'New Undertaking'
        },
        
        // Dynamic Routes for the buttons
        routes: {
          listingRoute: '/undertaking-issuance/inquiries-records',
          createRoute: '/undertaking-issuance/request-undertaking' // or whichever route resets the form
        }
      }
    });
  }

saveForm(): void {
    // FIX: Send raw form value directly. Pass ID separately if needed.
    const rawForm = this.undertakingForm.getRawValue();
    
    this.undertakingService.saveDraft(rawForm, this.currentTransactionId).subscribe({
      next: (res) => {
        if (!res) {
          this.snackBar.open('Error saving draft', 'Close', { duration: 3000 });
          return;
        }
        this.navigateToSuccess(res);
      },
      error: (err) => {
        console.error('Save Draft Error:', err);
        this.snackBar.open('Error saving draft.', 'Close', { duration: 3000 });
      }
    });
  }

 update(): void {
    if (!this.currentTransactionId) return;

    // FIX: Send raw form. The Service will extract the ID or we pass it explicitly.
    const rawForm = this.undertakingForm.getRawValue();
    // Ensure ID is attached for the update
    rawForm.id = this.currentTransactionId; 

    this.undertakingService.updateDraft(rawForm).subscribe({
      next: (res) => {
        if (!res) {
          this.snackBar.open('Error updating draft', 'Close', { duration: 3000 });
          return;
        }
        this.navigateToSuccess(res);
      },
      error: (err) => {
        console.error('Update Error:', err);
        this.snackBar.open('Error updating draft', 'Close', { duration: 3000 });
      }
    });
  }

  submit(): void {
    if (!this.currentTransactionId) {
       this.snackBar.open('Please save as draft first', 'Close', { duration: 3000 });
       return;
    }
    
    this.undertakingService.submitTransaction(this.currentTransactionId).subscribe({
        next: (res) => {
            // Redirect to success page
            this.navigateToSuccess(res);
        },
        error: (err) => {
            console.error('Submit Error:', err);
            this.snackBar.open('Error submitting transaction', 'Close', { duration: 3000 });
        }
    });
  }
  back(): void {
    this.router.navigate(['/undertaking-issuance/inquiries-records']);
  }

  // ==========================================
  //  UI UTILS
  // ==========================================

  private scrollToFirstInvalid() {
     if(this.generalDetails.invalid) this.scrollToSection(0);
     else if(this.applicantBeneficiary.invalid) this.scrollToSection(1);
     else if(this.bankForm.invalid) this.scrollToSection(2);
     else if(this.undertakingDetails.invalid) this.scrollToSection(3);
     else if(this.instructions.invalid) this.scrollToSection(4);
  }

  updateAttachments(files: File[]) {
    this.attachmentsArray.clear();
    files.forEach(file => {
      this.attachmentsArray.push(this.fb.group({
        fileName: file.name,
        size: file.size,
        type: file.type,
        fileObj: file 
      }));
    });
  }
}