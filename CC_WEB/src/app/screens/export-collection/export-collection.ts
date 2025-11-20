import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { GeneralDetails } from "../export-collection/components/general-details/general-details";
import { DrawerDraweeDetails } from "./components/drawer-drawee-details/drawer-drawee-details";
import { BankDetailsComponent } from '../export-collection/components/bank-details/bank-details';
import { ShippingDetails } from '../export-collection/components/shipping-details/shipping-details';
import { PaymentAmount } from '../export-collection/components/payment-amount/payment-amount';
import { CollectionInstructionsComponent } from '../export-collection/components/collection-instructions/collection-instructions';
import { Licenses } from "../import-screen/components/licenses/licenses";
import { AttachmentsDocuments } from "./components/attachments-documents/attachments-documents";
import { PreviewSectionComponent } from "./components/preview/preview";

@Component({
  selector: 'app-export-collection',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GeneralDetails,
    DrawerDraweeDetails,
    BankDetailsComponent,
    ShippingDetails,
    PaymentAmount,
    CollectionInstructionsComponent,
    Licenses,
    AttachmentsDocuments,
    PreviewSectionComponent
  ],
  templateUrl: './export-collection.html',
  styleUrls: ['./export-collection.scss']
})
export class ExportCollectionComponent implements OnInit, AfterViewInit {

  currentStep = 0;
  activeSection: string | null = null;

  steps = [
    { key: "general", label: "General Details" },
    { key: "drawer", label: "Drawer and Drawee Details" },
    { key: "bank", label: "Bank Details" },
    { key: "payment", label: "Payment and Account Details" },
    { key: "shipping", label: "Shipping Details" },
    { key: "license", label: "Licenses" },
    { key: "collection", label: "Collection Instructions" },
    { key: "attachments", label: "Attachments and Documents" },
    { key: "preview", label: "Preview" }
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  // -------------------------------------
  // FIXED: Load correct section on reload
  // -------------------------------------
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const section = params['section'];

      if (section) {
        this.activeSection = section;

        // Scroll after DOM paint
        setTimeout(() => this.scrollTo(section), 200);
      }
    });
  }

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
        threshold: 0.4,
        root: document.querySelector('.scroll-area')
      }
    );

    sections.forEach(section => observer.observe(section));
  }

  // -----------------------------
  // FIXED: Sidebar route navigation
  // -----------------------------
  goTo(section: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section },
      queryParamsHandling: 'merge'
    });

    this.activeSection = section;

    // Also scroll
    setTimeout(() => this.scrollTo(section), 150);
  }

  // -------------------------------------
  // FIXED: Smooth scroll by section ID
  // -------------------------------------
  scrollTo(id: string) {
    const target = document.getElementById(id);
    if (!target) return;

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  // KEEP OLD NUMBER-BASED SCROLL IF NEEDED
  scrollToSection(i: number) {
    const el = document.getElementById(`section-${i}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
