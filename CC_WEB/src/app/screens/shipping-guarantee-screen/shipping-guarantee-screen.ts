import {
  Component,
  AfterViewInit,
  OnInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { create } from './component/sub-menus/events/create/create';
import { GeneralDetails } from "./component/general-details/general-details";
import { ApplicantBeneficiary } from "./component/applicant-beneficiary/applicant-beneficiary";
import { BankDetailsComponent } from "./component/bank-details/bank-details";
import { InstructionsComponent } from "./component/instructions/instructions";
import { AttachmentsDocuments } from "./component/attachments/attachments";
import { Preview } from "./component/preview/preview";

@Component({
  selector: 'app-shipping-guarantee-screen',
  standalone: true,
  imports: [
    CommonModule,
    GeneralDetails,
    ApplicantBeneficiary,
    BankDetailsComponent,
    InstructionsComponent,
    AttachmentsDocuments,
    Preview
  ],
  templateUrl: './shipping-guarantee-screen.html',
  styleUrls: ['./shipping-guarantee-screen.scss']
})
export class ShippingGuaranteeScreen implements AfterViewInit, OnInit {

  currentStep = 0;

  steps = [
    { key: 'general', label: 'General Details' },
    { key: 'applicant', label: 'Applicant & Beneficiary' },
    { key: 'bank', label: 'Bank Details' },
    { key: 'instructions', label: 'Instructions' },
    { key: 'attachments', label: 'Attachments' },
    { key: 'preview', label: 'Preview' }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {}

  /** Smooth scroll to a section */
  scrollToSection(index: number) {
    if (isPlatformBrowser(this.platformId)) {
      const section = document.getElementById(`section-${index}`);
      if (section) {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }

  /** Detect which section is on screen and update active sidebar item */
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const sections = document.querySelectorAll<HTMLElement>("section");

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const index = Array.from(sections).indexOf(entry.target as HTMLElement);
              this.currentStep = index;
            }
          });
        },
        { threshold: 0.4 } // 40% section visibility required
      );

      sections.forEach(section => observer.observe(section));
    }
  }
}
