import { Component, OnInit, AfterViewInit } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray } from '@angular/forms';

// CHILD COMPONENTS
import { GeneralDetails } from "../../../USER/Trade-Services/export-collection/components/general-details/general-details";
import { DrawerDraweeDetails } from "../../../USER/Trade-Services/export-collection/components/drawer-drawee-details/drawer-drawee-details";
import { BankDetailsComponent } from '../../../USER/Trade-Services//export-collection/components/bank-details/bank-details';
import { ShippingDetailsComponent } from '../../../USER/Trade-Services/export-collection/components/shipping-details/shipping-details';
import { PaymentAmountComponent } from '../../../USER/Trade-Services/export-collection/components/payment-amount/payment-amount';
import { CollectionInstructionsComponent } from '../../../USER/Trade-Services/export-collection/components/collection-instructions/collection-instructions';
import { License } from "../../../USER/Trade-Services/export-collection/components/license/license";
import { AttachmentsDocuments } from "../../../USER/Trade-Services/export-collection/components/attachments-documents/attachments-documents";
import { Sidebar } from "../../../../core/sidebar/sidebar";
import { SharedService } from '../../../../core/services/user-service/shared-form-service/shared-service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExportCollectionTransaction } from '../../../../core/models/export-collection';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ExportCollectionFormTransactionService } from '../../../../core/services/user-service/export-collection-form-transaction-service/export-collection-form-transaction';
import { RejectDialogComponent } from '../../../../shared/reject-dialog/reject-dialog';
import { CommonModule } from '@angular/common';

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
    RouterModule,
],
  templateUrl: './export-collection.html',
  styleUrls: ['./export-collection.scss']
})
export class ExportCollection implements OnInit {
  currentStep = 0;
  ExportCollectionForm!: FormGroup;
  mode: 'CREATE' | 'UPDATE' | 'REJECTED' = 'CREATE';
  screenMode: 'EDIT' | 'SUBMITTED' | 'APPROVED' | 'FINAL' = 'EDIT';
  currentTx: ExportCollectionTransaction = {} as ExportCollectionTransaction;
  showUpdateSubmit = false;
  showApproveReject = false;
  rejectionReason = '';
  tnxId = '';
  companyId = '';
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
    private snackbar: MatSnackBar,
    private api: ApiService,
    private authservice: AuthService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private transactionService: ExportCollectionFormTransactionService
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

    // -----------------------------
    // FORM CREATION
    // -----------------------------
  private buildForm(): void {
    this.ExportCollectionForm = this.fb.group({
      generalDetailsForm: this.fb.group({
        collectionType: [''],
        customerReference: [''],
        draweeReference: ['']
      }),

      DrawerDraweeDetailsForm: this.fb.group({
        drawerName: [''],
        drawerAddress1: [''],
        drawerAddress2: [''],
        drawerAddress3: [''],
        drawerAddress4: [''],
        draweeName: [''],
        draweeAddress1: [''],
        draweeAddress2: [''],
        draweeAddress3: [''],
        draweeAddress4: ['']
      }),

      bankDetailsForm: this.fb.group({
        remittingBankName: [''],
        issuerReference: [''],
        principalAccount: [''],
        feeAccount: [''],
        presentingBankName: [''],
        bankAddress1: [''],
        bankAddress2: [''],
        bankAddress3: [''],
        bankAddress4: [''],
        collectingBankName: [''],
        swiftCode: [''],
        collectingReference: ['']
      }),

      paymentAmountForm: this.fb.group({
        amount: [''],
        currency: [''],
        paymentType: [''],
        tenor: [''],
        paymentReference: ['']
      }),

      shippingDetailsForm: this.fb.group({
        shippingMethod: [''],
        shipmentReference: [''],
        shippingFrom: [''],
        shippingTo: [''],
        shipmentDate: [''],
        applicableRule: [''],
        incoterms: ['']
      }),

      licenseForm: this.fb.group({
        licenseNumber: [''],
        licenseDate: [''],
        licenseFile: [null]
      }),

      collectionInstructionsForm: this.fb.group({
        advicePaymentBy: [''],
        adviceAcceptanceAndDueDateBy: [''],
        adviceReasonOfRefusalBy: [''],
        openingCharges: ['DRAWEE'],
        outsideCountryCharges: ['DRAWEE'],
        waiveAllChargesIfRefusedByDrawee: [false],
        protestInCaseOfNonPayment: [false],
        protestInCaseOfNonAcceptance: [false],
        acceptanceMayBeDeferredPendingArrival: [false],
        warehouseOrInsureGoodsIfNecessary: [false],
        referTo: ['']
      }),

      attachments: this.fb.group({
        documents: this.fb.array([])
      })

    });
  }

