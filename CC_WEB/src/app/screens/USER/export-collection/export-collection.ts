import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { GeneralDetails } from "../../USER/export-collection/components/general-details/general-details";
import { DrawerDraweeDetails } from "../../USER/export-collection/components/drawer-drawee-details/drawer-drawee-details";
import { BankDetailsComponent } from '../../USER/export-collection/components/bank-details/bank-details';
import { ShippingDetailsComponent } from '../../USER/export-collection/components/shipping-details/shipping-details';
import { PaymentAmountComponent } from '../../USER/export-collection/components/payment-amount/payment-amount';
import { CollectionInstructionsComponent } from '../../USER/export-collection/components/collection-instructions/collection-instructions';
import { License } from "../../USER/export-collection/components/license/license";
import { AttachmentsDocuments } from "../../USER/export-collection/components/attachments-documents/attachments-documents";
import { PreviewSectionComponent } from "../../USER/export-collection/components/preview/preview";
import { Sidebar } from "../../../core/sidebar/sidebar";

@Component({
  selector: 'app-export-collection',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GeneralDetails,
    DrawerDraweeDetails,
    BankDetailsComponent,
    ShippingDetailsComponent,
    PaymentAmountComponent,
    CollectionInstructionsComponent,
    License,
    AttachmentsDocuments,
    PreviewSectionComponent,
    Sidebar
],
  templateUrl: './export-collection.html',
  styleUrls: ['./export-collection.scss']
})
export class ExportCollectionComponent implements AfterViewInit {
  currentStep = 0;

  exportCollectionSteps = [
    { label: "General Details" },
    {  label: "Drawer and Drawee Details" },
    {  label: "Bank Details" },
    {  label: "Payment and Account Details" },
    {  label: "Shipping Details" },
    {  label: "Licenses" },
    {  label: "Collection Instructions" },
    {  label: "Attachments and Documents" },
    {  label: "Preview" }
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
    if (this.currentStep < this.exportCollectionSteps.length - 1) {
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
