import { Component, AfterViewInit, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

import { GeneralDetails } from "./components/general-details/general-details";
import { ApplicantBeneficiary } from "./components/applicant-beneficiary/applicant-beneficiary";
import { BankDetails } from './components/bank-details/bank-details';
import { AmountChargeDetails } from './components/amount-charge-details/amount-charge-details';
import { PaymentDetails } from './components/payment-details/payment-details';
import { ShipmentDetails } from './components/shipment-details/shipment-details';
import { NarrativeDetails } from './components/narrative-details/narrative-details';
import { Licenses } from "./components/licenses/licenses";
import { InstructionToBank } from "./components/instruction-to-bank/instruction-to-bank";
import { Attachments } from "./components/attachments/attachments";
import { Sidebar } from "../../../core/sidebar/sidebar";

import { ApiService } from '../../../core/services/api.service';
import { ImportLcTransaction } from '../../../core/models/import-lc';
import { ImportlcFormTransactionService } from '../../../core/services/user-service/importlc-form-transaction-service/importlc-form-transaction-service';

@Component({
  selector: 'app-import-lc',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    Sidebar,
    RouterOutlet
  ],
  templateUrl: './import-screen.html',
  styleUrls: ['./import-screen.scss']
})
export class ImportScreen implements OnInit {
  currentStep = 0;
  importForm!: FormGroup;
  mode: 'CREATE' | 'UPDATE' = 'CREATE';
  currentTx: ImportLcTransaction = {} as ImportLcTransaction;
  showUpdateSubmit = false;
  tnxId = '';

  importSteps = [
    { label: "General Details" },
    { label: "Applicant Details" },
    { label: "Bank Details" },
    { label: "Amount & Charges" },
    { label: "Payment Details" },
    { label: "Shipment Details" },
    { label: "Narrative Details" },
    { label: "Licenses" },
    { label: "Instructions to Bank" },
    { label: "Attachments" }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private route: ActivatedRoute,
    private transactionService: ImportlcFormTransactionService

  ) {
    this.buildForm();
  }

  ngOnInit() {
    this.tnxId = this.route.snapshot.paramMap.get('tnxId') || '';
    console.log('TNX ID from route:', this.tnxId);
    // const txFromState = history.state.transaction;
    // console.log('Transaction from state:', txFromState);
    this.route.paramMap.subscribe(params => {
      const tnxId = params.get('tnxId');
      if (tnxId) {
        this.enterEditMode(tnxId);
      } else {
        this.enterCreateMode();
      }
    });
  }

