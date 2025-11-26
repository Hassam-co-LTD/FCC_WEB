import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { GeneralDetails } from "../export-collection/components/general-details/general-details";
import { DrawerDraweeDetails } from "./components/drawer-drawee-details/drawer-drawee-details";
import { BankDetailsComponent } from '../export-collection/components/bank-details/bank-details';
import { ShippingDetailsComponent } from '../export-collection/components/shipping-details/shipping-details';
import { PaymentAmountComponent } from '../export-collection/components/payment-amount/payment-amount';
import { CollectionInstructionsComponent } from '../export-collection/components/collection-instructions/collection-instructions';
import { License } from "../export-collection/components/license/license";
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
    ShippingDetailsComponent,
    PaymentAmountComponent,
    CollectionInstructionsComponent,
    License,
    AttachmentsDocuments,
    PreviewSectionComponent,
],
  templateUrl: './export-collection.html',
  styleUrls: ['./export-collection.scss']
})
export class ExportCollectionComponent implements OnInit, AfterViewInit {
scrollToSection(_t7: number) {
throw new Error('Method not implemented.');
}

  // -----------------------------
  // All sections open by default
  // -----------------------------
  activeSections: string[] = [];

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
currentStep: any;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Open all sections initially
    this.activeSections = this.steps.map(s => s.key);

    // If route has section param, scroll to it
    this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section) {
        setTimeout(() => this.scrollTo(section), 100);
      }
    });
  }

  ngAfterViewInit() {
    const sections = document.querySelectorAll('.scroll-area section');

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (id) {
              // Update sidebar highlighting
              if (!this.activeSections.includes(id)) {
                this.activeSections.push(id);
              }
            }
          }
        });
      },
      { root: document.querySelector('.scroll-area'), threshold: 0.5 }
    );

    sections.forEach(sec => observer.observe(sec));
  }

  // -----------------------------
  // Toggle sections individually
  // -----------------------------
  toggleSection(section: string) {
    const index = this.activeSections.indexOf(section);
    if (index > -1) {
      this.activeSections.splice(index, 1); // close
    } else {
      this.activeSections.push(section); // open
    }
  }

  // -----------------------------
  // Sidebar navigation
  // -----------------------------
  goTo(section: string) {
    // Scroll
    this.scrollTo(section);

    // Update query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section },
      queryParamsHandling: 'merge'
    });

    // Make sure section is open
    if (!this.activeSections.includes(section)) {
      this.activeSections.push(section);
    }
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
