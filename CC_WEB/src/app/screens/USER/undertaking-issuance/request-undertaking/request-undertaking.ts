import { Component, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
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
// import { preview } from "../components/preview/preview";


@Component({
  selector: 'app-request-undertaking',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Sidebar,
    generalDetails,
    ApplicationBeneficiary,
    BankDetails,
    UndertakingDetails,
    Attachments,
    generalDetails,
    InstructionsBank
],
  templateUrl: './request-undertaking.html',
  styleUrls: ['./request-undertaking.scss'],
})
export class RequestUndertaking implements AfterViewInit {
  currentStep = 0;

  undertakingSteps = [
    { label: "General Details" },
    { label: "Applicant & Beneficiary Details" },
    { label: "Bank Details" },
    { label: "Undertaking Details" },
    { label: "Instructions For The Bank Only" },
    { label: "Attachments" },
    // { label: "Preview" }
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
      generalDetailsform: this.fb.group({
        productType: [''],
        modeOfTransmission: [''],
        formOfUndertaking: [''],
        purpose: ['']
      }),

      // Applicant & Beneficiary Details
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

      // Bank Details
      bankForm: this.fb.group({
        recipientBankName: [''],
        issuerReference: [''],
        selectedTab: [''],
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

      // Instructions to Bank
      instructions: this.fb.group({
        deliveryType: [''],
        deliveryMode: [''],
        deliveryTo: [''],
        principalAccount: [''],
        feeAccount: [''],
        otherInstructions: ['', [Validators.maxLength(210)]]
      })

      // REMOVED attachmentsForm - we'll handle attachments differently
    });
  }

  // Form getters for child components
  get generalDetailsForm(): FormGroup {
    return this.importForm.get('generalDetails') as FormGroup;
  }

  get applicationBeneficary(): FormGroup {
    return this.importForm.get('applicantBeneficiary') as FormGroup;
  }

  get bankForm(): FormGroup {
    return this.importForm.get('bankForm') as FormGroup;
  }

  get undertakingdetail(): FormGroup {
    return this.importForm.get('undertakingDetails') as FormGroup;
  }

  get instructionsbank(): FormGroup {
    return this.importForm.get('instructions') as FormGroup;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const sections = document.querySelectorAll('section');
      const scrollArea = document.querySelector('.scroll-area');

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const index = Array.from(sections)
                .indexOf(entry.target as HTMLElement);
              this.currentStep = index;
            }
          }
        },
        {
          threshold: 0.4,
          root: scrollArea
        }
      );

      sections.forEach(section => observer.observe(section));
    }, 200);
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
    
    // Save form data (you can implement API call here)
    console.log('Form saved:', formData);
    
    // Show success message
    this.snackBar.open('Undertaking request saved successfully!', 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  submit() {
    console.log('Submitting form...');
    console.log('Form value:', this.importForm.value);
    console.log('Uploaded files:', this.uploadedFiles);

    if (this.importForm.invalid) {
      this.importForm.markAllAsTouched();
      alert("Please complete all required fields before submitting.");
      return;
    }

    // Prepare complete data for shared service
    const formData = {
      ...this.importForm.value,
      attachments: this.prepareAttachmentsForPreview()
    };

    console.log('Data being saved to shared service:', formData);

    // Save to shared service
    this.dataService.setFormData(formData);

    // Navigate to preview
    this.router.navigate(['/undertaking-issuance/preview']);
  }

  private prepareAttachmentsForPreview() {
    // Create the attachments array that preview expects
    return this.uploadedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      file: file  // Keep the file object for download
    }));
  }

  private markAllFieldsAsTouched() {
    this.importForm.markAllAsTouched();
    
    // Also mark all child forms
    [
      this.generalDetailsForm,
      this.applicationBeneficary,
      this.bankForm,
      this.undertakingdetail,
      this.instructionsbank
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
      { group: this.generalDetailsForm, index: 0 },
      { group: this.applicationBeneficary, index: 1 },
      { group: this.bankForm, index: 2 },
      { group: this.undertakingdetail, index: 3 },
      { group: this.instructionsbank, index: 4 }
    ];

    for (const section of sections) {
      if (section.group.invalid) {
        this.scrollToSection(section.index);
        break;
      }
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

  private formatDates(formData: any) {
    if (formData.undertakingDetailsForm?.expiryDate) {
      const expiryDate = formData.undertakingDetailsForm.expiryDate;
      if (expiryDate instanceof Date) {
        formData.undertakingDetailsForm.expiryDate = expiryDate.toISOString().split('T')[0];
      }
    }

    if (formData.undertakingDetailsForm?.contractDate) {
      const contractDate = formData.undertakingDetailsForm.contractDate;
      if (contractDate instanceof Date) {
        formData.undertakingDetailsForm.contractDate = contractDate.toISOString().split('T')[0];
      }
    }
  }

  // Method to handle file uploads from child component
  updateAttachments(files: File[]) {
    console.log('Files received from attachments component:', files);
    this.uploadedFiles = files;
  }
}
