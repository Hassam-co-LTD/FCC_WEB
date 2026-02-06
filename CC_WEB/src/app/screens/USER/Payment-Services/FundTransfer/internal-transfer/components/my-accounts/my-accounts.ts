import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

// Services & DTOs
import { MyAccountsService } from '../../../../../../../core/services/user-service/Payment-Service/my-accounts-services/account-transfer';
import { ApiService } from '../../../../../../../core/services/api.service';
import { TransferDTO } from '../../../../../../../core/models/my-accounts';

// Child Components
import { GeneralDetails } from "./components/general-details/general-details";
import { Sidebar } from "../../../../../../../core/sidebar/sidebar";
import { RejectDialogComponent } from '../../../../../../../shared/reject-dialog/reject-dialog';
import { Preview } from './components/preview/preview';

@Component({
  selector: 'app-my-accounts',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    GeneralDetails,
    Preview,
    Sidebar
  ],
  templateUrl: './my-accounts.html',
  styleUrls: ['./my-accounts.scss']
})
export class MyAccountsComponent implements OnInit {
  currentStep = 0;
  myAccountsForm!: FormGroup;
  
  // Controls Button Groups in HTML
  mode: 'CREATE' | 'UPDATE' | 'REJECTED' = 'CREATE';
  screenMode: 'EDIT' | 'SUBMITTED' | 'APPROVED' | 'PREVIEW' | 'REJECTED_VIEW' = 'EDIT';
  
  tnxId?: string;
  isLoading = false;
  accountSteps = [{ label: "My Accounts" }];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private apiService: ApiService
  ) {
    this.buildForm();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.tnxId = params['tnxId'];
      if (this.tnxId) {
        this.loadExistingTransfer(this.tnxId);
      } else {
        this.initializeNewTransfer();
      }
    });
  }

  private loadExistingTransfer(tnxId: string) {
    this.isLoading = true;
    this.apiService.getTransferByTnxId(tnxId).subscribe({
      next: (transfer) => {
        this.setFormValues(transfer);
        this.updateWorkflowState(transfer.status || 'I');
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open(err.message, 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  /**
   * Syncs the TS logic with your HTML *ngIf conditions
   */
  private updateWorkflowState(status: string) {
    switch (status) {
      case 'I': // Pending Drafts
        this.mode = 'UPDATE';
        this.screenMode = 'EDIT';
        this.myAccountsForm.enable();
        break;
      case 'S': // submitted
            this.mode = 'UPDATE';
            this.screenMode = 'SUBMITTED';
            this.myAccountsForm.disable();
            // this.showUpdateSubmit = false;
            // this.showApproveReject = true;
            break;
      case 'A': // Approved
        this.mode = 'UPDATE';
        this.screenMode = 'APPROVED';
        this.myAccountsForm.disable();
        break;
      case 'R': // Rejected - Shows Edit + Resubmit button
        this.mode = 'REJECTED';
        this.screenMode = 'EDIT';
        this.myAccountsForm.enable();
        break;
    }
    this.generalDetailsForm.get('currency')?.disable();
  }

  // ==========================================
  // BUTTON ACTIONS
  // ==========================================

  saveForm(): void {
    if (this.myAccountsForm.invalid) return;
    this.apiService.saveTransferDraft(this.getFormData()).subscribe(() => {
      this.snackBar.open('Draft Saved', 'Close', { duration: 2000 });
      this.router.navigate(['/fund-transfer/fund-transfer-records'], { queryParams: { tab: 'pending' }});
    });
  }

  update(): void {
    if (this.myAccountsForm.invalid || !this.tnxId) return;
    this.apiService.updateTransferDraft(this.tnxId, this.getFormData()).subscribe(() => {
      this.snackBar.open('Draft Updated', 'Close', { duration: 2000 });
      this.router.navigate(['/fund-transfer/fund-transfer-records'], { queryParams: { tab: 'pending' }});
    });
  }

  submitTransfer(): void {
    if (!this.tnxId) return;
    this.apiService.submitTransfer(this.tnxId, this.getFormData()).subscribe(() => {
      this.snackBar.open('Submitted Successfully', 'Close', { duration: 2000 });
      this.router.navigate(['/fund-transfer/fund-transfer-records'], { queryParams: { tab: 'submitted' }});
    });
  }

  approve(): void {
    if (!this.tnxId) return;
    this.apiService.approveTransfer(this.tnxId, this.getFormData()).subscribe(() => {
      this.snackBar.open('Approved', 'Close', { duration: 2000 });
      this.router.navigate(['/fund-transfer/fund-transfer-records'], { queryParams: { tab: 'approved' }});
    });
  }

openReject(): void {
  // 1. Open the dialog
  const dialogRef = this.dialog.open(RejectDialogComponent, { 
    width: '400px',
    disableClose: true // Prevents closing by clicking outside
  });

  // 2. Listen for the result
  dialogRef.afterClosed().subscribe(reason => {
    // Check if reason is a string and not empty
    if (typeof reason === 'string' && reason.trim().length > 0 && this.tnxId) {
      
      this.isLoading = true; // Show loader
      
      this.apiService.rejectTransfer(this.tnxId, reason).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.snackBar.open('Transaction Rejected', 'Close', { duration: 2000 });
          
          // Force navigation to the rejected tab
          this.router.navigate(['/fund-transfer/fund-transfer-records'], { 
            queryParams: { tab: 'rejected' } 
          });
        },
        error: (err) => {
          this.isLoading = false;
          console.error("Reject Error:", err);
          this.snackBar.open('Error: ' + err.message, 'Close', { duration: 5000 });
        }
      });
    }
  });
}
  updateRejected(): void {
    if (!this.tnxId) return;
    this.apiService.updateRejectedTransfer(this.tnxId, this.getFormData()).subscribe(() => {
      // After updating rejected, immediately submit it
      this.submitTransfer();
    });
  }

  // ==========================================
  // UTILS
  // ==========================================

  private buildForm(): void {
    this.myAccountsForm = this.fb.group({
      generalDetails: this.fb.group({
        productType: ['Internal Transfer', Validators.required],
        transferFrom: ['', Validators.required],
        transferTo: ['', Validators.required],
        TransactionId: [''],
        transferDate: [null, Validators.required],
        amount: [null, [Validators.required, Validators.min(1)]],
        currency: [{ value: 'PKR', disabled: true }],
        transactionRemarks: ['', [Validators.maxLength(500)]]
      })
    });
  }

  get generalDetailsForm(): FormGroup {
    return this.myAccountsForm.get('generalDetails') as FormGroup;
  }

  private setFormValues(data: any): void {
    this.generalDetailsForm.patchValue({
      productType: data.productType,
      transferFrom: data.transferFrom,
      transferTo: data.transferTo,
      TransactionId: data.tnxId,
      transferDate: data.transferDate ? new Date(data.transferDate) : null,
      amount: data.amount,
      transactionRemarks: data.transactionRemarks
    });
  }

  private getFormData() {
    return this.myAccountsForm.getRawValue().generalDetails;
  }

  private initializeNewTransfer() {
    this.mode = 'CREATE';
    this.screenMode = 'EDIT';
    this.generalDetailsForm.patchValue({ transferDate: new Date() });
  }

  back() { this.router.navigate(['/fund-transfer/fund-transfer-records']); }

  scrollToSection(index: number) {
    this.currentStep = index;
    document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth' });
  }

  // Logic for your "Preview Mode" buttons (Confirm Transfer)
  editForm() { this.screenMode = 'EDIT'; this.myAccountsForm.enable(); }
  confirmTransfer() { this.submitTransfer(); }
}