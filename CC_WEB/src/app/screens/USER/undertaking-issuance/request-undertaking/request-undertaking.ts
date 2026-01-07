import { Component, AfterViewInit, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common'; // <--- IMPORT THIS
import { MatSnackBar } from '@angular/material/snack-bar';

// ... (Your other imports remain the same)
import { Sidebar } from "../../../../core/sidebar/sidebar";
import { generalDetails } from "../components/general-details/general-details";
import { ApplicationBeneficiary } from "../components/application-beneficiary/application-beneficiary";
import { BankDetails } from "../components/bank-details/bank-details";
import { UndertakingDetails } from "../components/undertaking-details/undertaking-details";
import { InstructionsBank } from "../components/instructions-bank/instructions-bank";
import { Attachments } from "../components/attachments/attachments";
import { SharedService } from '../../../../core/services/user-service/shared-form-service/shared-service';
import { UndertakingIssuanceService } from '../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';

@Component({
  selector: 'app-request-undertaking',
  standalone: true,
  imports: [
    Sidebar,
    generalDetails,
    ApplicationBeneficiary,
    BankDetails,
    UndertakingDetails,
    Attachments,
    InstructionsBank,
  ],
  templateUrl: './request-undertaking.html',
  styleUrls: ['./request-undertaking.scss'],
})
export class RequestUndertaking implements OnInit, AfterViewInit {
  currentStep = 0;
  undertakingSteps = [
    { label: "General Details" },
    { label: "Applicant & Beneficiary Details" },
    { label: "Bank Details" },
    { label: "Undertaking Details" },
    { label: "Instructions For Bank" },
    { label: "Attachments" },
  ];

  importForm!: FormGroup;
  uploadedFiles: File[] = [];

  // STATE MANAGEMENT
  isEditMode: boolean = false;
  currentTransactionId: string | number | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location, // <--- Inject Location Service
    private sharedService: SharedService,
    private backendService: UndertakingIssuanceService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    // Priority 1: Check URL for ID (Deep linking/Refresh support)
    this.route.queryParams.subscribe(params => {
      const urlId = params['transactionId'];
      
      if (urlId) {
        // Mode: UPDATE (via URL)
        this.currentTransactionId = urlId;
        this.isEditMode = true;
        this.loadDataFromBackend(urlId);
      } else {
        // Priority 2: Check SharedService (Navigation from Pending Records)
        this.checkForSharedData();
      }
    });
  }

  // ==========================================
  // 1. INITIALIZATION LOGIC
  // ==========================================

  private initializeForm(): void {
    // ... (Your existing form group definition stays exactly the same)
    this.importForm = this.fb.group({
      generalDetails: this.fb.group({
        productType: [''],
        modeOfTransmission: [''],
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
        selectedTab: ['issuing'],
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
        currency: [''],
        undertakingAmount: [0, [Validators.required, Validators.min(0)]],
        variationPlus: [0],
        variationMinus: [0],
        issuanceCharges: [''],
        correspondentCharges: [''],
        supplementaryInfo: [''],
        basicextensionType: [''],
        increaseDecreaseType: [''],
        contractType: [''],
        contractDate: [''],
        contractCurrency: [''],
        contractAmount: [0],
        percentageCovered: [0],
        contractReference: [''],
        applicableRules: [''],
        governinglawsType: [''],
        subdivision: [''],
        jurisdiction: [''],
        DemandOption: [''],
        tsOption: [''],
        languageType: [''],
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
        otherInstructions: ['', [Validators.maxLength(210)]]
      }),
      attachments: this.fb.group({
        files: this.fb.array([])
      })
    });
  }

  /**
   * Scenario A: User clicked "Edit" from a list, data passed via Service
   */
  private checkForSharedData() {
    const sharedData = this.sharedService.getFormData();

    if (sharedData && sharedData.isEditMode) {
      console.log('Mode: UPDATE (via SharedService)');
      this.isEditMode = true;
      this.currentTransactionId = sharedData.transactionId;
      
      // Update URL immediately so if they refresh, they stay on this ID
      this.updateUrlWithId(this.currentTransactionId);

      if (sharedData.formData) {
        this.importForm.patchValue(sharedData.formData);
      }
    } else {
      console.log('Mode: CREATE');
      // Optional: Load from local storage for crash recovery
      this.loadSavedData();
    }
  }

  /**
   * Scenario B: User refreshed page with ?transactionId=123
   */
  private loadDataFromBackend(id: string | number) {
    this.isLoading = true;
    // Assuming you have a getTransactionById method. If not, you need to create one.
    this.backendService.getTransactionById(id).subscribe({
      next: (data) => {
        this.isLoading = false;
        // Map backend response to Form Structure if necessary
        this.importForm.patchValue(data); 
        this.snackBar.open('Record loaded successfully', 'Close', { duration: 2000 });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load transaction', err);
        this.snackBar.open('Error loading record', 'Close', { duration: 3000 });
      }
    });
  }

  // ==========================================
  // 2. SAVE & UPDATE LOGIC
  // ==========================================

  saveForm() {
    if (this.importForm.invalid) {
      this.markAllFieldsAsTouched();
      this.showValidationError();
      return;
    }

    const formData = this.prepareFormData();

    // The service should handle:
    // 1. POST if currentTransactionId is null
    // 2. PUT if currentTransactionId is set
    this.backendService.saveDraft(formData, this.currentTransactionId || undefined)
      .subscribe({
        next: (txn) => {
          // 1. Update State
          const newId = txn.id || txn.transactionId; // Adjust based on your API response
          this.currentTransactionId = newId;
          this.isEditMode = true;

          // 2. Update URL silently (without page reload)
          this.updateUrlWithId(newId);

          // 3. Feedback
          this.snackBar.open(`Draft saved! Reference: ${txn.channelReference || newId}`, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          // 4. Clean up
          this.sharedService.clearFormData();
          localStorage.removeItem('undertakingFormData');
        },
        error: (err) => {
          console.error('Save failed', err);
          this.snackBar.open('Failed to save draft.', 'Close', { duration: 3000 });
        }
      });
  }

  /**
   * Helper to change URL from /request to /request?transactionId=123
   */
  private updateUrlWithId(id: any) {
    const url = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: { transactionId: id },
      queryParamsHandling: 'merge', // merge with existing params if any
    }).toString();

    this.location.go(url); // Changes URL in browser bar without reloading
  }

  submit() {
    if (this.importForm.invalid) {
      this.markAllFieldsAsTouched();
      this.showValidationError();
      return;
    }

    // Pass data to Preview
    const dataForPreview = {
      formData: this.importForm.value,
      uploadedFiles: this.uploadedFiles,
      transactionId: this.currentTransactionId,
      isEditMode: this.isEditMode
    };

    this.sharedService.setFormData(dataForPreview);
    this.router.navigate(['/undertaking-issuance/preview']);
  }


  // ==========================================
  // 3. GETTERS & HELPERS
  // ==========================================
  
  get generalDetails(): FormGroup { return this.importForm.get('generalDetails') as FormGroup; }
  get applicantBeneficiary(): FormGroup { return this.importForm.get('applicantBeneficiary') as FormGroup; }
  get bankForm(): FormGroup { return this.importForm.get('bankForm') as FormGroup; }
  get undertakingDetails(): FormGroup { return this.importForm.get('undertakingDetails') as FormGroup; }
  get instructions(): FormGroup { return this.importForm.get('instructions') as FormGroup; }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setupIntersectionObserver();
    }, 200);
  }

  private setupIntersectionObserver() {
    const sections = document.querySelectorAll('section');
    const scrollArea = document.querySelector('.scroll-area');

    if (!sections.length || !scrollArea) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Array.from(sections).indexOf(entry.target as HTMLElement);
            if (index !== -1) {
              this.currentStep = index;
            }
          }
        }
      },
      { threshold: 0.4, root: scrollArea }
    );

    sections.forEach(section => observer.observe(section));
  }

  scrollToSection(i: number) {
    this.currentStep = i;
    if (i === 6) {
      this.submit();
      return;
    }
    const section = document.getElementById(`section-${i}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  previous() {
    if (this.currentStep > 0) {
      this.scrollToSection(this.currentStep - 1);
    } else {
      this.router.navigate(['/undertaking-issuance/pending-records']);
    }
  }

  updateAttachments(files: File[]) {
    this.uploadedFiles = files;
    const attachmentsArray = this.importForm.get('attachments.files') as any;
    if (attachmentsArray) {
      attachmentsArray.clear();
      files.forEach(file => {
        attachmentsArray.push(this.fb.group({
          name: [file.name],
          size: [file.size],
          type: [file.type],
          lastModified: [file.lastModified],
          file: [file]
        }));
      });
    }
  }

  private loadSavedData() {
    try {
      const savedData = localStorage.getItem('undertakingFormData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        this.importForm.patchValue(parsedData);
      }
    } catch (error) {
      console.error('Error loading local storage data:', error);
    }
  }

  private prepareFormData() {
    const formData = {
      ...this.importForm.value,
      attachments: this.prepareAttachmentsForPreview()
    };
    this.formatDates(formData);
    return formData;
  }

  private prepareAttachmentsForPreview() {
    return this.uploadedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    }));
  }

  private formatDates(formData: any) {
    if (formData.undertakingDetails?.expiryDate instanceof Date) {
      formData.undertakingDetails.expiryDate = formData.undertakingDetails.expiryDate.toISOString().split('T')[0];
    }
  }

  private markAllFieldsAsTouched() {
    this.importForm.markAllAsTouched();
    [this.generalDetails, this.applicantBeneficiary, this.bankForm, this.undertakingDetails, this.instructions]
      .forEach(form => form?.markAllAsTouched());
  }

  private showValidationError() {
    const invalidFields = this.getInvalidFields();
    if (invalidFields.length > 0) {
      alert(`Please complete all required fields.\nMissing: ${invalidFields.length} fields.`);
      this.scrollToFirstInvalidSection();
    }
  }

  private getInvalidFields(): string[] {
    const invalidFields: string[] = [];
    const checkGroup = (group: FormGroup, prefix: string = '') => {
      Object.keys(group.controls).forEach(key => {
        const control = group.get(key);
        if (control instanceof FormGroup) {
          checkGroup(control, `${prefix}${key}.`);
        } else if (control?.invalid && control?.errors?.['required']) {
          invalidFields.push(`${prefix}${key}`);
        }
      });
    };
    checkGroup(this.importForm);
    return invalidFields;
  }

  private scrollToFirstInvalidSection() {
    const sections = [
      { group: this.generalDetails, index: 0 },
      { group: this.applicantBeneficiary, index: 1 },
      { group: this.bankForm, index: 2 },
      { group: this.undertakingDetails, index: 3 },
      { group: this.instructions, index: 4 }
    ];

    for (const section of sections) {
      if (section.group.invalid) {
        this.scrollToSection(section.index);
        break;
      }
    }
  }
}