  // -----------------------------
    // Safe getters for html form access of the specific form groups 
  // -----------------------------

  get generalDetailsForm(): FormGroup {
    return this.ExportCollectionForm.get('generalDetailsForm') as FormGroup;
  }

  get DrawerDraweeDetailsForm(): FormGroup {
    return this.ExportCollectionForm.get('DrawerDraweeDetailsForm') as FormGroup;
  }

  get bankDetailsForm(): FormGroup {
    return this.ExportCollectionForm.get('bankDetailsForm') as FormGroup;
  }

  get paymentAmountForm(): FormGroup {
    return this.ExportCollectionForm.get('paymentAmountForm') as FormGroup;
  }

  get shippingDetailsForm(): FormGroup {
    return this.ExportCollectionForm.get('shippingDetailsForm') as FormGroup;
  }

  get collectionInstructionsForm(): FormGroup {
    return this.ExportCollectionForm.get('collectionInstructionsForm') as FormGroup;
  }

  get licenseForm(): FormGroup {
    return this.ExportCollectionForm.get('licenseForm') as FormGroup;
  }

  get attachmentsForm(): FormGroup {
    return this.ExportCollectionForm.get('attachments') as FormGroup;
  }

  get documentsArray(): FormArray {
    return this.attachmentsForm.get('documents') as FormArray;
  }

    private enterCreateMode(): void {
    this.mode = 'CREATE';
    this.showUpdateSubmit = false;
    this.showApproveReject = false;
    this.currentTx = {} as ExportCollectionTransaction;
      this.ExportCollectionForm.reset();
    this.buildForm();
  }

  private patchForm(tx: ExportCollectionTransaction): void {
    this.ExportCollectionForm.patchValue({
      generalDetailsForm: tx,
      DrawerDraweeDetailsForm: tx,
      bankDetailsForm: tx,
      paymentAmountForm: tx,
      shippingDetailsForm: tx,
      collectionInstructionsForm: tx
    });
  }

  private enterEditMode(tnxId: string): void {
    this.mode = 'UPDATE';
    this.api.getTransactionForExportCollectionByTnxId(tnxId).subscribe({
      next: tx => {
        this.currentTx = tx;
        this.patchForm(tx);

        switch (tx.status) {
          case 'I': // pending
            this.mode = 'UPDATE';
            this.screenMode = 'EDIT';
            this.ExportCollectionForm.enable();
            break;
          case 'S': // submitted
            this.mode = 'UPDATE';
            this.screenMode = 'SUBMITTED';
            this.ExportCollectionForm.disable();
            break;
          case 'A': // Approved
            this.mode = 'UPDATE';
            this.screenMode = 'APPROVED';
            this.ExportCollectionForm.disable();
            break;

          case 'R': // Rejected
            this.mode = 'REJECTED';
            this.screenMode = 'EDIT';
            this.ExportCollectionForm.enable(); // allow correction
            break;
          default:
            this.mode = 'UPDATE';
            this.screenMode = 'FINAL';
            this.ExportCollectionForm.disable();
        }
      },
      error: () => {
        this.snackbar.open('Transaction not found', 'Close', { duration: 3000 });
        this.router.navigate(['/export-collection/inquiries-records']);
      }
    });
  }

