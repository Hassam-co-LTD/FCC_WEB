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
  canApprove = false; // Permission flag
  userRole: string = ''; // Store user role
  accountSteps = [{ label: "My Accounts" }];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private apiService: ApiService,
    private myAccountsService: MyAccountsService
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

    // Initialize user permissions
    this.initializeUserPermissions();
  }

  private initializeUserPermissions() {
    // Get user role from service
    this.userRole = this.myAccountsService.getCurrentUserRole();
    console.log('Current user role:', this.userRole);
    
    // Check approval permissions
    this.myAccountsService.canApproveTransfers().subscribe({
      next: (hasPermission) => {
        this.canApprove = hasPermission;
        console.log('User can approve/reject transfers:', this.canApprove);
      },
      error: (err) => {
        console.error('Error checking permissions:', err);
        this.canApprove = false;
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
    console.log('Updating workflow state:', status);
    
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
        console.log('Transfer is submitted. User can approve?', this.canApprove);
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
    if (this.myAccountsForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }
    
    this.myAccountsService.createTransferDraft(this.getFormData()).subscribe({
      next: () => {
        this.snackBar.open('Draft Saved Successfully', 'Close', { duration: 2000 });
        this.router.navigate(['/fund-transfer/fund-transfer-records'], { queryParams: { tab: 'pending' }});
      },
      error: (err) => {
        const errorMsg = err.message || 'Failed to save draft. Please try again.';
        this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
      }
    });
  }

  update(): void {
    if (this.myAccountsForm.invalid || !this.tnxId) return;
    
    this.myAccountsService.updateTransferDraft(this.tnxId, this.getFormData()).subscribe({
      next: () => {
        this.snackBar.open('Draft Updated Successfully', 'Close', { duration: 2000 });
        this.router.navigate(['/fund-transfer/fund-transfer-records'], { queryParams: { tab: 'pending' }});
      },
      error: (err) => {
        const errorMsg = err.message || 'Failed to update draft. Please try again.';
        this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
      }
    });
  }

  submitTransfer(): void {
    if (!this.tnxId) {
      this.snackBar.open('Transaction ID is missing', 'Close', { duration: 3000 });
      return;
    }
    
    this.myAccountsService.submitTransfer(this.tnxId, this.getFormData()).subscribe({
      next: () => {
        this.snackBar.open('Submitted Successfully for Approval', 'Close', { duration: 2000 });
        this.router.navigate(['/fund-transfer/fund-transfer-records'], { queryParams: { tab: 'submitted' }});
      },
      error: (err) => {
        const errorMsg = err.message || 'Failed to submit transfer. Please try again.';
        this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
      }
    });
  }

  approve(): void {
    if (!this.tnxId) {
      this.snackBar.open('Transaction ID is missing', 'Close', { duration: 3000 });
      return;
    }
    
    if (!this.canApprove) {
      this.snackBar.open('You do not have permission to approve transfers', 'Close', { duration: 5000 });
      return;
    }
    
    const confirmApprove = confirm('Are you sure you want to approve this transaction?');
    if (!confirmApprove) return;
    
    this.isLoading = true;
    this.myAccountsService.approveTransfer(this.tnxId, this.getFormData()).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Transaction Approved Successfully', 'Close', { duration: 2000 });
        this.router.navigate(['/fund-transfer/fund-transfer-records'], { queryParams: { tab: 'approved' }});
      },
      error: (err) => {
        this.isLoading = false;
        const errorMsg = err.message || 'Failed to approve transfer. Please try again.';
        this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
      }
    });
  }

  openReject(): void {
    console.log('Opening reject dialog. Can approve?', this.canApprove, 'tnxId:', this.tnxId);
    
    // Check permission before opening dialog
    if (!this.canApprove) {
      this.snackBar.open('You do not have permission to reject transfers', 'Close', { duration: 5000 });
      return;
    }
    
    if (!this.tnxId) {
      this.snackBar.open('Transaction ID is missing', 'Close', { duration: 3000 });
      return;
    }
    
    // 1. Open the dialog
    const dialogRef = this.dialog.open(RejectDialogComponent, { 
      width: '500px',
      disableClose: true,
      data: { tnxId: this.tnxId }
    });

    // 2. Listen for the result
    dialogRef.afterClosed().subscribe(reason => {
      console.log('Dialog closed with reason:', reason);
      
      // Check if reason is provided and not empty
      if (reason && typeof reason === 'string' && reason.trim().length > 0) {
        this.rejectTransfer(reason.trim());
      } else {
        console.log('Dialog closed without valid reason');
        if (reason === null || reason === undefined) {
          // User clicked cancel or closed dialog
          console.log('Rejection cancelled by user');
        } else {
          this.snackBar.open('Please enter a rejection reason', 'Close', { duration: 3000 });
        }
      }
    });
  }

  private rejectTransfer(reason: string): void {
    console.log('Rejecting transfer with reason:', reason);
    
    this.isLoading = true;
    
    // For debugging: Test if we can bypass permission check temporarily
    console.log('Current user role:', this.userRole);
    console.log('Permission check bypassed for testing');
    
    // Direct API call bypassing permission check for testing
    const formData = this.getFormData();
    const rejectData = {
      ...formData,
      rejectionReason: reason,
      tnxId: this.tnxId
    };
    
    // Try direct API call first
    this.apiService.rejectTransfer(this.tnxId!, reason).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Reject API success:', res);
        this.snackBar.open('Transaction Rejected Successfully', 'Close', { duration: 2000 });
        
        // Navigate to the rejected tab
        this.router.navigate(['/fund-transfer/fund-transfer-records'], { 
          queryParams: { tab: 'rejected' } 
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Reject API Error:", err);
        
        // If direct API fails, try through service
        this.fallbackRejectThroughService(reason, err);
      }
    });
  }

  private fallbackRejectThroughService(reason: string, originalError: any): void {
    console.log('Trying fallback through service...');
    
    this.myAccountsService.rejectTransfer(this.tnxId!, reason).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.snackBar.open('Transaction Rejected Successfully', 'Close', { duration: 2000 });
        
        this.router.navigate(['/fund-transfer/fund-transfer-records'], { 
          queryParams: { tab: 'rejected' } 
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Service reject error:", err);
        
        let errorMessage = 'Failed to reject transfer. ';
        if (err.message) {
          errorMessage += err.message;
        } else if (originalError.message) {
          errorMessage += originalError.message;
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  updateRejected(): void {
    if (!this.tnxId) return;
    
    this.myAccountsService.updateRejectedTransfer(this.tnxId, this.getFormData()).subscribe({
      next: () => {
        // After updating rejected, immediately submit it
        this.submitTransfer();
      },
      error: (err) => {
        const errorMsg = err.message || 'Failed to update rejected transfer. Please try again.';
        this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
      }
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
    const formValue = this.myAccountsForm.getRawValue().generalDetails;
    console.log('Form data:', formValue);
    return formValue;
  }

  private initializeNewTransfer() {
    this.mode = 'CREATE';
    this.screenMode = 'EDIT';
    this.generalDetailsForm.patchValue({ transferDate: new Date() });
  }

  back() { 
    this.router.navigate(['/fund-transfer/fund-transfer-records']); 
  }

  scrollToSection(index: number) {
    this.currentStep = index;
    document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth' });
  }

  // Logic for your "Preview Mode" buttons (Confirm Transfer)
  editForm() { 
    this.screenMode = 'EDIT'; 
    this.myAccountsForm.enable(); 
  }
  
  confirmTransfer() { 
    this.submitTransfer(); 
  }
}