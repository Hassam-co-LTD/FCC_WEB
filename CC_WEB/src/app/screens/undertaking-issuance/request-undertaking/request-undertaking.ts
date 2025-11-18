import { Component } from '@angular/core';
import { Sidebar } from "../../../core/sidebar/sidebar";
import { GeneralDetails } from "../components/general-details/general-details";
import { ApplicationBeneficiary } from "../components/application-beneficiary/application-beneficiary";
import { BankDetails } from "../../undertaking-issuance/components/bank-details/bank-details";
import { UndertakingDetails } from "../components/undertaking-details/undertaking-details";

@Component({
  selector: 'app-request-undertaking',
  imports: [Sidebar, GeneralDetails, ApplicationBeneficiary, BankDetails, UndertakingDetails],
  templateUrl: './request-undertaking.html',
  styleUrl: './request-undertaking.scss',
})
export class RequestUndertaking {
  currentStep = 0

  undertakingSteps = [
    { label: "General Details" },
    { label: "Applicant Details" },
    { label: "Bank Details" },
    { label: "Undertaking Details" },
    { label: "Instructions For The Bank Only" },
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

}