  scrollToSection(index: number) {
    this.currentStep = index;
    const section = document.getElementById(`section-${index}`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
private flattenForm(): ExportCollectionTransaction {
      return {
        companyId: this.companyId,
        ...this.ExportCollectionForm.value.generalDetailsForm,
        ...this.ExportCollectionForm.value.DrawerDraweeDetailsForm,
        ...this.ExportCollectionForm.value.bankDetailsForm,
        ...this.ExportCollectionForm.value.paymentAmountForm,
        ...this.ExportCollectionForm.value.shippingDetailsForm,
        ...this.ExportCollectionForm.value.collectionInstructionsForm,
        attachments: this.ExportCollectionForm.value.attachments
      };
    }
  // -----------------------------
  // ACTION BUTTONS
  // -----------------------------
saveForm(): void {
  if (this.ExportCollectionForm.invalid) {
    this.ExportCollectionForm.markAllAsTouched();
      this.snackbar.open('Please complete all required fields before saving.', 'Close', { duration: 3000 });
      return;
    }

    // Flatten nested form groups into single object
    const payload = this.flattenForm();
    console.log("Payload before saving draft:", payload);

    this.api.savePendingForExportCollection(payload).subscribe({
      next: (res: ExportCollectionTransaction) => {
        this.snackbar.open(`Draft saved successfully (TNX ID: ${res.tnxId})`, 'Close', { duration: 5000 });
        setTimeout(() => this.router.navigate(['/export-collection/inquiries-records']), 50);
      },
      error: () => this.snackbar.open('Error saving draft', 'Close', { duration: 3000 })
    });
  }
  submitCollection(): void {
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
      this.api.submitExportCollectionByTnxId(tnxId, payload).subscribe({
        next: (res: ExportCollectionTransaction) => {
          this.transactionService.addOrUpdateTransaction(res);
          this.router.navigate(['/export-collection/success'], {
            state: { source: 'EXPORT_COLLECTION', transaction: res }
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
    const arr = this.ExportCollectionForm.get('attachments') as FormArray;
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
    if (this.ExportCollectionForm.invalid || !this.currentTx?.tnxId) {
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
    this.api.updatePendingByTnxIdForExportCollection(payload.tnxId!, payload).subscribe({
      next: (res) => {
        // this.transactionService.addOrUpdateTransaction(res);
        this.snackbar.open(
          `Data successfully updated (${res.tnxId})`,
          'Close',
          { duration: 3000 }
        );

        setTimeout(
          () => this.router.navigate(['/export-collection/inquiries-records']),
          300
        );
      },
      error: () => {
        this.snackbar.open('Error updating transaction', 'Close', { duration: 3000 });
      }
    });
  }

  approve(): void {
      this.api.approveTransactionForExportCollection(this.currentTx.tnxId!, this.currentTx).subscribe({
        next: () => this.navigateBack('approved'),
        error: () => this.snackbar.open('Approval failed', 'Close', { duration: 3000 })
      });
    }
    openReject(): void {
      const dialogRef = this.dialog.open(RejectDialogComponent, {
        width: '400px'
      });
  
      dialogRef.afterClosed().subscribe((reason: string | undefined) => {
        if (!reason) return; // user cancelled
  
        this.api.rejectTransactionForExportCollection(this.currentTx.tnxId!, reason).subscribe({
          next: (res) => {
            this.snackbar.open('Transaction rejected successfully', 'Close', { duration: 3000 });
            this.navigateBack('rejected'); // send user to rejected tab
          },
          error: () => {
            this.snackbar.open('Failed to reject transaction', 'Close', { duration: 3000 });
          }
        });
      });
    }
  
    // reject(): void {
    //   this.api.rejectTransaction(this.currentTx.tnxId!).subscribe({
    //     next: () => this.navigateBack('rejected'),
    //     error: () => this.snackBar.open('Rejection failed', 'Close', { duration: 3000 })
    //   });
    // }
  
    private navigateBack(tab: string) {
      this.router.navigate(['/export-collection/inquiries-records'], {
        queryParams: { tab }
      });
    }
  
    updateRejected(): void {
      if (this.ExportCollectionForm.invalid || !this.currentTx?.tnxId) {
        this.snackbar.open('Invalid form or missing transaction ID', 'Close', { duration: 3000 });
        return;
      }
  
      const payload = this.flattenForm(); // flatten form values
      payload.tnxId = this.currentTx.tnxId;
  
      this.api.updateRejectedTransactionForExportCollection(payload.tnxId, payload).subscribe({
        next: (res) => {
          this.snackbar.open(
            `Rejected transaction updated and moved back to Pending (TNX: ${res.tnxId})`,
            'Close',
            { duration: 3000 }
          );
  
          // Navigate back to inquiries with Pending tab
          this.router.navigate(['/export-collection/inquiries-records'], {
            queryParams: { tab: 'pending' }
          });
        },
        error: () => {
          this.snackbar.open('Failed to update rejected transaction', 'Close', { duration: 3000 });
        }
      });
    }
}
