import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { GeneralDetails } from "../export-collection/components/general-details/general-details";
import { DrawerDraweeDetails } from "./components/drawer-drawee-details/drawer-drawee-details";
import { BankDetailsComponent } from '../export-collection/components/bank-details/bank-details';
import { PaymentAmountComponent } from '../export-collection/components/payment-amount/payment-amount';
import { CollectionInstructionsComponent } from '../export-collection/components/collection-instructions/collection-instructions';
import { Licenses } from "../import-screen/components/licenses/licenses";
import { AttachmentsDocuments } from "./components/attachments-documents/attachments-documents";
import { PreviewSectionComponent } from "./components/preview/preview";
import { ShippingDetailsComponent } from './components/shipping-details/shipping-details';

@Component({
  selector: 'app-export-collection',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GeneralDetails,
    DrawerDraweeDetails,
    BankDetailsComponent,
    PaymentAmountComponent,
    CollectionInstructionsComponent,
    Licenses,
    AttachmentsDocuments,
    PreviewSectionComponent,
    ShippingDetailsComponent
  ],
  templateUrl: './export-collection.html', 
  styleUrls: ['./export-collection.scss']
})
export class ExportCollectionComponent implements OnInit, AfterViewInit {
  // Existing scroll & sidebar logic
  scrollToSection(index: number) {
    const target = this.steps[index].key;
    const el = document.getElementById(target);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

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

  constructor(private route: ActivatedRoute, private router: Router, private fb: FormBuilder) {}

  ngOnInit() {
    // Open all sections initially
    this.activeSections = this.steps.map(s => s.key);

    // Scroll to section from query params
    this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section) setTimeout(() => this.scrollTo(section), 100);
    });

    // -----------------------------
    // Preview form setup
    // -----------------------------
    this.exportCollectionForm = this.fb.group({
      collectionType: ['Import'],
      customerReference: ['CUST123'],
      draweeReference: ['DRW123'],
      drawerName: ['Drawer Inc.'],
      drawerAddress1: ['Street 1'],
      drawerAddress2: ['Street 2'],
      draweeName: ['Drawee Corp.'],
      draweeAddress1: ['Address A'],
      draweeAddress2: ['Address B'],
      remittingBankName: ['Bank A'],
      presentingBankName: ['Bank B'],
      collectingBankName: ['Bank C'],
      amount: [1000],
      currency: ['USD'],
      paymentType: ['Cash'],
      // Add other fields as needed
    });

    this.attachmentsForm = this.fb.group({
      documents: this.fb.array([
        this.fb.group({
          type: ['Invoice'],
          attachment: ['invoice.pdf'],
          date: [new Date()]
        }),
        this.fb.group({
          type: ['Packing List'],
          attachment: ['packing.pdf'],
          date: [new Date()]
        })
      ])
    });

    this.uploadedFiles = [
      { name: 'file1.pdf' },
      { name: 'file2.docx' }
    ];
  }

  ngAfterViewInit() {
    const sections = document.querySelectorAll('.scroll-area section');
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (id && !this.activeSections.includes(id)) {
              this.activeSections.push(id);
            }
          }
        });
      },
      { root: document.querySelector('.scroll-area'), threshold: 0.5 }
    );
    sections.forEach(sec => observer.observe(sec));
  }

  toggleSection(section: string) {
    const index = this.activeSections.indexOf(section);
    if (index > -1) this.activeSections.splice(index, 1);
    else this.activeSections.push(section);
  }

  goTo(section: string) {
    this.scrollTo(section);
    this.router.navigate([], { relativeTo: this.route, queryParams: { section }, queryParamsHandling: 'merge' });
    if (!this.activeSections.includes(section)) this.activeSections.push(section);
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // -----------------------------
  // Preview form properties
  // -----------------------------
  exportCollectionForm!: FormGroup;
  attachmentsForm!: FormGroup;
  uploadedFiles: any[] = [];
}
