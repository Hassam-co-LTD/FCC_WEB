import { OnInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router} from '@angular/router';
import { GeneralDetails } from './components/general-details/general-details';
import { ApplicantBeneficiary } from './components/applicant-beneficiary/applicant-beneficiary';
import { BankDetails } from './components/bank-details/bank-details';
import { InstructionsComponent } from './components/instructions/instructions';
import { Attachments } from './components/attachments/attachments';
import { Sidebar } from '../../../../core/sidebar/sidebar';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ShippingGuaranteeTransaction } from '../../../../core/models/shipping-guarantee';
import { ApiService } from '../../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { ShippingGuaranteeFormTransactionService } from '../../../../core/services/user-service/shipping-guarantee-form-transaction-service/shipping-guarantee-form-transaction-service';

@Component({
  selector: 'app-shipping-guarantee',
  standalone: true,
  imports: [
    CommonModule,
    GeneralDetails,
    ApplicantBeneficiary,
    BankDetails,
    InstructionsComponent,
    Attachments,
    Sidebar,
  ],
  templateUrl: './shipping-guarantee-screen.html',
  styleUrls: ['./shipping-guarantee-screen.scss']
})
export class ShippingGuarantee implements OnInit {
  currentStep = 0;
  ShippingGuaranteeForm!: FormGroup;
  mode: 'CREATE' | 'UPDATE' | 'REJECTED' = 'CREATE';
  screenMode: 'EDIT' | 'SUBMITTED' | 'APPROVED' | 'FINAL' = 'EDIT';
  currentTx: ShippingGuaranteeTransaction = {} as ShippingGuaranteeTransaction;
  showUpdateSubmit = false;
  showApproveReject = false;
  rejectionReason = '';
  tnxId = '';
  companyId ='';
  shippingGuaranteeSteps = [
    { label: 'General Details' },
    { label: 'Applicant & Beneficiary' },
    { label: 'Bank Details' },
    { label: 'Instructions' },
    { label: 'Attachments' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackbar: MatSnackBar,
    private api: ApiService,
    private authservice: AuthService,
    private route: ActivatedRoute,
    private transactionService: ShippingGuaranteeFormTransactionService
  ) {
    this.buildForm();
  }

  ngOnInit() {
    setTimeout(() => {
      const sections = document.querySelectorAll('section');
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.currentStep = Array.from(sections).indexOf(entry.target as HTMLElement);
            }
          });
        },
        { threshold: 0.4, root: document.querySelector('.scroll-area') }
      );
      sections.forEach(section => observer.observe(section));
    }, 200);
    
    const navState = history.state;

    if (navState?.mode) {
      this.screenMode = navState.mode;
    }

    this.companyId = this.authservice.getCompanyId() || '';
    console.log('Company ID from route:', this.companyId);
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

  private buildForm(): void{
    this.ShippingGuaranteeForm = this.fb.group({
      generalDetailsForm: this.fb.group({
        expiryDate: [''],
        beneficiaryReference: [''],
        customerReference:[''],
        billoflading: [''],
        modeOfShipment:[''],
        shippingDetails:[''],
        description:[''],
      }),
      applicantBeneficiaryForm: this.fb.group({
        applicantName: [''],
        applicantAddress1: [''],
        applicantAddress2: [''],
        applicantCountry: [''],
        beneficiaryName: [''],
        beneficiaryAddress1: [''],
        beneficiaryAddress2: [''],
        beneficiaryCountry: [''],
      }),
      issuingbankForm: this.fb.group({
        bankName: [''],
        issuerReference: [''],
        currency: [''],
        amount: [''],
      }),
      instructionForm: this.fb.group({
        principalAccount: [''],
        feeAccount: [''],
        otherInstructions: ['']
      }),
      attachments: this.fb.array([])
    });
  }
  
  // Safe getters for html form access of the specific form groups 
  get generalDetailsForm(): FormGroup 
  { 
    return this.ShippingGuaranteeForm.get('generalDetailsForm') as FormGroup;
  }
  get applicantBeneficiaryForm(): FormGroup 
  {
     return this.ShippingGuaranteeForm.get('applicantBeneficiaryForm') as FormGroup;
  }
  get issuingbankForm(): FormGroup
  {
     return this.ShippingGuaranteeForm.get('issuingbankForm') as FormGroup;
  }
  get instructionForm(): FormGroup 
  { 
    return this.ShippingGuaranteeForm.get('instructionForm') as FormGroup;
  }
  // get attachmentsArray(): FormArray
  // { 
  //   return this.ShippingGuaranteeForm.get('attachments') as FormArray; 
  // }

  private enterCreateMode(): void {
    this.mode = 'CREATE';
    this.showUpdateSubmit = false;
    this.showApproveReject = false;
    this.currentTx = {} as ShippingGuaranteeTransaction;
    this.ShippingGuaranteeForm.reset();
    this.buildForm();
  }

    private patchForm(tx: ShippingGuaranteeTransaction): void {
      this.ShippingGuaranteeForm.patchValue({
        generalDetailsForm: tx,
        applicantBeneficiaryForm: tx,
        issuingbankForm: tx,
        instructionForm: tx
      });
    }

  private enterEditMode(tnxId: string): void {
    this.mode = 'UPDATE';
    this.api.getTransactionForShippingGuaranteeByTnxId(tnxId).subscribe({
      next: tx => {
        this.currentTx = tx;
        this.patchForm(tx);

        switch (tx.status) {
          case 'I': // pending
            this.mode = 'UPDATE';
            this.screenMode = 'EDIT';
            this.ShippingGuaranteeForm.enable();
            break;
          case 'S': // submitted
            this.mode = 'UPDATE';
            this.screenMode = 'SUBMITTED';
            this.ShippingGuaranteeForm.disable();
            break;
          case 'A': // Approved
            this.mode = 'UPDATE';
            this.screenMode = 'APPROVED';
            this.ShippingGuaranteeForm.disable();
            break;

          case 'R': // Rejected
            this.mode = 'REJECTED';
            this.screenMode = 'EDIT';
            this.ShippingGuaranteeForm.enable(); // allow correction
            break;
          default:
            this.mode = 'UPDATE';
            this.screenMode = 'FINAL';
            this.ShippingGuaranteeForm.disable();
        }
      },
      error: () => {
        this.snackbar.open('Transaction not found', 'Close', { duration: 3000 });
        this.router.navigate(['/shipping-guarantee/inquiries-records']);
      }
    });
  }


  scrollToSection(index: number) {
    this.currentStep = index;
    const section = document.getElementById(`section-${index}`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

    private flattenForm(): ShippingGuaranteeTransaction {
      return {
        companyId: this.companyId,
        ...this.ShippingGuaranteeForm.value.generalDetailsForm,
        ...this.ShippingGuaranteeForm.value.applicantBeneficiaryForm,
        ...this.ShippingGuaranteeForm.value.issuingbankForm,
        ...this.ShippingGuaranteeForm.value.instructionForm,
        attachments: this.ShippingGuaranteeForm.value.attachments
      };
    }
 saveForm(): void {
   if (this.ShippingGuaranteeForm.invalid) {
     this.ShippingGuaranteeForm.markAllAsTouched();
      this.snackbar.open('Please complete all required fields before saving.', 'Close', { duration: 3000 });
      return;
    }

    // Flatten nested form groups into single object
    const payload = this.flattenForm();
    console.log("Payload before saving draft:", payload);

    this.api.savePendingShippingGuarantee(payload).subscribe({
      next: (res: ShippingGuaranteeTransaction) => {
        this.snackbar.open(`Draft saved successfully (TNX ID: ${res.tnxId})`, 'Close', { duration: 5000 });
        setTimeout(() => this.router.navigate(['/shipping-guarantee/inquiries-records']), 50);
      },
      error: () => this.snackbar.open('Error saving draft', 'Close', { duration: 3000 })
    });
  }
  submitGuarantee(): void {
      const tnxId = this.currentTx?.tnxId;
      const companyId = this.currentTx?.companyId;
      if (!tnxId) {
        this.snackbar.open('Transaction ID not found. Please save the draft first.', 'Close', { duration: 3000 });
        return;
      }
      if (!companyId) {
        this.snackbar.open('Company ID not found. Please save the draft first.', 'Close', { duration: 3000 });
        return;
      }
      const payload = {
        ...this.flattenForm(), // merge current form data
        tnxId: this.tnxId,
      }
      this.api.submitShippingGuaranteeByTnxId(tnxId, payload).subscribe({
        next: (res: ShippingGuaranteeTransaction) => {
          this.transactionService.addOrUpdateTransaction(res);
          this.router.navigate(['/shipping-guarantee/success'], {
            state: { source: 'SHIPPING_GUARANTEE', transaction: res }
          });
        },
        error: () => {
          this.snackbar.open('Error submitting transaction', 'Close', { duration: 3000 });
        }
      });
  
    }
  back() {
    this.router.navigate(['/dashboard']);
  }

  updateAttachments(files: File[]) {
    const arr = this.ShippingGuaranteeForm.get('attachments') as FormArray;
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
    if (this.ShippingGuaranteeForm.invalid || !this.currentTx?.tnxId) {
      this.snackbar.open('Invalid form or missing transaction ID', 'Close', { duration: 3000 });
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
        this.snackbar.open(
          `Data successfully updated (${res.tnxId})`,
          'Close',
          { duration: 3000 }
        );

        setTimeout(
          () => this.router.navigate(['/import-screen/inquiries']),
          300
        );
      },
      error: () => {
        this.snackbar.open('Error updating transaction', 'Close', { duration: 3000 });
      }
    });
  }

}