  private buildForm(): void {
    // Always initialize the form to avoid null bindings
    this.importForm = this.fb.group({
      generalDetails: this.fb.group({
        productType: ['backtoback'],
        modeOfTransmission: ['SWIFT'],
        expiryDate: [''],
        placeOfExpiry: ['beneficiary'],
        featureIrrevocable: [false],
        featureRevolving: [false],
        featureTransferable: [false],
        applicableRules: ['EUCP'],
        confirmationInstruction: ['confirm']
      }),
      applicantForm: this.fb.group({
        applicantName: [''],
        applicantAddress1: [''],
        applicantAddress2: [''],
        applicantAddress3: [''],
        applicantCountry: [''],
        beneficiaryName: [''],
        beneficiaryAddress1: [''],
        beneficiaryAddress2: [''],
        beneficiaryAddress3: [''],
        beneficiaryCountry: ['']
      }),
      bankForm: this.fb.group({
        issuingBankName: [''],
        issuerReference: [''],
        advisingBankName: [''],
        adviseThroughBankName: [''],
        bankName: ['']
      }),
      amountChargeForm: this.fb.group({
        currency: [''],
        amount: ['', Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)],
        variationType: ['percent'],
        variationPlus: [''],
        variationMinus: [''],
        issuingBankCharges: ['Applicant'],
        outsideCountryCharges: ['Beneficiary'],
        additionalAmount: ['']
      }),
      paymentDetailsForm: this.fb.group({
        creditAvailableWith: [''],
        bankName: [''],
        creditAvailableBy: ['Payment'],
        paymentDraftAt: ['Sight']
      }),
      shipmentForm: this.fb.group({
        shipmentFrom: [''],
        shipmentTo: [''],
        placeOfLoading: [''],
        placeOfDischarge: [''],
        lastShipmentDate: [''],
        shipmentPeriodNarrative: [''],
        partialShipment: ['Allowed'],
        transhipment: ['Not Allowed']
      }),
      narrativeForm: this.fb.group({
        descriptionOfGoods: [''],
        documentsRequired: [''],
        additionalInstructions: [''],
        otherDetails: ['']
      }),
      instructionForm: this.fb.group({
        principalAccount: [''],
        feeAccount: [''],
        otherInstructions: ['']
      }),
      attachments: this.fb.array([])
    });
  }

  private enterCreateMode(): void {
    this.mode = 'CREATE';
    this.showUpdateSubmit = false;
    this.currentTx = {} as ImportLcTransaction;
    this.importForm.reset();
    this.buildForm();
  }
  private enterEditMode(tnxId: string): void {
    this.mode = 'UPDATE';
    this.showUpdateSubmit = true;

    this.api.getPendingByTnxId(tnxId).subscribe({
      next: tx => {
        this.currentTx = tx;
        this.patchForm(tx);
      },
      error: () => {
        this.snackBar.open('Transaction not found', 'Close', { duration: 3000 });
        this.router.navigate(['/import-screen/enquiries']);
      }
    });
  }
  // Safe getters
  get generalDetailsForm(): FormGroup { return this.importForm.get('generalDetails') as FormGroup; }
  get applicantForm(): FormGroup { return this.importForm.get('applicantForm') as FormGroup; }
  get bankForm(): FormGroup { return this.importForm.get('bankForm') as FormGroup; }
  get amountChargeForm(): FormGroup { return this.importForm.get('amountChargeForm') as FormGroup; }
  get paymentDetailsForm(): FormGroup { return this.importForm.get('paymentDetailsForm') as FormGroup; }
  get shipmentForm(): FormGroup { return this.importForm.get('shipmentForm') as FormGroup; }
  get narrativeForm(): FormGroup { return this.importForm.get('narrativeForm') as FormGroup; }
  get instructionForm(): FormGroup { return this.importForm.get('instructionForm') as FormGroup; }
  get attachmentsArray(): FormArray { return this.importForm.get('attachments') as FormArray; }

  private patchForm(tx: ImportLcTransaction): void {
    this.importForm.patchValue({
      generalDetails: tx,
      applicantForm: tx,
      bankForm: tx,
      amountChargeForm: tx,
      paymentDetailsForm: tx,
      shipmentForm: tx,
      narrativeForm: tx,
      instructionForm: tx
    });
  }

  scrollToSection(i: number) {
    this.currentStep = i;
    document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private flattenForm(): ImportLcTransaction {
    return {
      ...this.importForm.value.generalDetails,
      ...this.importForm.value.applicantForm,
      ...this.importForm.value.bankForm,
      ...this.importForm.value.amountChargeForm,
      ...this.importForm.value.paymentDetailsForm,
      ...this.importForm.value.shipmentForm,
      ...this.importForm.value.narrativeForm,
      ...this.importForm.value.instructionForm,
      attachments: this.importForm.value.attachments
    };
  }


  saveForm(): void {
    if (this.importForm.invalid) {
      this.importForm.markAllAsTouched();
      this.snackBar.open('Please complete all required fields before saving.', 'Close', { duration: 3000 });
      return;
    }

    // Flatten nested form groups into single object
    const payload = this.flattenForm();
    console.log("Payload before saving draft:", payload);

    this.api.savePending(payload).subscribe({
      next: (res: ImportLcTransaction) => {
        // this.currentTx = res;  // backend response has updated id, tnxId, createdOn, updatedOn
        // this.transactionService.addOrUpdateTransaction(res);
        this.snackBar.open(`Draft saved successfully (TNX ID: ${res.tnxId})`, 'Close', { duration: 5000 });
        setTimeout(() => this.router.navigate(['/import-screen/enquiries']), 50);
      },
      error: () => this.snackBar.open('Error saving draft', 'Close', { duration: 3000 })
    });
  }


  submitLc(): void {
    const tnxId = this.currentTx?.tnxId;
    if (!tnxId) {
      this.snackBar.open('Transaction ID not found. Please save the draft first.', 'Close', { duration: 3000 });
      return;
    }
    const payload = {
      ...this.flattenForm(), // merge current form data
      tnxId: this.tnxId
    }
    this.api.submitTransaction(tnxId, payload).subscribe({
      next: (res: ImportLcTransaction) => {
        this.transactionService.addOrUpdateTransaction(res);
        this.router.navigate(['/import-screen/success'], {
          state: { transaction: res }
        });
      },
      error: () => {
        this.snackBar.open('Error submitting transaction', 'Close', { duration: 3000 });
      }
    });

  }

  back() {
    this.router.navigate(['/dashboard']);
  }

  updateAttachments(files: File[]) {
    const arr = this.importForm.get('attachments') as FormArray;
    arr.clear();
    files.forEach(file => arr.push(this.fb.group({
      title: file.name.replace(/\.[^/.]+$/, ""),
      fileName: file.name,
      size: file.size,
      type: file.type,
      file: file
    })));
  }

  update(): void {
    if (this.importForm.invalid || !this.currentTx?.tnxId) {
      this.snackBar.open('Invalid form or missing transaction ID', 'Close', { duration: 3000 });
      return;
    }

    const payload = this.flattenForm();
    payload.tnxId = this.tnxId;
    console.log('Payload before update:', payload);
    if (!payload.tnxId) {
      console.error('TNX ID is missing!');
      return;
    }
    // ImportLcTransaction = {
    //   id: this.currentTx.id,

    //   // ===== FLATTEN FORM VALUES =====
    //   ...this.importForm.value.generalDetails,
    //   ...this.importForm.value.applicantForm,
    //   ...this.importForm.value.bankForm,
    //   ...this.importForm.value.amountChargeForm,
    //   ...this.importForm.value.paymentDetailsForm,
    //   ...this.importForm.value.shipmentForm,
    //   ...this.importForm.value.narrativeForm,
    //   ...this.importForm.value.instructionForm,

    //   attachments: this.attachmentsArray.value,
    //   tnxId: this.currentTx?.tnxId
    // };

    this.api.updatePendingByTnxId(payload).subscribe({
      next: (res) => {
        // this.transactionService.addOrUpdateTransaction(res);
        this.snackBar.open(
          `Data successfully updated (${res.tnxId})`,
          'Close',
          { duration: 3000 }
        );

        setTimeout(
          () => this.router.navigate(['/import-screen/enquiries']),
          300
        );
      },
      error: () => {
        this.snackBar.open('Error updating transaction', 'Close', { duration: 3000 });
      }
    });
  }

}
