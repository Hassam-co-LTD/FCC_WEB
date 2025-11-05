import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { GeneralDetails } from "./components/general-details/general-details";
import { ApplicantBeneficiary } from "./components/applicant-beneficiary/applicant-beneficiary";

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
    ApplicantBeneficiary
],
  templateUrl: './import-screen.html',
  styleUrls: ['./import-screen.scss']
})
export class ImportScreen {

  // steps = [
  //   'General Details',
  //   'Applicant Details',
  //   'Bank Details',
  //   'Amount & Charges',
  //   'Shipment',
  //   'Goods',
  //   'Narrative Details',
  //   'Licenses',
  //   'Instructions to Bank',
  //   'Attachments',
  //   'Preview'
  // ];

  // currentStep = 0;
  // selectStep(i: number) { this.currentStep = i; }
  // next() { if (this.currentStep < this.steps.length - 1) this.currentStep++; }
  // back() { if (this.currentStep > 0) this.currentStep--; }


  currentStep = 0;

  steps = [
    { label: "General Details" },
    { label: "Shipment Details" },
    { label: "Documents Upload" }
  ];

  changeStep(i: number) {
    this.currentStep = i;
  }

  next() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  previous() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }
}
