import { Component, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

// Child components
import { Sidebar } from "../../../../core/sidebar/sidebar";
import { GeneralDetails } from "../components/general-details/general-details";
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
    CommonModule,
    ReactiveFormsModule,
    Sidebar,
    GeneralDetails,
    ApplicationBeneficiary,
    BankDetails,
    UndertakingDetails,
    InstructionsBank,
    Attachments,
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
        productType: ['bidbond'],
        modeOfTransmission: ['SWIFT'],
        formOfUndertaking: ['demandguarantee',],
        purpose: ['issuanceofundertaking']
      }),

      // Applicant & Beneficiary Details
      applicantBeneficiaryForm: this.fb.group({
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
        recipientBankName: ['' ],
        issuerReference: ['' ],
        selectedTab: ['issuing'],
        issuanceType: ['direct'],
        swift: [''],
        bankName: [''],
        address1: [''],
        address2: [''],
        address3: [''],
        country: ['']
      }),

      // Undertaking Details
      undertakingDetailsForm: this.fb.group({
        typeOfUndertaking: ['bid' ],
        effectiveOption: ['openIssuance'],
        expiryType: ['open'],
        expiryDate: [''],
        currency: ['USD' ],
        undertakingAmount: [0, [Validators.required, Validators.min(0)]],
        variationPlus: [0],
        variationMinus: [0],
        issuanceCharges: ['applicant'],
        correspondentCharges: ['applicant'],
        supplementaryInfo: [''],
        basicextensionType: ['regular'],
        increaseDecreaseType: ['regular'],
        contractType: ['sale'],
        contractDate: [''],
        contractCurrency: ['USD'],
        contractAmount: [0],
        percentageCovered: [0],
        contractReference: [''],
        applicableRules: ['urdg'],
        governinglawsType: ['pk'],
        subdivision: [''],
        jurisdiction: [''],
        DemandOption: ['multipleDemandnot'],
        tsOption: ['bkstandard'],
        languageType: ['en'],
        textofundertakingInfo: [''],
        underlyingtransactionInfo: ['' ],
        presentationInfo: ['']
      }),

      // Instructions to Bank
      instructionsForm: this.fb.group({
        deliveryType: ['original'],
        deliveryMode: ['courier'],
        deliveryTo: ['ourselves'],
        principalAccount: [''],
        feeAccount: [''],
        otherInstructions: ['', [Validators.maxLength(210)]]
      }),

      // Attachments Form
      attachmentsForm: this.fb.group({
        files: this.fb.array([])
      })
    });
  }

  // Form getters for child components
  get generalDetailsForm(): FormGroup {
    return this.importForm.get('generalDetails') as FormGroup;
  }

  get applicationbeneficary(): FormGroup {
    return this.importForm.get('applicantBeneficiaryForm') as FormGroup;
  }

  get bankForm(): FormGroup {
    return this.importForm.get('bankForm') as FormGroup;
  }

  get undertakingdetail(): FormGroup {
    return this.importForm.get('undertakingDetailsForm') as FormGroup;
  }

  get instructionsbank(): FormGroup {
    return this.importForm.get('instructionsForm') as FormGroup;
  }

  get attachmentsForm(): FormGroup {
    return this.importForm.get('attachmentsForm') as FormGroup;
  }

  get attachmentsArray(): FormArray {
    return this.attachmentsForm.get('files') as FormArray;
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
      this.submitForm();
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

  submitForm() {
    // Validate form before preview
    if (this.importForm.invalid) {
      this.markAllFieldsAsTouched();
      this.showValidationError();
      return;
    }

    // Prepare complete form data
    const formData = this.prepareFormData();
    
    // Save data to shared service
    this.dataService.setFormData(formData);

    // Navigate to Preview screen
    this.router.navigate(['/RequestUndertaking/preview']);
  }

  private markAllFieldsAsTouched() {
    this.importForm.markAllAsTouched();
    
    // Also mark all child forms
    [
      this.generalDetailsForm,
      this.applicationbeneficary,
      this.bankForm,
      this.undertakingdetail,
      this.instructionsbank,
      this.attachmentsForm
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
    
    // Check each form group
    const checkGroup = (group: FormGroup, prefix: string = '') => {
      Object.keys(group.controls).forEach(key => {
        const control = group.get(key);
        if (control instanceof FormGroup) {
          checkGroup(control, `${prefix}${key}.`);
        } else if (control instanceof FormArray) {
          control.controls.forEach((ctrl, index) => {
            if (ctrl instanceof FormGroup) {
              checkGroup(ctrl, `${prefix}${key}[${index}].`);
            }
          });
        } else if (control?.invalid && control?.errors?.['required']) {
          invalidFields.push(`${prefix}${key}`);
        }
      });
    };
    
    checkGroup(this.importForm);
    return invalidFields;
  }

  private scrollToFirstInvalidSection() {
    // Determine which section has invalid fields
    const sections = [
      { group: this.generalDetailsForm, index: 0 },
      { group: this.applicationbeneficary, index: 1 },
      { group: this.bankForm, index: 2 },
      { group: this.undertakingdetail, index: 3 },
      { group: this.instructionsbank, index: 4 },
      { group: this.attachmentsForm, index: 5 }
    ];

    for (const section of sections) {
      if (section.group.invalid) {
        this.scrollToSection(section.index);
        break;
      }
    }
  }

  private prepareFormData() {
    // Create a clean copy of form data
    const formData = {
      ...this.importForm.value,
      attachments: this.prepareAttachmentsData()
    };

    // Convert dates to ISO string format if needed
    this.formatDates(formData);
    
    return formData;
  }

  private prepareAttachmentsData() {
    const filesArray = this.attachmentsArray.value;
    return filesArray.map((file: any) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      // For base64 encoding if needed:
      // content: file.content
    }));
  }

  private formatDates(formData: any) {
    // Format expiry date
    if (formData.undertakingDetailsForm?.expiryDate) {
      const expiryDate = formData.undertakingDetailsForm.expiryDate;
      if (expiryDate instanceof Date) {
        formData.undertakingDetailsForm.expiryDate = expiryDate.toISOString().split('T')[0];
      }
    }

    // Format contract date
    if (formData.undertakingDetailsForm?.contractDate) {
      const contractDate = formData.undertakingDetailsForm.contractDate;
      if (contractDate instanceof Date) {
        formData.undertakingDetailsForm.contractDate = contractDate.toISOString().split('T')[0];
      }
    }
  }

  // Method to handle file uploads from child component
  updateAttachments(files: File[]) {
    const filesArray = this.attachmentsForm.get('files') as FormArray;
    filesArray.clear();

    files.forEach(file => {
      filesArray.push(this.fb.group({
        name: [file.name],
        size: [file.size],
        type: [file.type],
        lastModified: [file.lastModified],
        file: [file]
      }));
    });

    // Update the main form
    this.importForm.get('attachmentsForm')?.setValue({
      files: filesArray.value
    });
  }
}