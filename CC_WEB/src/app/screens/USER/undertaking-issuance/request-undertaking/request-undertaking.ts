import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
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
  currentTransactionId: string | null = null;

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
    const scrollPosition = container.scrollTop + 100;

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
  //  FORM BUILDER & DATA LOADING
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
        applicantName: [''],
        applicantAddress1: [''],
        applicantAddress2: [''],
        applicantAddress3: [''],
        beneficiaryName: [''],
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
        expiryDate: [''],
        currency: ['USD'],
        undertakingAmount: [null, [Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
        variationPlus: [''],
        variationMinus: [''],
        issuanceCharges: [''],
        correspondentCharges: [''],
        supplementaryInfo: [''],
        textofundertakingInfo: [''],
        underlyingtransactionInfo: [''],
        presentationInfo: ['']
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

    this.undertakingService.getTransactionById(id).subscribe({
      next: (tx) => {
        const data = tx.formData || tx; 
        
        this.undertakingForm.patchValue({
             generalDetails: data.generalDetails || {},
             applicantBeneficiary: data.applicantBeneficiary || {},
             bankForm: data.bankForm || {},
             undertakingDetails: data.undertakingDetails || {},
             instructions: data.instructions || {}
        });
      },
      error: () => {
        this.snackBar.open('Transaction not found', 'Close', { duration: 3000 });
        this.router.navigate(['/undertaking-issuance/inquiries-records']);
      }
    });
  }

  private flattenForm(): any {
    return {
      ...this.undertakingForm.value.generalDetails,
      ...this.undertakingForm.value.applicantBeneficiary,
      ...this.undertakingForm.value.bankForm,
      ...this.undertakingForm.value.undertakingDetails,
      ...this.undertakingForm.value.instructions,
      attachments: this.undertakingForm.value.attachments
    };
  }

  // ==========================================
  //  ACTIONS (Save, Update, Submit)
  // ==========================================

  saveForm(): void {
    if (this.undertakingForm.invalid) {
      this.undertakingForm.markAllAsTouched();
      this.snackBar.open('Please check required fields marked in red', 'Close', { duration: 3000 });
      this.scrollToFirstInvalid();
      return;
    }

    const payload = this.flattenForm();

    this.undertakingService.saveDraft(payload).subscribe({
      next: (res: any) => {
        this.snackBar.open(`Draft saved successfully (ID: ${res.id})`, 'Close', { duration: 3000 });
        
        // --- NAVIGATION UPDATE ---
        // Redirect to Inquiries Page (Pending Tab)
        this.router.navigate(['/undertaking-issuance/inquiries-records'], { 
            queryParams: { tab: 'pending' } 
        });
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error saving draft.', 'Close', { duration: 3000 });
      }
    });
  }

  update(): void {
    if (!this.currentTransactionId) return;
    
    const payload = this.flattenForm();
    const finalPayload = { ...payload, id: this.currentTransactionId };

    this.undertakingService.updateDraft(finalPayload).subscribe({
      next: () => {
        this.snackBar.open('Draft updated successfully', 'Close', { duration: 3000 });
        
        // --- NAVIGATION UPDATE ---
        // Redirect to Inquiries Page (Pending Tab)
        this.router.navigate(['/undertaking-issuance/inquiries-records'], { 
            queryParams: { tab: 'pending' } 
        });
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error updating draft', 'Close', { duration: 3000 });
      }
    });
  }

  submit(): void {
    if (!this.currentTransactionId) {
       this.snackBar.open('Please save draft first', 'Close', { duration: 3000 });
       return;
    }
    
    const payload = this.flattenForm();
    const finalPayload = { ...payload, id: this.currentTransactionId };

    this.undertakingService.submitTransaction(this.currentTransactionId, finalPayload).subscribe({
        next: () => {
            this.snackBar.open('Transaction Submitted Successfully!', 'Close', { duration: 3000 });
            
            // --- NAVIGATION UPDATE ---
            // Redirect to Inquiries Page (Submitted Tab)
            this.router.navigate(['/undertaking-issuance/inquiries-records'], { 
                queryParams: { tab: 'submitted' } 
            });
        },
        error: (err) => {
            console.error(err);
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