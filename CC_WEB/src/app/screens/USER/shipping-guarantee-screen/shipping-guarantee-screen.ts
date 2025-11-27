import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralDetails } from "../../USER/shipping-guarantee-screen/components/general-details/general-details";
import { ApplicantBeneficiary } from "../../USER/shipping-guarantee-screen/components/applicant-beneficiary/applicant-beneficiary";
import { BankDetailsComponent } from "../../USER/shipping-guarantee-screen/components/bank-details/bank-details";
import { InstructionsComponent } from "../../USER/shipping-guarantee-screen/components/instructions/instructions";
import { AttachmentsDocuments } from "../../USER/shipping-guarantee-screen/components/attachments/attachments";
import { Preview } from "../shipping-guarantee-screen/components/preview/preview";
import { Sidebar } from "../../../core/sidebar/sidebar";



@Component({
  selector: 'app-shipping-guarantee',
  standalone: true,
  imports: [
    CommonModule,
    GeneralDetails,
    ApplicantBeneficiary,
    BankDetailsComponent,
    InstructionsComponent,
    AttachmentsDocuments,
    Preview,
    Sidebar
  ],
  templateUrl: './shipping-guarantee-screen.html',
  styleUrls: ['./shipping-guarantee-screen.scss']
})
export class ShippingGuaranteeScreen implements AfterViewInit {

  currentStep = 0;

  shippingGuaranteeSteps = [
    { label: 'General Details' },
    { label: 'Applicant & Beneficiary' },
    { label: 'Bank Details' },
    { label: 'Instructions' },
    { label: 'Attachments' },
    { label: 'Preview' }
  ];
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
    if (this.currentStep < this.shippingGuaranteeSteps.length - 1) {
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
