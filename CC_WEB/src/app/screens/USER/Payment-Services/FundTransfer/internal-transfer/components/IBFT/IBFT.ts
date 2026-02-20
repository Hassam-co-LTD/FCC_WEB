import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

// Services
import { MyAccountsService } from '../../../../../../../core/services/user-service/Payment-Service/my-accounts-services/account-transfer';
import { ApiService } from '../../../../../../../core/services/api.service';

// Child Components
import { GeneralDetails } from "../IBFT/general-details/general-details";
import { Sidebar } from "../../../../../../../core/sidebar/sidebar";
import { RejectDialogComponent } from '../../../../../../../shared/reject-dialog/reject-dialog';
import { Preview } from '../IBFT/preview/preview';

@Component({
  selector: 'app-ibft',
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
  templateUrl: './IBFT.html',
  styleUrls: ['./IBFT.scss']
})
export class IBFT implements OnInit {
  // Navigation & UI State
  currentStep = 0;
  accountSteps = [{ label: "IBFT" }];
  isLoading = false;
  
  // Form & Transaction State
  myAccountsForm!: FormGroup;
  tnxId?: string;
  canApprove = false;

  /**
   * mode: Controls the logical operation (New, existing Draft, or Resubmitting Rejected)
   * screenMode: Controls which UI section is visible (Edit form, Preview, or readonly views)
   */
  mode: 'CREATE' | 'UPDATE' | 'REJECTED' = 'CREATE';
  screenMode: 'EDIT' | 'SUBMITTED' | 'APPROVED' | 'PREVIEW' | 'REJECTED_VIEW' = 'EDIT';

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

    this.checkPermissions();
  }

  // --- Form Initialization ---
  private buildForm(): void {
    this.myAccountsForm = this.fb.group({
      generalDetails: this.fb.group({
        productType: ['IBFT', Validators.required],
        transferFrom: ['', Validators.required],
        transferFrom_accountName: [''], 
        transferTo: ['', Validators.required],
        transferTo_accountName: [''], 
        transferTo_accountNickname: [''],
        transferDate: [new Date(), Validators.required],
        // amount: [null, [Validators.required, Validators.min(1)]],
        // currency: [{ value: 'PKR', disabled: true }],
        transactionRemarks: ['', [Validators.maxLength(500)]]
      })
    });
  }

  get generalDetailsForm(): FormGroup {
    return this.myAccountsForm.get('generalDetails') as FormGroup;
  }

  // --- Logic & Workflow ---
  private checkPermissions() {
    this.myAccountsService.canApproveTransfers().subscribe(hasPerm => this.canApprove = hasPerm);
  }

  private loadExistingTransfer(tnxId: string) {
    this.isLoading = true;
    this.apiService.getTransferByTnxId(tnxId).subscribe({
      next: (data) => {
        this.patchFormData(data);
        this.setWorkflowByStatus(data.status);
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Error loading transaction', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private patchFormData(data: any) {
    this.generalDetailsForm.patchValue({
      productType: data.productType || 'IBFT',
      transferFrom: data.transferFrom,
      transferFrom_accountName: data.transferFrom_accountName,
      transferTo: data.transferTo,
      transferTo_accountName: data.transferTo_accountName,
      transferTo_accountNickname: data.transferTo_accountNickname,
      transferDate: data.transferDate ? new Date(data.transferDate) : new Date(),
      // amount: data.amount,
      transactionRemarks: data.transactionRemarks
    });
  }

  private setWorkflowByStatus(status: string) {
    switch (status) {
      case 'I': // Initiated/Draft
        this.mode = 'UPDATE';
        this.screenMode = 'EDIT';
        break;
      case 'S': // Submitted
        this.mode = 'UPDATE';
        this.screenMode = 'SUBMITTED';
        this.myAccountsForm.disable();
        break;
      case 'A': // Approved
        this.mode = 'UPDATE';
        this.screenMode = 'APPROVED';
        this.myAccountsForm.disable();
        break;
      case 'R': // Rejected
        this.mode = 'REJECTED';
        this.screenMode = 'EDIT';
        break;
    }
  }

  // --- Button Actions ---

  saveForm() {
    if (this.generalDetailsForm.invalid) return;
    this.myAccountsService.createTransferDraft(this.getRawData()).subscribe(() => {
      this.snackBar.open('Draft Saved', 'Close', { duration: 2000 });
      this.back();
    });
  }

  update() {
    if (this.generalDetailsForm.invalid || !this.tnxId) return;
    this.myAccountsService.updateTransferDraft(this.tnxId, this.getRawData()).subscribe(() => {
      this.snackBar.open('Draft Updated', 'Close', { duration: 2000 });
      this.back();
    });
  }

  submitTransfer() {
    // This moves the UI to Preview mode as per typical IBFT flow
    if (this.generalDetailsForm.valid) {
      this.screenMode = 'PREVIEW';
    } else {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
    }
  }

  confirmTransfer() {
    if (!this.tnxId) {
      // Logic to create and THEN submit if it's a brand new record
      this.myAccountsService.createTransferDraft(this.getRawData()).subscribe((res: any) => {
        this.executeSubmission(res.tnxId);
      });
    } else {
      this.executeSubmission(this.tnxId);
    }
  }

  private executeSubmission(id: string) {
    this.myAccountsService.submitTransfer(id, this.getRawData()).subscribe(() => {
      this.snackBar.open('Transfer Submitted Successfully', 'Close', { duration: 2000 });
      this.router.navigate(['/fund-transfer/fund-transfer-records'], { queryParams: { tab: 'submitted' }});
    });
  }

  approve() {
    if (this.tnxId && confirm('Approve this transfer?')) {
      this.myAccountsService.approveTransfer(this.tnxId, this.getRawData()).subscribe(() => {
        this.snackBar.open('Transfer Approved', 'Close', { duration: 2000 });
        this.router.navigate(['/fund-transfer/fund-transfer-records'], { queryParams: { tab: 'approved' }});
      });
    }
  }

  openReject() {
    const dialogRef = this.dialog.open(RejectDialogComponent, { width: '400px', data: { tnxId: this.tnxId } });
    dialogRef.afterClosed().subscribe(reason => {
      if (reason) this.apiService.rejectTransfer(this.tnxId!, reason).subscribe(() => this.back());
    });
  }

  updateRejected() {
    if (this.tnxId) {
      this.myAccountsService.updateRejectedTransfer(this.tnxId, this.getRawData()).subscribe(() => {
        this.executeSubmission(this.tnxId!);
      });
    }
  }

  // --- Helpers ---
  private initializeNewTransfer() {
    this.mode = 'CREATE';
    this.screenMode = 'EDIT';
  }

  private getRawData() {
    return this.myAccountsForm.getRawValue().generalDetails;
  }

  editForm() {
    this.screenMode = 'EDIT';
    this.myAccountsForm.enable();
    this.generalDetailsForm.get('currency')?.disable();
  }

  back() {
    this.router.navigate(['/fund-transfer/fund-transfer-records']);
  }

  scrollToSection(index: number) {
    this.currentStep = index;
    const el = document.getElementById(`section-${index}`);
    el?.scrollIntoView({ behavior: 'smooth' });
  }
}