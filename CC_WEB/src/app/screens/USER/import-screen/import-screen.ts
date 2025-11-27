import { Component, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

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
import { Preview } from "./components/preview/preview";
import { Sidebar } from "../../../core/sidebar/sidebar";

import { ReactiveFormsModule } from '@angular/forms';

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
    Preview,
    Sidebar
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
    {label: "undertaking details "},
    { label: "Payment Details" },
    { label: "Shipment Details" },
    { label: "Narrative Details" },
    { label: "Licenses" },
    { label: "Instructions to Bank" },
    { label: "Attachments" },
    { label: "Preview" }
  ];

  // MAIN MASTER FORM (fed to all steps)
  importForm!: FormGroup;

  constructor(private fb: FormBuilder) {

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

      // Add other steps here later
      // applicantDetails: this.fb.group({...})
      // ...
    });
  }

  // Easy getter
  get generalDetailsForm(): FormGroup {
    return this.importForm.get('generalDetails') as FormGroup;
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
  next() {
    if (this.currentStep < this.importSteps.length - 1) {
      this.scrollToSection(this.currentStep + 1);
    }
  }

  // Previous section
  previous() {
    if (this.currentStep > 0) {
      this.scrollToSection(this.currentStep - 1);
    }
  }
}
