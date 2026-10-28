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
import { TransactionComparisonService } from '../../../../../core/services/admin-service/transaction-comparison.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { ApiService } from '../../../../../core/services/api.service';
import { MatCard } from '@angular/material/card';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-Permission-profile',
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
  templateUrl: './permission-master.html',
  styleUrls: ['./permission-master.scss'],
})
export class PermissionMaster implements OnInit {
  permissionForm!: FormGroup;

  storePermission: any = {};
  storeDynamicFieldsResponse: any[] = [];

  fields: any[] = [];

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
    this.loadPermission();
    this.loadDynamicFields();
  }

  // ============================================================
  // FORM
  // ===========================================================

  private buildForm(): void {
    this.permissionForm = this.fb.group({
      permissionId: ['', Validators.required],
      permissionName: ['', Validators.required],
      moduleName: ['', Validators.required],
      description: [''],
      permissionStatus: ['A', Validators.required],
      createdBy: [this.authService.getLoginId() || ''],
    });
  }

  // ============================================================
  // DYNAMIC FIELDS
  // ============================================================

  private loadDynamicFields(): void {
    this.api.getFieldsByScreenAndStatus('PermissionMaster', 'A').subscribe({
      next: (res: any) => {
        this.fields = this.removeDuplicateFields(res || []);

        this.fields.forEach((field: any) => {
          const controlName = this.getDynamicControlName(field);

          if (!controlName || this.permissionForm.contains(controlName)) {
            return;
          }

          const validators =
            field.required || field.mandatory || field.isRequired
              ? [Validators.required]
              : [];

          this.permissionForm.addControl(
            controlName,
            this.fb.control(field.defaultValue ?? '', validators),
          );
        });

        this.patchDynamicValues();
      },

      error: (err: any) => {
        console.error('Permission dynamic fields load failed', err);
      },
    });
  }

  private removeDuplicateFields(fields: any[]): any[] {
    const map = new Map<string, any>();

    fields.forEach((field: any) => {
      if (field?.fieldId != null) {
        map.set(String(field.fieldId), field);
      }
    });

    return Array.from(map.values());
  }

  /*
   * IMPORTANT:
   * fieldId is used as the Angular control name.
   * This prevents two dynamic fields with the same
   * fieldName from sharing one FormControl.
   */
  getDynamicControlName(field: any): string {
    return String(field?.fieldId ?? '');
  }

  // ============================================================
  // LOAD PERMISSION
  // ============================================================

  private loadPermission(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.isEditMode = true;

    this.api.getTnxById(id, 'Permissions').subscribe({
      next: (res: any) => {
        this.storePermission = res;
        this.storeDynamicFieldsResponse = res.dynamicFields || [];

        this.permissionForm.patchValue({
          permissionId: res.permissionId,
          permissionName: res.permissionName,
          moduleName: res.moduleName,
          description: res.description,
          permissionStatus: res.permissionStatus,
          createdBy: res.createdBy,
        });

        this.patchDynamicValues();

        if (res.recordStatus === 'S' || res.recordStatus === 'A') {
          this.api.getRejectedTransaction(id, 'Permissions').subscribe({
            next: (rejectedRes: any) => {
              this.rejectedPermission = rejectedRes;
              console.log(
                'Rejected permission response:',
                this.rejectedPermission,
              );
              this.comparePermissionData();
              this.comparePermissionDynamicFields();
              this.permissionForm.disable();
            },
            error: (error) => {
              console.error(
                'Failed to load rejected permission transaction',
                error,
              );
            },
          });
        }
      },

      error: (err: any) => {
        console.error('Permission load failed', err);
        Swal.fire('Error', this.getBackendMessage(err), 'error');
      },
    });
  }

  // ============================================================
  // CURRENT DYNAMIC VALUES
  // ============================================================

  private patchDynamicValues(): void {
    if (!this.fields.length || !this.storeDynamicFieldsResponse.length) {
      return;
    }

    this.storeDynamicFieldsResponse.forEach((saved: any) => {
      const field = this.fields.find(
        (item: any) => String(item.fieldId) === String(saved.fieldId),
      );

      if (field) {
        this.permissionForm
          .get(this.getDynamicControlName(field))
          ?.setValue(saved.value ?? '');
      }
    });
  }

  getDynamicFieldValue(fieldId: any): any {
    return (
      this.storePermission?.dynamicFields?.find(
        (item: any) => String(item?.fieldId) === String(fieldId),
      )?.value ?? ''
    );
  }

  // ============================================================
  // PREVIOUS VALUES
  // ============================================================

  // ============================================================
  // PAYLOAD
  // ============================================================

  private buildDynamicFieldsPayload(): any[] {
    const formValue = this.permissionForm.getRawValue();

    return this.fields.map((field: any) => ({
      fieldId: field.fieldId,
      value: formValue[this.getDynamicControlName(field)] ?? '',
    }));
  }

  private buildPayload(): any {
    return {
      ...this.permissionForm.getRawValue(),
      dynamicFields: this.buildDynamicFieldsPayload(),
    };
  }

  // ============================================================
  // SAVE
  // ============================================================

  onSave(): void {
    if (this.permissionForm.invalid) {
      this.permissionForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();

    console.log('Permission save payload:', payload);

    this.api.saveTnx(payload, 'Permissions').subscribe({
      next: () => {
        Swal.fire('Saved!', 'Permission saved successfully', 'success').then(
          () => this.router.navigate(['/admin/permission-master-inquiry']),
        );
      },

      error: (err: any) => {
        console.error('Permission save failed', err);
        Swal.fire('Error', this.getBackendMessage(err), 'error');
      },
    });
  }

  // ============================================================
  // UPDATE
  // ============================================================

  update(id: number): void {
    if (this.permissionForm.invalid) {
      this.permissionForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.buildPayload(),
      updatedBy: this.authService.getLoginId() || '',
    };

    console.log('Permission update payload:', payload);

    this.api.updateTnx(payload, 'Permissions', id).subscribe({
      next: () => {
        Swal.fire(
          'Updated!',
          'Permission updated successfully',
          'success',
        ).then(() =>
          this.router.navigate(['/admin/permission-master-inquiry']),
        );
      },

      error: (err: any) => {
        console.error('Permission update failed', err);
        Swal.fire('Error', this.getBackendMessage(err), 'error');
      },
    });
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  submit(): void {
    const id = this.storePermission?.permissionId;

    if (!id) {
      return;
    }

    const payload = this.authService.getSubmitPayload();

    this.api.setTnxByStatus(payload, id, 'Permissions').subscribe({
      next: () => {
        Swal.fire(
          'Submitted!',
          'Permission submitted successfully',
          'success',
        ).then(() =>
          this.router.navigate(['/admin/permission-master-inquiry'], {
            queryParams: { tabName: 'submitted' },
          }),
        );
      },

      error: (err: any) => {
        console.error('Submit failed', err);
        Swal.fire('Error', this.getBackendMessage(err), 'error');
      },
    });
  }

  // ============================================================
  // REJECT
  // ============================================================

  reject(id: number): void {
    if (!id) {
      return;
    }

    Swal.fire({
      title: 'Reject Transaction',
      input: 'textarea',
      inputLabel: 'Reject Reason',
      inputPlaceholder: 'Please enter the reason for rejection...',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',

      preConfirm: (reason) => {
        if (!reason?.trim()) {
          Swal.showValidationMessage('Reject reason is required');
          return false;
        }

        return reason.trim();
      },
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      const payload = this.authService.getRejectPayload(result.value);

      this.api.setTnxByStatus(payload, id, 'Permissions').subscribe({
        next: (res: any) => {
          Swal.fire(
            'Rejected!',
            res?.message || 'Permission rejected successfully',
            'success',
          ).then(() =>
            this.router.navigate(['/admin/permission-master-inquiry'], {
              queryParams: { tabName: 'rejected' },
            }),
          );
        },

        error: (err: any) => {
          console.error('Reject failed', err);
          Swal.fire('Error', this.getBackendMessage(err), 'error');
        },
      });
    });
  }

  // ============================================================
  // APPROVE
  // ============================================================

  approve(): void {
    const id = this.storePermission?.permissionId;

    if (!id) {
      return;
    }

    const payload = this.authService.getApprovePayload();

    this.api.setTnxByStatus(payload, id, 'Permissions').subscribe({
      next: () => {
        Swal.fire(
          'Approved!',
          'Permission approved successfully',
          'success',
        ).then(() =>
          this.router.navigate(['/admin/permission-master-inquiry'], {
            queryParams: { tabName: 'approved' },
          }),
        );
      },

      error: (err: any) => {
        console.error('Approve failed', err);
        Swal.fire('Error', this.getBackendMessage(err), 'error');
      },
    });
  }

  // ============================================================
  // AMEND
  // ============================================================

  amend(id: number): void {
    if (!this.storePermission?.permissionId) {
      return;
    }

    const payload = this.authService.getAmendPayload();

    this.api
      .setTnxByStatus(payload, this.storePermission.permissionId, 'Permissions')
      .subscribe({
        next: () => {
          Swal.fire(
            'Amended!',
            'Permission moved to Draft for amendment',
            'success',
          ).then(() =>
            this.router.navigate(['/admin/permission-master-inquiry'], {
              queryParams: { tabName: 'draft' },
            }),
          );
        },

        error: (err: any) => {
          console.error('Amend failed', err);
          Swal.fire('Error', this.getBackendMessage(err), 'error');
        },
      });
  }

  // ============================================================
  // READ ONLY / TOGGLE
  // ============================================================

  isReadOnly(): boolean {
    return (
      this.storePermission?.recordStatus === 'S' ||
      this.storePermission?.recordStatus === 'A'
    );
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  toggleDynamicFields(): void {
    this.isDynamicFieldsOpen = !this.isDynamicFieldsOpen;
  }

  // ============================================================
  // BACK / CANCEL
  // ============================================================

  onBack(): void {
    this.location.back();
  }

  onCancel(): void {
    this.permissionForm.reset({
      permissionId: '',
      permissionName: '',
      moduleName: '',
      description: '',
      permissionStatus: 'A',
      createdBy: this.authService.getLoginId() || '',
    });

    this.previousValues = {};
    this.previousDynamicValues = {};
    this.storePermission = {};
    this.storeDynamicFieldsResponse = [];
    this.isEditMode = false;
  }

  // ============================================================
  // ERROR MESSAGE
  // ============================================================

  private getBackendMessage(err: any): string {
    return (
      err?.error?.message ||
      (typeof err?.error === 'string' ? err.error : err?.message) ||
      'An unexpected error occurred'
    );
  }

  // =====================================================
  // REJECTED CUSTOMER
  // =====================================================

  rejectedPermission: any | null = null;

  // =====================================================
  // PREVIOUS NORMAL PERMISSION VALUES
  // =====================================================

  previousValues: { [key: string]: any } = {};

  // =====================================================
  // PREVIOUS DYNAMIC FIELD VALUES
  // =====================================================

  previousDynamicValues: { [key: string]: any } = {};

  // =====================================================
  // PERMISSION GENERAL DETAILS FIELDS
  // =====================================================

  private readonly permissionFields = [
    'permissionId',
    'permissionName',
    'moduleName',
    'description',
    'permissionStatus',
    'createdBy',
  ];

  // =====================================================
  // COMPARE PERMISSION GENERAL DETAILS
  // =====================================================

  private comparePermissionData(): void {
    this.previousValues = this.comparisonService.compare(
      this.storePermission,
      this.rejectedPermission,
      this.permissionFields,
    );

    console.log('Previous permission values:', this.previousValues);
  }

  // =====================================================
  // COMPARE DYNAMIC FIELDS
  // =====================================================

  private comparePermissionDynamicFields(): void {
    // Clear old values first
    this.previousDynamicValues = {};

    if (!this.storePermission?.dynamicFields || !this.previousDynamicValues) {
      return;
    }

    this.previousDynamicValues = this.comparisonService.compareDynamicFields(
      this.storePermission.dynamicFields,
      this.rejectedPermission?.dynamicFields || [],
    );

    console.log('Previous dynamic values:', this.previousDynamicValues);
  }

  // =====================================================
  // CHECK PREVIOUS PERMISSION VALUE
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
  // GET PREVIOUS PERMISSION VALUE
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
}
