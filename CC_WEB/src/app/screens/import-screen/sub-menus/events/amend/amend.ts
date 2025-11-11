import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Reuse same components
import { GeneralDetails } from '../../../components/general-details/general-details';
import { ApplicantBeneficiary } from '../../../components/applicant-beneficiary/applicant-beneficiary';
import { BankDetails } from '../../../components/bank-details/bank-details';
import { AmountChargeDetails } from '../../../components/amount-charge-details/amount-charge-details';
import { PaymentDetails } from '../../../components/payment-details/payment-details';
import { ShipmentDetails } from '../../../components/shipment-details/shipment-details';
import { NarrativeDetails } from '../../../components/narrative-details/narrative-details';
import { Licenses } from '../../../components/licenses/licenses';
import { InstructionToBank } from '../../../components/instruction-to-bank/instruction-to-bank';
import { Attachments } from '../../../components/attachments/attachments';
import { Preview } from '../../../components/preview/preview';
import { Sidebar } from '../../../../../core/sidebar/sidebar';

@Component({
  selector: 'app-amend-screen',
  standalone: true,
  imports: [
    CommonModule,
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

  ngAfterViewInit(): void {
    // Optionally handle scroll initialization here
  }

  scrollToSection(index: number) {
    const section = document.getElementById(`section-${index}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      this.currentStep = index;
    }
  }
}
