import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import { ApiService } from '../../../../../../../core/services/api.service';
import Swal from 'sweetalert2';

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
    MatIcon
  ]
})
export class AddAccountDialog implements OnInit {

  AccountsForm!: FormGroup;
  dynamicFieldsForm!: FormGroup;

  isOpen = true;
  isDynamicFieldsOpen = true;

  customerName: string;

  approvedAccountTypes: any[] = [];
  allCompanies: any[] = [];

  fields: any[] = [];
  storeDynamicFields: any[] = [];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private dialogRef: MatDialogRef<AddAccountDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.customerName = data.customerName;
  }

  // ================= INIT =================
  ngOnInit(): void {
    this.buildForm();
    this.loadDynamicFields(); // IMPORTANT FIRST
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
      custId: [this.data.customerId, Validators.required]
    });

    // SAFE INIT (prevents NG01052)
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
      error: err => console.error('Dynamic fields error', err)
    });
  }

  // ================= SAVE =================
  onSave(): void {

    if (this.AccountsForm.invalid || this.dynamicFieldsForm.invalid) return;

    const dynamicPayload = this.fields.map(f => ({
      fieldId: f.fieldId,
      value: this.dynamicFieldsForm.get(f.fieldName)?.value || '',
      // accountId:this.AccountsForm.value.accountNo
    }));

    const payload = {
      ...this.AccountsForm.getRawValue(),
      dynamicFields: dynamicPayload
    };

    console.log('FINAL ACCOUNT PAYLOAD:', payload);

    this.api.saveTnx(payload, 'accounts').subscribe({
      next: (res: any) => {

        Swal.fire('Saved!', 'Account added successfully', 'success');
        console.log("the response back ",res)
        this.dialogRef.close(res);
      },
      error: err => {
        console.error('Error saving account:', err.error);
        Swal.fire('Error', 'Failed to add account', 'error');
      }
    });
  }

  // ================= ACCOUNT TYPES =================
  loadApprovedAccountTypes(): void {

    this.api.getTnxByStatus('A', 'AccountMaster').subscribe({
      next: res => {
        this.approvedAccountTypes = res;
      },
      error: err => console.error(err)
    });
  }

  // ================= COMPANIES =================
  private loadCompanies(): void {

    this.api.getTnxByStatus('A', 'company').subscribe({
      next: res => {
        this.allCompanies = res;
      },
      error: err => console.error(err)
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
}