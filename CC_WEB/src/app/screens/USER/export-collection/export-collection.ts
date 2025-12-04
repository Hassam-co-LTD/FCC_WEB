import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray } from '@angular/forms';

// CHILD COMPONENTS
import { GeneralDetails } from "../../USER/export-collection/components/general-details/general-details";
import { DrawerDraweeDetails } from "../../USER/export-collection/components/drawer-drawee-details/drawer-drawee-details";
import { BankDetailsComponent } from '../../USER/export-collection/components/bank-details/bank-details';
import { ShippingDetailsComponent } from '../../USER/export-collection/components/shipping-details/shipping-details';
import { PaymentAmountComponent } from '../../USER/export-collection/components/payment-amount/payment-amount';
import { CollectionInstructionsComponent } from '../../USER/export-collection/components/collection-instructions/collection-instructions';
import { License } from "../../USER/export-collection/components/license/license";
import { AttachmentsDocuments } from "../../USER/export-collection/components/attachments-documents/attachments-documents";
import { Sidebar } from "../../../core/sidebar/sidebar";

import { SharedService } from '../../../core/services/shared-service';
import { Router, RouterModule } from '@angular/router';

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
    ShippingDetailsComponent,
    CollectionInstructionsComponent,
    License,
    AttachmentsDocuments,
    Sidebar,
    RouterModule
  ],
  templateUrl: './export-collection.html',
  styleUrls: ['./export-collection.scss']
})
export class ExportCollectionComponent implements OnInit, AfterViewInit {

  importForm!: FormGroup;
  currentStep = 0;

  exportCollectionSteps = [
    { label: "General Details" },
    { label: "Drawer and Drawee Details" },
    { label: "Bank Details" },
    { label: "Payment and Account Details" },
    { label: "Shipping Details" },
    { label: "Collection Instructions" },
    { label: "Licenses" },
    { label: "Attachments and Documents" }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dataService: SharedService
  ) {}

  ngOnInit() {
    this.importForm = this.fb.group({
      generaldetails: this.fb.group({
        collectionType: [''],
        customerReference: [''],
        draweeReference: ['']
      }),
      DrawerDraweeDetails: this.fb.group({
        drawerName: [''],
        drawerAddress1: [''],
        drawerAddress2: [''],
        draweeName: [''],
        draweeAddress1: [''],
        draweeAddress2: ['']
      }),
      bankdetails: this.fb.group({
        remittingBankName: [''],
        remittingIssuerRef: [''],
        principalAccount: [''],
        feeAccount: [''],
        presentingBankName: [''],
        presentingAddress1: [''],
        presentingAddress2: [''],
        collectingBankName: [''],
        collectingSwiftCode: [''],
        collectingReference: ['']
      }),
      paymentamount: this.fb.group({
        amount: [''],
        currency: [''],
        paymentType: [''],
        tenor: [''],
        paymentReference: ['']
      }),
      shippingdetails: this.fb.group({
        shippingMethod: [''],
        shipmentReference: [''],
        shippingFrom: [''],
        shippingTo: [''],
        shipmentDate: [''],
        incotermsRules: [''],
        incoterms: ['']
      }),
      license: this.fb.group({
        licenseNumber: [''],
        licenseDate: [''],
        licenseFile: [null]
      }),
      collectioninstructions: this.fb.group({
        advicePaymentBy: [''],
        adviceAcceptanceDate: [''],
        openingCharges: [''],
        outsideCountryCharges: [''],
        waiveCharges: [false],
        protestNonPayment: [false],
        protestNonAcceptance: [false],
        adviceReasonRefusal: [''],
        acceptanceDeferred: [false],
        warehouseInsurance: [false],
        referTo: ['']
      }),
      attachments: this.fb.group({
        documents: this.fb.array([])
      })
    });
  }

  // -----------------------------
  // FORM GETTERS
  // -----------------------------

  get generalDetailsForm(): FormGroup {
    return this.importForm.get('generaldetails') as FormGroup;
  }

  get drawerDraweeForm(): FormGroup {
    return this.importForm.get('DrawerDraweeDetails') as FormGroup;
  }

  get bankdetailsForm(): FormGroup {
    return this.importForm.get('bankdetails') as FormGroup;
  }

  get paymentamountForm(): FormGroup {
    return this.importForm.get('paymentamount') as FormGroup;
  }

  get shippingdetailsForm(): FormGroup {
    return this.importForm.get('shippingdetails') as FormGroup;
  }

  get collectioninstructionsForm(): FormGroup {
    return this.importForm.get('collectioninstructions') as FormGroup;
  }

  get licenseForm(): FormGroup {
    return this.importForm.get('license') as FormGroup;
  }

  get attachmentsForm(): FormGroup {
    return this.importForm.get('attachments') as FormGroup;
  }

  get documentsArray(): FormArray {
    return this.attachmentsForm.get('documents') as FormArray;
  }

  // -----------------------------
  // SCROLL + STEPS
  // -----------------------------
  
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
          root: document.querySelector('.scroll-area'),
          threshold: 0.4
        }
      );

      sections.forEach(section => observer.observe(section));
    }, 200);
  }

  scrollToSection(i: number) {
    this.currentStep = i;
    const section = document.getElementById(`section-${i}`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // -----------------------------
  // NAVIGATION
  // -----------------------------

  submit() {
    // Store form data in shared service
    this.dataService.setFormData(this.importForm.value);

    // Navigate to preview page
    this.router.navigate(['/export-collection/preview']);
  }

  previous() {
    if (this.currentStep > 0) {
      this.scrollToSection(this.currentStep - 1);
    }
  }
}
