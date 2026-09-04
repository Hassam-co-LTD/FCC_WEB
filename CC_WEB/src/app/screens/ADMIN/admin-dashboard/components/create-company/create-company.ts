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
import { AuthService } from '../../../../../core/services/auth.service';
import Swal from 'sweetalert2';
import { ApiService } from '../../../../../core/services/api.service';
import { TransactionComparisonService } from '../../../../../core/services/admin-service/transaction-comparison.service';
@Component({
  selector: 'app-company-profile',
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
  ],
  templateUrl: './create-company.html',
  styleUrls: ['./create-company.scss'],
})
export class CreateCompany implements OnInit {
  companyForm!: FormGroup;
  dynamicFieldsForm!: FormGroup;

  storeCompany: any = {};
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
    this.loadCompany();
    this.loadDynamicFields();
  }

  // ================= FORM BUILD =================
  private buildForm(): void {
    this.companyForm = this.fb.group({
      companyId: ['', Validators.required],
      companyName: ['', Validators.required],
      companyAddress: ['', Validators.required],
      companyStatus: ['A', Validators.required],
      companyType: ['', Validators.required],
      createdBy: [this.authService.getLoginId() || '', Validators.required],
    });
  }

  private buildDynamicForm(): void {
    const group: any = {};
    this.fields.forEach((f) => (group[f.fieldName] = ['']));
    this.dynamicFieldsForm = this.fb.group(group);
  }

  // ================= LOAD COMPANY =================
  private loadCompany(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.isEditMode = true;
    this.api.getTnxById(id, 'company').subscribe({
      next: (res: any) => {
        this.storeCompany = res;
        console.log('Loaded Company:', this.storeCompany);
        this.storeDynamicFieldsResponse = res.dynamicFields || [];
        this.companyForm.patchValue(res);
        this.patchDynamicValues();

        if (this.storeCompany.recordStatus === 'S') {
          this.api.getRejectedTransaction(id, 'company').subscribe({
            next: (res: any) => {
              this.storeRejectedCompany = res;
              this.compareCompanyData();
              this.compareCompanyDynamicFields();
              console.log(
                'Loaded Rejected Company:',
                this.storeRejectedCompany,
              );
            },
            error: (err) => console.error('Load failed', err),
          });
        }
      },
      error: (err) => console.error('Load failed', err),
    });
  }

  // ================= LOAD DYNAMIC FIELDS =================
  private loadDynamicFields(): void {
    this.api.getFieldsByScreenAndStatus('Company', 'A').subscribe({
      next: (res: any) => {
        this.fields = res;
        console.log('Company Dynamic Fields:', this.fields);
        this.buildDynamicForm();
        this.patchDynamicValues();
      },
      error: (err) => console.error('Dynamic field load failed', err),
    });
  }

  // ================= PATCH DYNAMIC VALUES =================
  private patchDynamicValues(): void {
    if (!this.dynamicFieldsForm || !this.storeDynamicFieldsResponse.length)
      return;
    const patch: any = {};
    this.storeDynamicFieldsResponse.forEach((saved) => {
      const def = this.fields.find((f) => f.fieldId == saved.fieldId);
      if (def) patch[def.fieldName] = saved.value || '';
    });
    this.dynamicFieldsForm.patchValue(patch);
  }

  // ================= SAVE COMPANY =================
  onSave(): void {
    if (this.companyForm.invalid) return;

    // 1️⃣ Merge company form + dynamic fields
    const dynamicPayload =
      this.fields?.map((f) => ({
        fieldId: f.fieldId,
        value: this.dynamicFieldsForm.get(f.fieldName)?.value || '',
        companyId: this.companyForm.get('companyId')?.value || '',
      })) || [];

    const payload = {
      ...this.companyForm.getRawValue(),
      dynamicFields: dynamicPayload,
    };
    console.log('Saving payload:', payload);
    this.api.saveTnx(payload, 'company').subscribe({
      next: (res: any) => {
        console.log('Company saved:', res);
        Swal.fire('Saved!', 'Company saved successfully', 'success');
      },
      error: (err: any) => {
        console.error('Company save failed', err);
        Swal.fire('Error', 'Company save failed', 'error');
      },
    });
  }

  // ================= SAVE DYNAMIC FIELDS =================
  private saveDynamicFields(companyId: string): void {
    if (!this.fields.length) return;

    const dynamicPayload = this.fields.map((f) => ({
      fieldId: f.fieldId,
      value: this.dynamicFieldsForm.get(f.fieldName)?.value || '',
      companyId: companyId,
    }));

    this.api.saveTnx(dynamicPayload, 'company').subscribe({
      next: () => console.log('Dynamic fields saved', dynamicPayload),
      error: (err) => console.error('Dynamic fields save failed', err),
    });
  }

  // ================= UPDATE COMPANY =================
  update(id: number): void {
    if (this.companyForm.invalid) return;

    // 1️⃣ Merge company form + dynamic fields
    const dynamicPayload =
      this.fields?.map((f) => ({
        fieldId: f.fieldId,
        value: this.dynamicFieldsForm.get(f.fieldName)?.value || '',
      })) || [];

    const payload = {
      ...this.companyForm.getRawValue(),
      dynamicFields: dynamicPayload,
      updatedBy: this.authService.getLoginId() || '',
    };

    this.api
      .updateTnxx(payload, `company/update/${this.storeCompany.companyId}`)
      .subscribe({
        next: (res) => {
          console.log('Company updated:', res);
          Swal.fire('Updated!', 'Company updated successfully', 'success');
        },
        error: (err) => {
          console.error('Company update failed', err);
          Swal.fire('Error', 'Company update failed', 'error');
        },
      });
  }
  // ================= WORKFLOW =================
  submit(): void {
    if (!this.storeCompany?.companyId) return;
    const payload = this.authService.getSubmitPayload();
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to submit this company?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Submit',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Submitting...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        this.api
          .setTnxByStatus(payload, this.storeCompany.companyId, 'company')
          .subscribe({
            next: () => {
              Swal.fire(
                'Submitted!',
                'Company submitted successfully',
                'success',
              ).then(() =>
                this.router.navigate(['/admin/company-inquiry'], {
                  queryParams: { tabName: 'submitted' },
                }),
              );
            },
            error: (err) => {
              console.error('Submit failed', err);
              Swal.fire('Error', 'Failed to submit company', 'error');
            },
          });
      }
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

      this.api.setTnxByStatus(payload, id, 'company').subscribe({
        next: (res: any) => {
          console.log('Reject successful:', res);

          Swal.fire(
            'Rejected!',
            res?.message || 'Company rejected successfully',
            'success',
          ).then(() => {
            this.router.navigate(['/admin/company-inquiry'], {
              queryParams: {
                tabName: 'draft',
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

  approve(companyId: String): void {
    if (!this.storeCompany?.companyId) return;
    const payload = this.authService.getApprovePayload();
    Swal.fire({}).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Approving...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        this.api
          .setTnxByStatus(payload, this.storeCompany.companyId, 'company')
          .subscribe({
            next: () => {
              Swal.fire(
                'Approved!',
                'Company approved successfully',
                'success',
              ).then(() =>
                this.router.navigate(['/admin/company-inquiry'], {
                  queryParams: { tabName: 'approved' },
                }),
              );
            },
            error: (err) => {
              console.error('Approve failed', err);
              Swal.fire('Error', 'Failed to approve company', 'error');
            },
          });
      }
    });
  }

  // ================= AMEND COMPANY =================
  amend(id: String): void {
    if (!id) return;

    const payload = this.authService.getAmendPayload();

    console.log('🚀 Approve clicked with ID:', id);
    console.log('📦 Approve Payload:', payload);

    this.api
      .setTnxByStatus(payload, this.storeCompany.companyId, 'company')
      .subscribe({
        next: (res: any) => {
          console.log('✅ transaction amended successfully', res);

          Swal.fire(
            'AMEND!',
            res?.message || 'Company Amended successfully',
            'success',
          ).then(() => {
            this.router.navigate(['/admin/company-list'], {
              queryParams: {
                tabName: 'Draft',
              },
            });
          });
        },

        error: (err: any) => {
          console.log('❌ Approve API Error:', err);
          console.log('❌ Error Body:', err?.error);
          console.log('❌ Error Message:', err?.message);

          Swal.fire('Error', err?.error?.message || 'Approve failed', 'error');
        },
      });
  }
  // ================= UI HELPERS =================
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
    this.companyForm.reset();
  }

  isReadOnly(): boolean {
    return this.storeCompany?.recordStatus === 'A';
  }

  // ================= PREVIOUS VALUES =================
  // =====================================================
  // REJECTED CUSTOMER
  // =====================================================

  storeRejectedCompany: any | null = null;

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

  private readonly companyFields = [
    'companyId',
    'companyName',
    'companyAddress',
    'companyStatus',
    'companyType',
  ];

  // =====================================================
  // COMPARE COMPANY GENERAL DETAILS
  // =====================================================

  private compareCompanyData(): void {
    this.previousValues = this.comparisonService.compare(
      this.storeCompany,
      this.storeRejectedCompany,
      this.companyFields,
    );

    console.log('Previous company values:', this.previousValues);
  }

  // =====================================================
  // COMPARE DYNAMIC FIELDS
  // =====================================================

  private compareCompanyDynamicFields(): void {
    // Clear old values first
    this.previousDynamicValues = {};

    if (
      !this.storeCompany?.dynamicFields ||
      !this.storeRejectedCompany?.dynamicFields
    ) {
      return;
    }

    this.previousDynamicValues = this.comparisonService.compareDynamicFields(
      this.storeCompany.dynamicFields,
      this.storeRejectedCompany.dynamicFields,
    );

    console.log('Previous dynamic values:', this.previousDynamicValues);
  }

  // =====================================================
  // CHECK PREVIOUS COMPANY VALUE
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
  // GET PREVIOUS COMPANY VALUE
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
