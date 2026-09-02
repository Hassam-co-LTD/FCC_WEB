import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCard } from '@angular/material/card';
import { AuthService } from '../../../../../../core/services/auth.service';
import Swal from 'sweetalert2';
import { ApiService } from '../../../../../../core/services/api.service';
import { TransactionComparisonService } from '../../../../../../core/services/admin-service/transaction-comparison.service';
@Component({
  selector: 'app-customer-branch',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCard,
  ],
  templateUrl: './customer-branch.html',
  styleUrls: ['./customer-branch.scss'],
})
export class CustomerBranch implements OnInit {
  branchForm!: FormGroup;
  dynamicFieldsForm!: FormGroup;

  storeBranch: any = {};
  storeCities: any[] = [];
  fields: any[] = [];
  storeDynamicFieldsResponse: any[] = [];

  isEditMode = false;
  isOpen = true;
  isDynamicFieldsOpen = true;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private authService: AuthService,
    private comparisonService: TransactionComparisonService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadBranch();
    this.getAllCities();
    this.loadDynamicFields();
  }

  // ================= FORM =================
  private buildForm(): void {
    this.branchForm = this.fb.group({
      branchId: [''],
      branchCode: ['', Validators.required],
      branchName: ['', Validators.required],
      branchAddress: [''],
      swiftAddress: [''],
      emailAddress: ['', Validators.email],
      localCurrency: [''],
      branchStatus: [''],
      contactPerson: [''],
      cityId: [null, Validators.required],
      contactNo: [''],
      createdBy: [this.authService.getLoginId()],
    });
  }

  // ================= LOAD BRANCH =================
  private loadBranch(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isEditMode = true;

    this.api.getTnxById(id, 'branch').subscribe({
      next: (res: any) => {
        console.log('Loaded Branch:', res);
        this.storeBranch = res;
        console.log('storeBranch', this.storeBranch);
        this.storeDynamicFieldsResponse = res.dynamicFields || [];
        this.branchForm.patchValue(res);
        this.patchDynamicValues();
        if (this.storeBranch.recordStatus === 'S') {
          this.api
            .getRejectedTransaction(this.storeBranch.id, 'branch')
            .subscribe({
              next: (res: any) => {
                console.log('Rejected Branch:', res);
                this.storeRejectedCustomerBranch = res;
                this.storeRejectedDynamicFields = res.dynamicFields || [];

                this.compareCustomerBranchData();
                this.compareCustomerBranchDynamicFields();
              },
              error: (err: any) =>
                console.error('Error fetching rejected branch', err),
            });
        }
      },
      error: (err: any) => console.error('Load failed', err),
    });
  }

  // ================= LOAD DYNAMIC FIELDS =================
  private loadDynamicFields(): void {
    this.api.getFieldsByScreenAndStatus('branch', 'A').subscribe({
      next: (res: any) => {
        console.log('Branch Dynamic Fields:', res);
        this.fields = this.removeDuplicateFields(res);

        const group: any = {};
        this.fields.forEach((f: any) => {
          group[f.fieldName] = [''];
        });

        this.dynamicFieldsForm = this.fb.group(group);
        this.patchDynamicValues();
      },
      error: (err: any) => console.error('Dynamic field load failed', err),
    });
  }

  // ================= PATCH DYNAMIC =================
  private patchDynamicValues(): void {
    if (
      !this.dynamicFieldsForm ||
      !this.fields?.length ||
      !this.storeDynamicFieldsResponse?.length
    )
      return;

    const patch: any = {};

    this.storeDynamicFieldsResponse.forEach((saved: any) => {
      const def = this.fields.find((f: any) => f.fieldId == saved.fieldId);
      if (def) patch[def.fieldName] = saved.value || '';
    });

    this.dynamicFieldsForm.patchValue(patch);
  }

  // ================= SAVE =================
  onSave(): void {
    if (this.branchForm.invalid) return;

    // 🔹 Prepare dynamic fields (matches DTO)
    const dynamicPayload =
      this.fields?.map((f) => ({
        // Use existing ID or 0 for new
        branchId: this.branchForm.value.branchId || 0,
        fieldId: f.fieldId,
        value: this.dynamicFieldsForm.get(f.fieldName)?.value || '',
      })) || [];

    // 🔹 Create FULL payload (matches BranchMasterRequestDto)
    const branchPayload = {
      ...this.branchForm.getRawValue(),
      dynamicFields: dynamicPayload,
      createdOn: new Date().toISOString().split('.')[0],
    };

    console.log('Sending DTO payload:', branchPayload);

    // 🔹 SINGLE API CALL
    this.api.saveTnx(branchPayload, 'branch').subscribe({
      next: (res: any) => {
        console.log('Branch + Dynamic saved:', res);

        Swal.fire('Saved!', 'Branch saved successfully', 'success').then(() => {
          this.router.navigate(['/admin/branch-list'], {
            queryParams: { tabName: 'Draft' },
          });
        });
      },
      error: (err: any) => {
        console.error('Save failed', err);
        Swal.fire('Error', 'Branch save failed', 'error');
      },
    });
  }
  // ================= UPDATE =================
  // ---------------- UPDATE ----------------
  update(id: number): void {
    if (this.branchForm.invalid) return;

    const branchId = this.branchForm.value.branchId;

    const dynamicPayload =
      this.fields?.map((f) => ({
        fieldId: f.fieldId,
        value: this.dynamicFieldsForm.get(f.fieldName)?.value || '',
      })) || [];

    const branchPayload = {
      ...this.branchForm.getRawValue(),
      updatedBy: this.authService.getLoginId(),
      dynamicFields: dynamicPayload,
      updatedOn: new Date().toISOString().split('.')[0],
    };

    console.log('Payload to update:', branchPayload);

    this.api.updateTnxx(branchPayload, `branch/update/${branchId}`).subscribe({
      next: () => {
        Swal.fire(
          'Updated!',
          'Branch and Additional Fields updated successfully',
          'success',
        );

        console.log('Branch updated successfully');
      },

      error: (err) => {
        console.error('Branch update failed', err);
      },
    });
  }
  // ================= WORKFLOW =================
  submit(): void {
    if (!this.storeBranch?.id) return;
    let payload = this.authService.getSubmitPayload();

    this.api.setTnxByStatus(payload, this.storeBranch.id, 'branch').subscribe({
      next: () =>
        Swal.fire(
          'Submitted!',
          'Branch submitted successfully',
          'success',
        ).then(() =>
          this.router.navigate(['/admin/branch-list'], {
            queryParams: { tabName: 'submitted' },
          }),
        ),
    });
  }

  reject(id: number): void {
    if (!id) return;

    Swal.fire({
      title: 'Reject Transaction',
      input: 'textarea',
      inputLabel: 'Reject Reason',
      inputPlaceholder: 'Please enter the reason for rejection...',
      inputAttributes: {
        'aria-label': 'Reject reason',
      },
      showCancelButton: true,
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',

      preConfirm: (reason) => {
        if (!reason || !reason.trim()) {
          Swal.showValidationMessage('Reject reason is required');

          return false;
        }

        return reason.trim();
      },
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      const rejectReason = result.value;

      // =========================
      // CREATE REJECT PAYLOAD
      // =========================

      const payload = this.authService.getRejectPayload(rejectReason);

      console.log('Reject ID:', id);
      console.log('Reject Payload:', payload);

      // =========================
      // CALL API
      // =========================

      this.api.setTnxByStatus(payload, id, 'branch').subscribe({
        next: (res: any) => {
          console.log('Reject successful:', res);

          Swal.fire(
            'Rejected!',
            res?.message || 'Branch rejected successfully',
            'success',
          ).then(() => {
            this.router.navigate(['/admin/branch-list'], {
              queryParams: {
                tabName: 'rejected',
              },
            });
          });
        },

        error: (err: any) => {
          console.error('Reject failed:', err);

          Swal.fire('Error', err?.error?.message || 'Reject failed', 'error');
        },
      });
    });
  }

  approve(id: number): void {
    let payload = this.authService.getApprovePayload();

    this.api.setTnxByStatus(payload, id, 'branch').subscribe({
      next: () =>
        Swal.fire('Approved!', 'Branch approved successfully', 'success').then(
          () =>
            this.router.navigate(['/admin/branch-list'], {
              queryParams: { tabName: 'approved' },
            }),
        ),
    });
  }

  amend(id: number): void {
    let payload = this.authService.getAmendPayload();
    this.api.setTnxByStatus(payload, id, 'branch').subscribe({
      next: () =>
        Swal.fire('Amended!', 'Branch amended successfully', 'success').then(
          () =>
            this.router.navigate(['/admin/branch-list'], {
              queryParams: { tabName: 'amended' },
            }),
        ),
    });
  }
  // ================= UTIL =================
  getAllCities(): void {
    this.api.getTnxByStatus('A', 'city/getApprovedCities').subscribe({
      next: (res) => (this.storeCities = res),
      error: (err) => console.error('Failed to load cities', err),
    });
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }
  toggleDynamicFields(): void {
    this.isDynamicFieldsOpen = !this.isDynamicFieldsOpen;
  }

  onBack(): void {
    this.location.back();
  }
  onCancel(): void {
    this.branchForm.reset();
    this.dynamicFieldsForm?.reset();
  }

  isReadOnly(): boolean {
    return this.storeBranch?.recordStatus === 'A';
  }

  // ===================  previous values for comparison ===================

  // =====================================================
  // REJECTED CUSTOMER
  // =====================================================

  storeRejectedCustomerBranch: any | null = null;

  storeRejectedDynamicFields: any[] = [];
  // =====================================================
  // PREVIOUS NORMAL CUSTOMER VALUES
  // =====================================================

  previousValues: { [key: string]: any } = {};

  // =====================================================
  // PREVIOUS DYNAMIC FIELD VALUES
  // =====================================================

  previousDynamicValues: { [key: string]: any } = {};

  // =====================================================
  // CUSTOMER GENERAL DETAILS FIELDS
  // =====================================================

  private readonly customerBranchFields = [
    'branchId',
    'branchCode',
    'branchName',
    'branchAddress',
    'swiftAddress',
    'branchStatus',
    'cityId',
    'contactNo',
    'contactPerson',
    'emailAddress',
    'localCurrency',
  ];

  // =====================================================
  // COMPARE CUSTOMER GENERAL DETAILS
  // =====================================================

  private compareCustomerBranchData(): void {
    this.previousValues = this.comparisonService.compare(
      this.storeBranch,
      this.storeRejectedCustomerBranch,
      this.customerBranchFields,
    );

    console.log('Previous customer values:', this.previousValues);
  }

  // =====================================================
  // COMPARE DYNAMIC FIELDS
  // =====================================================

  private compareCustomerBranchDynamicFields(): void {
    // Clear old values first
    this.previousDynamicValues = {};

    if (
      !this.storeBranch?.dynamicFields ||
      !this.storeRejectedCustomerBranch?.dynamicFields
    ) {
      return;
    }

    this.previousDynamicValues = this.comparisonService.compareDynamicFields(
      this.storeBranch.dynamicFields,
      this.storeRejectedDynamicFields,
    );

    console.log('Previous dynamic values:', this.previousDynamicValues);
  }

  // =====================================================
  // CHECK PREVIOUS CUSTOMER VALUE
  // =====================================================

  hasPreviousValue(field: string): boolean {
    return (
      this.previousValues &&
      Object.prototype.hasOwnProperty.call(this.previousValues, field) &&
      this.previousValues[field] !== null &&
      this.previousValues[field] !== undefined &&
      String(this.previousValues[field]).trim() !== ''
    );
  }

  // =====================================================
  // GET PREVIOUS CUSTOMER VALUE
  // =====================================================

  getPreviousValue(field: string): any {
    return this.previousValues?.[field] ?? '';
  }

  // =====================================================
  // CHECK PREVIOUS DYNAMIC FIELD VALUE
  // =====================================================

  hasPreviousDynamicValue(fieldId: string): boolean {
    return (
      this.previousDynamicValues &&
      Object.prototype.hasOwnProperty.call(
        this.previousDynamicValues,
        fieldId,
      ) &&
      this.previousDynamicValues[fieldId] !== null &&
      this.previousDynamicValues[fieldId] !== undefined &&
      String(this.previousDynamicValues[fieldId]).trim() !== ''
    );
  }

  // =====================================================
  // GET PREVIOUS DYNAMIC FIELD VALUE
  // =====================================================

  getPreviousDynamicValue(fieldId: string): any {
    return this.previousDynamicValues?.[fieldId] ?? '';
  }

  // remove the dupplicates

  private removeDuplicateFields(fields: any[]): any[] {
    const uniqueFields = new Map<string, any>();

    fields.forEach((field) => {
      if (field?.fieldId) {
        uniqueFields.set(field.fieldId, field);
      }
    });

    return Array.from(uniqueFields.values());
  }
}
