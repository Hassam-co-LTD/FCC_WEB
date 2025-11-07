import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { GeneralDetails } from "./components/general-details/general-details";
import { ApplicantBeneficiary } from "./components/applicant-beneficiary/applicant-beneficiary";
import { BankDetails } from './components/bank-details/bank-details';
import { AmountChargeDetails } from './components/amount-charge-details/amount-charge-details';
import { PaymentDetails } from './components/payment-details/payment-details';
import { ShipmentDetails } from './components/shipment-details/shipment-details';

@Component({
  selector: 'app-import-lc',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatRadioModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    GeneralDetails,
    ApplicantBeneficiary,
    BankDetails,
    AmountChargeDetails,
    PaymentDetails,
    ShipmentDetails
  ],
  templateUrl: './import-screen.html',
  styleUrls: ['./import-screen.scss']
})
export class ImportScreen implements AfterViewInit {

  currentStep = 0;

  steps = [
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

  ngAfterViewInit() {
    const sections = document.querySelectorAll('section');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Array.from(sections).indexOf(entry.target as HTMLElement);
            this.currentStep = index;
          }
        }
      },
      {
        threshold: 0.4, // Adjusts sensitivity (0.4 = when 40% of section visible)
        root: document.querySelector('.scroll-area') // observe scrolling inside container
      }
    );

    sections.forEach(section => observer.observe(section));
  }

  scrollToSection(i: number) {
    this.currentStep = i;
    const section = document.getElementById(`section-${i}`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  next() {
    if (this.currentStep < this.steps.length - 1) {
      this.scrollToSection(this.currentStep + 1);
    }
  }

  previous() {
    if (this.currentStep > 0) {
      this.scrollToSection(this.currentStep - 1);
    }
  }
}

// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { MatButtonModule } from '@angular/material/button';
// import { MatRadioModule } from '@angular/material/radio';
// import { MatSelectModule } from '@angular/material/select';
// import { MatInputModule } from '@angular/material/input';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatSlideToggleModule } from '@angular/material/slide-toggle';
// import { GeneralDetails } from "./components/general-details/general-details";
// import { ApplicantBeneficiary } from "./components/applicant-beneficiary/applicant-beneficiary";
// import { BankDetails } from './components/bank-details/bank-details';
// import { AmountChargeDetails } from './components/amount-charge-details/amount-charge-details';
// import { PaymentDetails } from './components/payment-details/payment-details';
// import { ShipmentDetails } from './components/shipment-details/shipment-details';

// @Component({
//   selector: 'app-import-lc',
//   standalone: true,
//   imports: [
//     CommonModule,
//     MatButtonModule,
//     MatRadioModule,
//     MatSelectModule,
//     MatInputModule,
//     MatCheckboxModule,
//     MatSlideToggleModule,
//     GeneralDetails,
//     ApplicantBeneficiary,
//     BankDetails,
//     AmountChargeDetails,
//     PaymentDetails,
//     ShipmentDetails
// ],
//   templateUrl: './import-screen.html',
//   styleUrls: ['./import-screen.scss']
// })
// export class ImportScreen {

//   // steps = [
//   //   'General Details',
//   //   'Applicant Details',
//   //   'Bank Details',
//   //   'Amount & Charges',
//   //   'Shipment',
//   //   'Goods',
//   //   'Narrative Details',
//   //   'Licenses',
//   //   'Instructions to Bank',
//   //   'Attachments',
//   //   'Preview'
//   // ];

//   // currentStep = 0;
//   // selectStep(i: number) { this.currentStep = i; }
//   // next() { if (this.currentStep < this.steps.length - 1) this.currentStep++; }
//   // back() { if (this.currentStep > 0) this.currentStep--; }


//   currentStep = 0;

//   steps = [
//     { label: "General Details" },
//     { label: "Applicant Details" },
//     { label: "Bank Details" },
//     { label: "Amount & Charges" },
//     { label: "Shipment" },
//     { label: "Goods" },
//     { label: "Narrative Details" },
//     { label: "Licenses" },
//     { label: "Instructions to Bank" },
//     { label: "Attachments" },
//     { label: "Preview" }
//   ];

//   changeStep(i: number) {
//     this.currentStep = i;
//   }

//   next() {
//     if (this.currentStep < this.steps.length - 1) {
//       this.currentStep++;
//     }
//   }

//   previous() {
//     if (this.currentStep > 0) {
//       this.currentStep--;
//     }
//   }
// }
