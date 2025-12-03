import { Component, AfterViewInit } from '@angular/core';
import { Sidebar } from "../../../../core/sidebar/sidebar";
import { GeneralDetails } from "../components/general-details/general-details";
import { ApplicationBeneficiary } from "../components/application-beneficiary/application-beneficiary";
import { BankDetails } from "../../undertaking-issuance/components/bank-details/bank-details";
import { UndertakingDetails } from "../components/undertaking-details/undertaking-details";
import { InstructionsBank } from "../components/instructions-bank/instructions-bank";
import { CommonModule } from '@angular/common';
import { Attachments } from "../components/attachments/attachments";
import { Preview } from "../components/preview/preview";

@Component({
  selector: 'app-request-undertaking',
  standalone: true,
  imports: [CommonModule, Sidebar, GeneralDetails, ApplicationBeneficiary, BankDetails, UndertakingDetails, InstructionsBank, Attachments, Preview],
  templateUrl: './request-undertaking.html',
  styleUrls: ['./request-undertaking.scss'],
})
export class RequestUndertaking implements AfterViewInit {
  currentStep = 0;

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
  const scrollEl = document.querySelector('.scroll-area') as HTMLElement;
  const sections = scrollEl.querySelectorAll('section');

  // Default highlight first step
  this.currentStep = 0;

  scrollEl.addEventListener('scroll', () => {
    const scrollTop = scrollEl.scrollTop;
    let activeIndex = 0;

    sections.forEach((sec, index) => {
      const secTop = (sec as HTMLElement).offsetTop;
      if (scrollTop >= secTop - 50) { // 50px buffer from top
        activeIndex = index;
      }
    });

    this.currentStep = activeIndex;
  });
}

  scrollToSection(i: number) {
    this.currentStep = i;
    const section = document.getElementById(`section-${i}`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  next() {
    if (this.currentStep < this.undertakingSteps.length - 1) {
      this.scrollToSection(this.currentStep + 1);
    }
  }

  previous() {
    if (this.currentStep > 0) {
      this.scrollToSection(this.currentStep - 1);
    }
  }
}