import { Component, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';

// Child components
import { GeneralDetails } from "./components/general-details/general-details";
import { ApplicantBeneficiary } from "./components/applicant-beneficiary/applicant-beneficiary";
import { BankDetails } from './components/bank-details/bank-details';
import { AmountChargeDetails } from './components/amount-charge-details/amount-charge-details';
import { PaymentDetails } from './components/payment-details/payment-details';
import { ShipmentDetails } from './components/shipment-details/shipment-details';
import { NarrativeDetails } from './components/narrative-details/narrative-details';
import { Licenses } from "./components/licenses/licenses";
import { InstructionToBank } from "./components/instruction-to-bank/instruction-to-bank";
import { Attachments } from "./components/attachments/attachments";
// import { Preview } from "./components/preview/preview";
import { Sidebar } from "../../../core/sidebar/sidebar";
import { SharedService } from '../../../core/services/user-service/shared-form-service/shared-service';


@Component({
  selector: 'app-import-lc',
  standalone: true,
  imports: [
    ReactiveFormsModule,
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
    // Preview,
    Sidebar,
    RouterOutlet
  ],
  templateUrl: './import-screen.html',
  styleUrls: ['./import-screen.scss']
})
export class ImportScreen implements AfterViewInit {

  currentStep = 0;

  importSteps = [
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
    // { label: "Preview" }
  ];

  // MAIN MASTER FORM (fed to all steps)
  importForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private dataService: SharedService) {

    this.importForm = this.fb.group({

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
        applicantName: [''],
        applicantAddress1: [''],
        applicantAddress2: [''],
        applicantAddress3: [''],

        // alternateName: [''],
        // alternateAddress1: [''],
        // alternateAddress2: [''],
        // alternateAddress3: [''],

        beneficiaryName: [''],
        beneficiaryAddress1: [''],
        beneficiaryAddress2: [''],
        beneficiaryAddress3: [''],
        beneficiaryCountry: ['']

      }),

      bankForm: this.fb.group({
        issuingBankName: [''],
        issuerReference: [''],
        advisingBankName: [''],
        adviseThroughBankName: ['']
      }),

      // Step 3 — Amount & Charges
      amountChargeForm: this.fb.group({
        currency: [''],
        amount: ['', Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)],
        variationType: ['percent'],
        variationPlus: [''],
        variationMinus: [''],
        issuingBankCharges: ['Applicant'],
        outsideCountryCharges: ['Beneficiary'],
        additionalAmountDetails: ['', Validators.maxLength(140)],
      }),

      paymentDetailsForm: this.fb.group({
        creditAvailableWith: [''],
        bankName: [''],
        creditAvailableBy: ['Payment'],
        paymentDraftAt: ['Sight']
      }),

      shipmentForm: this.fb.group({
        shipmentFrom: [''],
        shipmentTo: [''],
        placeOfLoading: [''],
        placeOfDischarge: [''],
        lastShipmentDate: [''],
        shipmentPeriodNarrative: ['', [ Validators.maxLength(390)]],
        partialShipment: ['Allowed'],
        transhipment: ['Not Allowed']
      }),
      narrativeForm: this.fb.group({
        descriptionOfGoods: ['', [ Validators.maxLength(6500)]],
        documentsRequired: ['', [ Validators.maxLength(6500)]],
        additionalInstructions: ['', [Validators.maxLength(2000)]],
        otherDetails: ['']
      }),
      instructionForm: this.fb.group({
        principalAccount: [''],
        feeAccount: [''],
        otherInstructions: ['', [Validators.maxLength(31525)]]
      }),
      attachments: this.fb.array([]),
    });
  }

  // Easy getter
  get generalDetailsForm(): FormGroup {
    return this.importForm.get('generalDetails') as FormGroup;
  }

  get applicantForm(): FormGroup {
    return this.importForm.get('applicantForm') as FormGroup;
  }

  get bankForm(): FormGroup {
    return this.importForm.get('bankForm') as FormGroup;
  }
  get amountChargeForm(): FormGroup {
    return this.importForm.get('amountChargeForm') as FormGroup;
  }
  get paymentDetailsForm(): FormGroup {
    return this.importForm.get('paymentDetailsForm') as FormGroup;
  }
  get shipmentForm(): FormGroup {
    return this.importForm.get('shipmentForm') as FormGroup;
  }
  get narrativeForm(): FormGroup {
    return this.importForm.get('narrativeForm') as FormGroup;
  }
  get instructionForm(): FormGroup {
    return this.importForm.get('instructionForm') as FormGroup;
  }



  ngAfterViewInit() {
    setTimeout(() => {
      const sections = document.querySelectorAll('section');

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
          root: document.querySelector('.scroll-area')
        }
      );

      sections.forEach(section => observer.observe(section));
    }, 200);
  }

  // Sidebar scroll
  scrollToSection(i: number) {
    this.currentStep = i;
    const section = document.getElementById(`section-${i}`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Next section
  submitForm() {
    // Validate form first
    if (this.importForm.invalid) {
      this.importForm.markAllAsTouched();
      alert("Please complete all required fields before submitting.");
      return;
    }

    // Save data to shared service
    this.dataService.setFormData(this.importForm.value);

    // Navigate to Preview screen
    this.router.navigate(['/import-screen/preview']);
  }


  // Previous section
  previous() {
    this.router.navigate(['/dashboard'])
  }

  updateAttachments(files: File[]) {
    const arr = this.importForm.get('attachments') as FormArray;
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
