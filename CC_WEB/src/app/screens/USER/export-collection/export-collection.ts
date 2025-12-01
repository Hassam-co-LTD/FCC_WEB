import { AfterViewInit, Component, OnInit } from '@angular/core';
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
    PaymentAmountComponent,
    ShippingDetailsComponent,
    CollectionInstructionsComponent,
    License,
    AttachmentsDocuments,
    PreviewSectionComponent,
    Sidebar
  ],
  templateUrl: './export-collection.html',
  styleUrls: ['./export-collection.scss']
})
export class ExportCollectionComponent implements OnInit, AfterViewInit {

  importForm!: FormGroup;
  currentStep = 0;
  uploadedFiles: any[] = [];

  exportCollectionSteps = [
    { label: "General Details" },
    {  label: "Drawer and Drawee Details" },
    {  label: "Bank Details" },
    {  label: "Payment and Account Details" },
    {  label: "Shipping Details" },
    {  label: "Collection Instructions" },
    {  label: "Licenses" },
    {  label: "Attachments and Documents" },
    {  label: "Preview" }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.importForm = this.fb.group({

      generaldetails: this.fb.group({
        collectionType: [''],
        customerReference: [''],
        draweeReference: ['']
      }),

      drawerdrawee: this.fb.group({
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
        licenseDate: ['']
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

  get documents(): FormArray {
    return this.importForm.get('attachments.documents') as FormArray;
  }

  ngAfterViewInit() {
    setTimeout(() => {
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

  next() {
    if (this.currentStep < this.exportCollectionSteps.length - 1) {
      this.scrollToSection(this.currentStep + 1);
    }
  }

  previous() {
    if (this.currentStep > 0) {
      this.scrollToSection(this.currentStep - 1);
    }
  }
}
