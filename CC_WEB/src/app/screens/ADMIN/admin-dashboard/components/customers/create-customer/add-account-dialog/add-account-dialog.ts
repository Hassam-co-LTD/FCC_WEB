import { Component, OnInit, inject } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  MatDialogRef,
  MatDialogActions,
  MatDialogContent,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { CommonModule } from '@angular/common';

import { ApiService } from '../../../../../../../core/services/api.service';

import Swal from 'sweetalert2';

import { Router } from '@angular/router';

import { AuthService } from '../../../../../../../core/services/auth.service';

@Component({
  selector: 'app-add-account-dialog',
  templateUrl: './add-account-dialog.html',
  styleUrls: ['./add-account-dialog.scss'],
  standalone: true,

  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    ReactiveFormsModule,
    MatIcon,
  ],
})
export class AddAccountDialog implements OnInit {
  // ================= DEPENDENCIES =================

  private fb = inject(FormBuilder);

  private api = inject(ApiService);

  private dialogRef = inject(MatDialogRef<AddAccountDialog>);

  private authService = inject(AuthService);

  private router = inject(Router);

  public data = inject(MAT_DIALOG_DATA);

  // ================= VARIABLES =================

  AccountsForm!: FormGroup;

  dynamicFieldsForm!: FormGroup;

  isOpen = true;

  isDynamicFieldsOpen = true;

  customerName: string = '';

  approvedAccountTypes: any[] = [];

  allCompanies: any[] = [];

  fields: any[] = [];

  storeDynamicFields: any[] = [];

  // ================= INIT =================

  ngOnInit(): void {
    this.buildForm();

    // IMPORTANT FIRST
    this.loadDynamicFields();

    this.loadCompanies();

    this.loadApprovedAccountTypes();
  }

  // ================= MAIN FORM =================

  private buildForm(): void {
    this.AccountsForm = this.fb.group({
      accountNo: ['', Validators.required],

      iban: ['', Validators.required],

      accountType: ['', Validators.required],

      accountTitle: ['', Validators.required],

      accountStatus: ['A', Validators.required],

      companyId: ['', Validators.required],

      custId: [this.data?.customerId || '', Validators.required],

      createdBy: [this.authService.getLoginId()],
    });

    // SAFE INITIALIZATION
    // Prevents NG01052 when dynamic fields
    // are loaded asynchronously.

    this.dynamicFieldsForm = this.fb.group({});
  }

  // ================= LOAD DYNAMIC FIELDS =================

  private loadDynamicFields(): void {
    this.api.getFieldsByScreenAndStatus('Accounts', 'A').subscribe({
      next: (res: any) => {
        this.fields = res || [];

        const group: any = {};

        this.fields.forEach((f: any) => {
          group[f.fieldName] = [''];
        });

        this.dynamicFieldsForm = this.fb.group(group);
      },

      error: (err: any) => {
        console.error('Dynamic fields error', err);
      },
    });
  }

  // ================= SAVE =================

  onSave(): void {
    if (this.AccountsForm.invalid || this.dynamicFieldsForm.invalid) {
      this.AccountsForm.markAllAsTouched();

      this.dynamicFieldsForm.markAllAsTouched();

      return;
    }

    // Convert dynamic fields into API payload

    const dynamicPayload = this.fields.map((f: any) => ({
      fieldId: f.fieldId,

      value: this.dynamicFieldsForm.get(f.fieldName)?.value || '',

      // accountId:
      //   this.AccountsForm.value.accountNo
    }));

    const payload = {
      ...this.AccountsForm.getRawValue(),

      dynamicFields: dynamicPayload,
    };

    console.log('FINAL ACCOUNT PAYLOAD:', payload);

    this.api.saveTnx(payload, 'accounts').subscribe({
      next: (res: any) => {
        Swal.fire('Saved!', 'Account added successfully', 'success');

        console.log('The response back:', res);

        this.dialogRef.close(res);
      },

      error: (err: any) => {
        console.error('Error saving account:', err?.error);

        Swal.fire('Error', 'Failed to add account', 'error');
      },
    });
  }

  // ================= ACCOUNT TYPES =================

  loadApprovedAccountTypes(): void {
    this.api.getTnxByStatus('A', 'AccountMaster').subscribe({
      next: (res: any) => {
        this.approvedAccountTypes = res || [];
      },

      error: (err: any) => {
        console.error('Account types error:', err);
      },
    });
  }

  // ================= COMPANIES =================

  private loadCompanies(): void {
    this.api.getTnxByStatus('A', 'company').subscribe({
      next: (res: any) => {
        this.allCompanies = res || [];
      },

      error: (err: any) => {
        console.error('Companies error:', err);
      },
    });
  }

  // ================= UI =================

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  toggleDynamicFields(): void {
    this.isDynamicFieldsOpen = !this.isDynamicFieldsOpen;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // ================= CUSTOMER FILE IMPORT =================

  onAccountFileSelected(event: any): void {
    const file = event?.target?.files?.[0];

    console.log('Account file selected:', file);

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.api.importCustomers(formData, 'accounts').subscribe({
      next: (response: any) => {
        console.log('Account Import Response:', response);

        const totalRecords = response?.totalRecords ?? 0;
        const successRecords = response?.successRecords ?? 0;
        const failedRecords = response?.failedRecords ?? 0;

        let message = `
Total Records: ${totalRecords}
Success: ${successRecords}
Failed: ${failedRecords}
`;

        const errors = response?.errorMessages ?? [];

        if (errors.length > 0) {
          message += '\n\nErrors:\n';

          errors.forEach((error: any) => {
            message += `\n• ${error}`;
          });
        }

        Swal.fire({
          title:
            failedRecords > 0
              ? 'Import Completed With Errors'
              : 'Import Successful',

          text: message,

          icon: failedRecords > 0 ? 'warning' : 'success',
        }).then(() => {
          // Change this route if accounts have their own list screen
          this.router.navigate(['/admin/customer-list'], {
            queryParams: {
              tabName: 'draft',
            },
          });
        });
      },

      error: (error: any) => {
        console.error('Account Import HTTP Error:', error);

        // Sometimes backend saves the records but still returns
        // an HTTP error response. Try to extract its response body.
        const response = error?.error;

        console.log('Backend Error Response:', response);

        const totalRecords = response?.totalRecords ?? 0;
        const successRecords = response?.successRecords ?? 0;
        const failedRecords = response?.failedRecords ?? 0;

        // If backend actually returned import statistics,
        // show them instead of saying the whole import failed.
        if (
          response &&
          (response.totalRecords !== undefined ||
            response.successRecords !== undefined ||
            response.failedRecords !== undefined)
        ) {
          let message = `
Total Records: ${totalRecords}
Success: ${successRecords}
Failed: ${failedRecords}
`;

          const errors = response?.errorMessages ?? [];

          if (errors.length > 0) {
            message += '\n\nErrors:\n';

            errors.forEach((item: any) => {
              message += `\n• ${item}`;
            });
          }

          Swal.fire({
            title:
              failedRecords > 0
                ? 'Import Completed With Errors'
                : 'Import Successful',

            text: message,

            icon: failedRecords > 0 ? 'warning' : 'success',
          });

          return;
        }

        // Genuine HTTP/backend failure
        Swal.fire(
          'Import Failed',
          response?.message || error?.message || 'Unexpected error occurred',
          'error',
        );
      },
    });
  }
}
