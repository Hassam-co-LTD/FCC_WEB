import { Component, AfterViewInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Reuse same components
import { GeneralDetails } from '../amend-import/components/general-details/general-details';
import { ApplicantBeneficiary } from '../amend-import/components/applicant-beneficiary/applicant-beneficiary';
import { BankDetails } from '../amend-import/components/bank-details/bank-details';
import { AmountChargeDetails } from '../amend-import/components/amount-charge-details/amount-charge-details';
import { PaymentDetails } from '../amend-import/components/payment-details/payment-details';
import { ShipmentDetails } from '../amend-import/components/shipment-details/shipment-details';
import { NarrativeDetails } from '../amend-import/components/narrative-details/narrative-details';
import { Licenses } from '../amend-import/components/licenses/licenses';
import { InstructionToBank } from '../amend-import/components/instruction-to-bank/instruction-to-bank';
import { Attachments } from '../amend-import/components/attachments/attachments';
import { Preview } from '../amend-import/components/preview/preview';
import { Sidebar } from '../../../../../../core/sidebar/sidebar';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-amend-screen',
  standalone: true,
  imports: [
    MatButtonModule,
    MatRadioModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    Sidebar,
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
    Preview
],
  templateUrl: './amend.html',
  styleUrls: ['./amend.scss']
})
export class AmendScreen implements AfterViewInit {

  currentStep = 0;

  amendImportSteps = [
    { label: "General Details" },
    { label: "Applicant Details" },
    { label: "Bank Details" },
    { label: "Amount & Charges" },
    { label: "Payment Details" },
    { label: "Shipment Details" },
    { label: "Narrative Details" },
    { label: "Licenses" },
    { label: "Instructions to Bank" },
    { label: "Attachments" },
    { label: "Preview" }
  ];
  // MAIN MASTER FORM (fed to all steps)
  importAmendForm!: FormGroup;
  

  constructor(private fb: FormBuilder) {

    this.importAmendForm = this.fb.group({

      // Step 0 — General Details
      generalDetails: this.fb.group({
        productType: ['backtoback'],
        modeOfTransmission: ['SWIFT'],
        expiryDate: [''],
        placeOfExpiry: ['beneficiary'],
        featureIrrevocable: [false],
        featureRevolving: [false],
        featureTransferable: [false],
        applicableRules: ['EUCP'],
        confirmationInstruction: ['confirm'],
      }),

      // Add other
      applicantForm: this.fb.group({
        applicantName: ['', Validators.required],
        applicantAddress1: ['', Validators.required],
        applicantAddress2: [''],
        applicantAddress3: [''],

        // alternateName: [''],
        // alternateAddress1: [''],
        // alternateAddress2: [''],
        // alternateAddress3: [''],

        beneficiaryName: ['', Validators.required],
        beneficiaryAddress1: ['', Validators.required],
        beneficiaryAddress2: [''],
        beneficiaryAddress3: [''],
        beneficiaryCountry: ['', Validators.required]

      }),

      bankForm: this.fb.group({
        issuingBankName: ['', Validators.required],
        issuerReference: ['', Validators.required],
        advisingBankName: [''],
        adviseThroughBankName: ['']
      }),

      // Step 3 — Amount & Charges
      amountChargeForm: this.fb.group({
        currency: ['', Validators.required],
        amount: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
        variationType: ['percent'],
        variationPlus: [''],
        variationMinus: [''],
        issuingBankCharges: ['Applicant', Validators.required],
        outsideCountryCharges: ['Beneficiary', Validators.required],
        additionalAmountDetails: ['', Validators.maxLength(140)],
      }),

      paymentDetailsForm: this.fb.group({
        creditAvailableWith: ['', Validators.required],
        bankName: [''],
        creditAvailableBy: ['Payment', Validators.required],
        paymentDraftAt: ['Sight', Validators.required]
      }),

      shipmentForm: this.fb.group({
        shipmentFrom: ['', Validators.required],
        shipmentTo: ['', Validators.required],
        placeOfLoading: ['', Validators.required],
        placeOfDischarge: ['', Validators.required],
        lastShipmentDate: ['', Validators.required],
        shipmentPeriodNarrative: ['', [Validators.required, Validators.maxLength(390)]],
        partialShipment: ['Allowed', Validators.required],
        transhipment: ['Not Allowed', Validators.required]
      }),
      narrativeForm: this.fb.group({
        descriptionOfGoods: ['', [Validators.required, Validators.maxLength(6500)]],
        documentsRequired: ['', [Validators.required, Validators.maxLength(6500)]],
        additionalInstructions: ['', [Validators.maxLength(2000)]],
        otherDetails: ['']
      }),
      instructionForm: this.fb.group({
        principalAccount: ['', Validators.required],
        feeAccount: ['', Validators.required],
        otherInstructions: ['', [Validators.maxLength(31525)]]
      }),
      attachments: this.fb.array([]),
    });
  }

  // Easy getter
  get generalDetailsForm(): FormGroup {
    return this.importAmendForm.get('generalDetails') as FormGroup;
  }

  get applicantForm(): FormGroup {
    return this.importAmendForm.get('applicantForm') as FormGroup;
  }

  get bankForm(): FormGroup {
    return this.importAmendForm.get('bankForm') as FormGroup;
  }
  get amountChargeForm(): FormGroup {
    return this.importAmendForm.get('amountChargeForm') as FormGroup;
  }
  get paymentDetailsForm(): FormGroup {
    return this.importAmendForm.get('paymentDetailsForm') as FormGroup;
  }
  get shipmentForm(): FormGroup {
    return this.importAmendForm.get('shipmentForm') as FormGroup;
  }
  get narrativeForm(): FormGroup {
    return this.importAmendForm.get('narrativeForm') as FormGroup;
  }
  get instructionForm(): FormGroup {
    return this.importAmendForm.get('instructionForm') as FormGroup;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const sections = document.querySelectorAll('section');

      const observer = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const index = Array.from(sections).indexOf(entry.target as HTMLElement);
              this.currentStep = index;
            }
          }
        },
        {
          threshold: 0.4,
          root: document.querySelector('.scroll-area')
        }
      );

      sections.forEach(section => observer.observe(section));
    }, 200); // ← gives Angular time to render children
  }

  scrollToSection(i: number) {
    this.currentStep = i;
    const section = document.getElementById(`section-${i}`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  next() {
    if (this.currentStep < this.amendImportSteps.length - 1) {
      this.scrollToSection(this.currentStep + 1);
    }
  }

  previous() {
    if (this.currentStep > 0) {
      this.scrollToSection(this.currentStep - 1);
    }
  }
   updateAttachments(files: File[]) {
     const arr = this.importAmendForm.get('attachments') as FormArray;
      arr.clear();
  
      files.forEach(file => {
        arr.push(this.fb.group({
          title: file.name.replace(/\.[^/.]+$/, ""), // remove extension
          fileName: file.name,
          size: file.size,
          type: file.type,
          file: file
        }));
      });
    }
}