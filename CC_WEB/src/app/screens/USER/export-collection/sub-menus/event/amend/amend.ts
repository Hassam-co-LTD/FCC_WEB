import { AfterViewInit, Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray } from '@angular/forms';

// CHILD COMPONENTS
import { GeneralDetails } from "../../event/amend/components/general-details/general-details";
import { DrawerDraweeDetails } from "../../event/amend/components/drawer-drawee-details/drawer-drawee-details";
import { BankDetailsComponent } from "../amend/components/bank-details/bank-details";
import { ShippingDetailsComponent } from "../amend/components/shipping-details/shipping-details";
import { PaymentAmountComponent } from "../amend/components/payment-amount/payment-amount";
import { CollectionInstructionsComponent } from "../amend/components/collection-instructions/collection-instructions";
import { License } from "../amend/components/license/license";
import { AttachmentsDocuments } from "../amend/components/attachments-documents/attachments-documents";
// import { PreviewSection } from "../amend/components/preview/preview";
import { Sidebar } from "../../../../../../core/sidebar/sidebar";
import { Router } from '@angular/router';
import { SharedService } from '../../../../../../core/services/user-service/shared-form-service/shared-service';
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-amend',
  standalone: true,
  imports: [
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
  templateUrl: './amend.html',
  styleUrls: ['./amend.scss']
})
export class Amend implements OnInit, AfterViewInit {

   importForm!: FormGroup;
  currentStep = 0;
  uploadedFiles: any[] = [];

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

    // -----------------------------
    // FORM CREATION
    // -----------------------------
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

    // -----------------------------
    // LOAD SAVED DRAFT
    // -----------------------------
    const savedDraft = localStorage.getItem('exportCollectionDraft');
    if (savedDraft) {
      const draftData = JSON.parse(savedDraft);
      this.importForm.patchValue(draftData);

      if (draftData.attachments?.documents?.length) {
        draftData.attachments.documents.forEach((doc: any) => {
          this.documentsArray.push(this.fb.group(doc));
        });
      }
    }
  }

  // -----------------------------
  // GETTERS
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
  // SCROLL + STEP TRACKING
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
  // ACTION BUTTONS
  // -----------------------------

  saveDraft() {
    const payload = this.importForm.value;
    localStorage.setItem('exportCollectionDraft', JSON.stringify(payload));
    console.log('Draft saved successfully');
  }

  submit() {
    if (this.importForm.invalid) {
      this.importForm.markAllAsTouched();
      alert("Please complete all required fields before submitting.");
      return;
    }

    this.dataService.setFormData(this.importForm.value);

    // Clear draft after successful submit
    // localStorage.removeItem('exportCollectionDraft');

    // Navigate to preview
    this.router.navigate(['/export-collection/amend/preview']);
  }

  previous() {
    if (this.currentStep > 0) {
      this.scrollToSection(this.currentStep - 1);
    }
  }
}
