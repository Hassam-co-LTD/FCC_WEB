import { Component, AfterViewInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Reuse same components
import { GeneralDetails } from '../amend-undertaking/components/general-details/general-details';
import { ApplicantBeneficiary } from '../amend-undertaking/components/applicant-beneficiary/applicant-beneficiary';
import { BankDetails } from '../amend-undertaking/components/bank-details/bank-details';
import { AmountChargeDetails } from '../amend-undertaking/components/amount-charge-details/amount-charge-details';
import { PaymentDetails } from '../amend-undertaking/components/payment-details/payment-details';
import { ShipmentDetails } from '../amend-undertaking/components/shipment-details/shipment-details';
import { NarrativeDetails } from '../amend-undertaking/components/narrative-details/narrative-details';
import { Licenses } from '../amend-undertaking/components/licenses/licenses';
import { InstructionToBank } from '../amend-undertaking/components/instruction-to-bank/instruction-to-bank';
import { Attachments } from '../amend-undertaking/components/attachments/attachments';
import { Preview } from '../amend-undertaking/components/preview/preview';
import { Sidebar } from '../../../../../../core/sidebar/sidebar';

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

  amendimportSteps = [
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


  // ngAfterViewInit() {
  //   const sections = document.querySelectorAll('section');

  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       for (const entry of entries) {
  //         if (entry.isIntersecting) {
  //           const index = Array.from(sections).indexOf(entry.target as HTMLElement);
  //           this.currentStep = index;
  //         }
  //       }
  //     },
  //     {
  //       threshold: 0.4, // Adjusts sensitivity (0.4 = when 40% of section visible)
  //       root: document.querySelector('.scroll-area') // observe scrolling inside container
  //     }
  //   );

  //   sections.forEach(section => observer.observe(section));
  // }

  // scrollToSection(i: number) {
  //   this.currentStep = i;
  //   const section = document.getElementById(`section-${i}`);
  //   section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // }

  next() {
    if (this.currentStep < this.amendimportSteps.length - 1) {
      this.scrollToSection(this.currentStep + 1);
    }
  }

  previous() {
    if (this.currentStep > 0) {
      this.scrollToSection(this.currentStep - 1);
    }
  }
}