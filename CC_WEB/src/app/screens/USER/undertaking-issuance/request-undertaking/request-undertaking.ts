import { Component, AfterViewInit, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

// Child components
import { Sidebar } from "../../../../core/sidebar/sidebar";
import { generalDetails } from "../components/general-details/general-details";
import { ApplicationBeneficiary } from "../components/application-beneficiary/application-beneficiary";
import { BankDetails } from "../components/bank-details/bank-details";
import { UndertakingDetails } from "../components/undertaking-details/undertaking-details";
import { InstructionsBank } from "../components/instructions-bank/instructions-bank";
import { Attachments } from "../components/attachments/attachments";
import { SharedService } from '../../../../core/services/user-service/shared-form-service/shared-service';


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
    { label: "Instructions For The Bank Only" },
    { label: "Attachments" },
    { label: "Preview" }
  ];

  // MAIN MASTER FORM
  importForm!: FormGroup;

  // Store files separately for easier access
  uploadedFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dataService: SharedService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.importForm = this.fb.group({
      // General Details
      generalDetails: this.fb.group({
        productType: ['' ],
        modeOfTransmission: ['' ],
        formOfUndertaking: ['' ],
        purpose: ['' ]
      }),

      // Applicant & Beneficiary Details
      applicantBeneficiary: this.fb.group({
        applicantName: ['' ],
        applicantAddress1: ['' ],
        applicantAddress2: [''],
        applicantAddress3: [''],
        beneficiaryName: ['' ],
        beneficiaryAddress1: ['' ],
        beneficiaryAddress2: [''],
        beneficiaryAddress3: [''],
        beneficiaryCountry: ['' ]
      }),

      // Bank Details
      bankForm: this.fb.group({
        recipientBankName: ['' ],
        issuerReference: ['' ],
        selectedTab: ['issuing'],
        issuanceType: [''],
        swift: [''],
        bankName: [''],
        address1: [''],
        address2: [''],
        address3: [''],
        country: ['']
      }),

      // Undertaking Details
      undertakingDetails: this.fb.group({
        typeOfUndertaking: ['' ],
        effectiveOption: [''],
        expiryType: [''],
        expiryDate: [''],
        currency: ['' ],
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

      // Instructions to Bank
      instructions: this.fb.group({
        deliveryType: ['' ],
        deliveryMode: ['' ],
        deliveryTo: ['' ],
        principalAccount: ['' ],
        feeAccount: [''],
        otherInstructions: ['', [Validators.maxLength(210)]]
      }),

      // Attachments
      attachments: this.fb.group({
        files: this.fb.array([])
      })
    });
  }

  ngOnInit() {
    // Load saved data if exists
    this.loadSavedData();
    
    // Debug: Check form structure
    console.log('Form initialized with sections:');
    console.log('generalDetails exists:', !!this.importForm.get('generalDetails'));
    console.log('applicantBeneficiary exists:', !!this.importForm.get('applicantBeneficiary'));
    console.log('bankForm exists:', !!this.importForm.get('bankForm'));
    console.log('undertakingDetails exists:', !!this.importForm.get('undertakingDetails'));
    console.log('instructions exists:', !!this.importForm.get('instructions'));
    console.log('attachments exists:', !!this.importForm.get('attachments'));
    
    // Debug: Check getters
    console.log('Getter generalDetails:', this.generalDetails);
    console.log('Getter applicantBeneficiary:', this.applicantBeneficiary);
    console.log('Getter bankForm:', this.bankForm);
    console.log('Getter undertakingDetails:', this.undertakingDetails);
    console.log('Getter instructions:', this.instructions);
  }

  // Form getters for child components - CORRECTED
  get generalDetails(): FormGroup {
    return this.importForm.get('generalDetails') as FormGroup;
  }

  get applicantBeneficiary(): FormGroup {
    return this.importForm.get('applicantBeneficiary') as FormGroup;
  }

  get bankForm(): FormGroup {
    return this.importForm.get('bankForm') as FormGroup;
  }

  get undertakingDetails(): FormGroup {
    return this.importForm.get('undertakingDetails') as FormGroup;
  }

  get instructions(): FormGroup {
    return this.importForm.get('instructions') as FormGroup;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setupIntersectionObserver();
    }, 200);
  }

  private setupIntersectionObserver() {
    const sections = document.querySelectorAll('section');
    const scrollArea = document.querySelector('.scroll-area');

    if (!sections.length || !scrollArea) {
      console.warn('No sections or scroll area found');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Array.from(sections)
              .indexOf(entry.target as HTMLElement);
            if (index !== -1) {
              this.currentStep = index;
            }
          }
        }
      },
      {
        threshold: 0.4,
        root: scrollArea
      }
    );

    sections.forEach(section => observer.observe(section));
  }

  scrollToSection(i: number) {
    this.currentStep = i;
    
    // Handle navigation to preview section
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
      this.router.navigate(['/dashboard']);
    }
  }

  saveForm() {
    if (this.importForm.invalid) {
      this.markAllFieldsAsTouched();
      this.showValidationError();
      return;
    }

    // Prepare form data for saving
    const formData = this.prepareFormData();
    
    // Save to local storage
    this.saveToLocalStorage(formData);
    
    // Save to shared service if needed
    this.dataService.setFormData({ form: this.importForm, uploadedFiles: this.uploadedFiles });
    
    // Show success message
    this.snackBar.open('Undertaking request saved successfully!', 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
    
    console.log('Form saved locally:', formData);
  }

  submit() {
    console.log('Submitting form...');
    console.log('Form sections:', {
      generalDetails: this.generalDetails?.value,
      applicantBeneficiary: this.applicantBeneficiary?.value,
      bankForm: this.bankForm?.value,
      undertakingDetails: this.undertakingDetails?.value,
      instructions: this.instructions?.value,
      uploadedFiles: this.uploadedFiles
    });

    if (this.importForm.invalid) {
      this.importForm.markAllAsTouched();
      this.showValidationError();
      return;
    }

    // Prepare complete data for preview
    const previewData = {
      form: this.importForm,  // Pass the entire form
      uploadedFiles: this.uploadedFiles
    };

    console.log('Saving to shared service:', previewData);

    // Save to shared service
    this.dataService.setFormData(previewData);

    // Navigate to preview
    this.router.navigate(['/undertaking-issuance/preview']);
  }

  updateAttachments(files: File[]) {
    console.log('Files received from attachments component:', files);
    this.uploadedFiles = files;
    
    // Also update the form's attachments array
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

  // ===================== HELPER METHODS =====================

  private loadSavedData() {
    try {
      const savedData = localStorage.getItem('undertakingFormData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Update form values
        this.importForm.patchValue(parsedData);
        
        // Load files if they were saved
        if (parsedData.uploadedFiles) {
          console.log('Found saved form data, but files need to be re-uploaded');
        }
        
        console.log('Loaded saved form data from localStorage');
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }

  private saveToLocalStorage(formData: any) {
    try {
      // Clone the data to avoid circular references
      const dataToSave = {
        ...formData,
        uploadedFiles: [] // Don't save File objects to localStorage
      };
      
      localStorage.setItem('undertakingFormData', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
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
      // Don't include the actual file object as it can't be serialized
    }));
  }

  private formatDates(formData: any) {
    // Format undertaking dates
    if (formData.undertakingDetails?.expiryDate) {
      const expiryDate = formData.undertakingDetails.expiryDate;
      if (expiryDate instanceof Date) {
        formData.undertakingDetails.expiryDate = expiryDate.toISOString().split('T')[0];
      }
    }

    if (formData.undertakingDetails?.contractDate) {
      const contractDate = formData.undertakingDetails.contractDate;
      if (contractDate instanceof Date) {
        formData.undertakingDetails.contractDate = contractDate.toISOString().split('T')[0];
      }
    }
  }

  private markAllFieldsAsTouched() {
    this.importForm.markAllAsTouched();
    
    // Also mark all child forms
    [
      this.generalDetails,
      this.applicantBeneficiary,
      this.bankForm,
      this.undertakingDetails,
      this.instructions
    ].forEach(form => form?.markAllAsTouched());
  }

  private showValidationError() {
    const invalidFields = this.getInvalidFields();
    
    if (invalidFields.length > 0) {
      alert(`Please complete all required fields before proceeding.\n\nMissing or invalid fields:\n• ${invalidFields.join('\n• ')}`);
      
      // Scroll to first invalid section
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

  // ===================== FORM RESET/CLEAR METHODS =====================

  clearForm() {
    if (confirm('Are you sure you want to clear all form data?')) {
      this.importForm.reset();
      this.uploadedFiles = [];
      localStorage.removeItem('undertakingFormData');
      this.snackBar.open('Form cleared successfully!', 'Close', {
        duration: 3000
      });
    }
  }

  // ===================== VALIDATION METHODS =====================

  isSectionValid(sectionName: string): boolean {
    const section = this.importForm.get(sectionName);
    return section ? section.valid : false;
  }

  getSectionCompletion(sectionName: string): number {
    const section = this.importForm.get(sectionName) as FormGroup;
    if (!section) return 0;
    
    const totalControls = Object.keys(section.controls).length;
    const validControls = Object.keys(section.controls).filter(
      key => section.get(key)?.valid
    ).length;
    
    return Math.round((validControls / totalControls) * 100);
  }

  // ===================== FORM STATUS =====================

  getFormCompletionPercentage(): number {
    const sections = [
      this.generalDetails,
      this.applicantBeneficiary,
      this.bankForm,
      this.undertakingDetails,
      this.instructions
    ];
    
    let totalControls = 0;
    let validControls = 0;
    
    sections.forEach(section => {
      if (section) {
        totalControls += Object.keys(section.controls).length;
        validControls += Object.keys(section.controls).filter(
          key => section.get(key)?.valid
        ).length;
      }
    });
    
    return totalControls > 0 ? Math.round((validControls / totalControls) * 100) : 0;
  }

  isFormComplete(): boolean {
    return this.importForm.valid && this.getFormCompletionPercentage() >= 80;
  }
}