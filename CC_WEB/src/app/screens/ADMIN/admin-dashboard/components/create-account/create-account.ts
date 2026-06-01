import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
import { MatNativeDateModule } from '@angular/material/core'; // or MatMomentDateModule if using Moment

import Swal from 'sweetalert2';
import { ApiService } from '../../../../../core/services/api.service';
@Component({
  selector: 'app-customer-profile',
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
    MatButtonModule,

    
  ],
  templateUrl: './create-account.html',
  styleUrls: ['./create-account.scss']
})
export class Accounts implements OnInit {

  AccountsForm!: FormGroup;
  storeAccounts: any = {};
  allCompanies : any = {};
  approvedAccountTypes:any [] = []
  isEditMode = false;
  isOpen = true;
  private accountLoaded = false;
private fieldsLoaded = false;

  // dynamicFIelds

  fields: any[] = [];
dynamicFieldsForm!: FormGroup;
isDynamicFieldsOpen = true;
dynamicReady = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadAccounts();
    this.loadCompanies();
    this.loadApprovedAccountTypes()
      this.loadDynamicFields(); //
  }

  private buildForm(): void {
    this.AccountsForm = this.fb.group({
     
       accountNo: ['', Validators.required],
    iban: ['', Validators.required],
    accountType: ['', Validators.required],
    accountTitle: ['', Validators.required],
    accountStatus: ['', Validators.required],
    companyId:['',Validators.required]
    });
  }

 
  loadApprovedAccountTypes() {
    this.api.getTnxByStatus('A','AccountMaster').subscribe({
      next: res => {
        this.approvedAccountTypes = res;
        console.log("approved AccountTypes",this.approvedAccountTypes)
      },
      error: err => console.error('Error fetching approved AccountTypes', err)
    });
  }

 private loadAccounts(): void {
  const id = Number(this.route.snapshot.paramMap.get('id'));

  console.log('Loading Accounts with ID:', id);

  if (!isNaN(id)) {
    this.isEditMode = true;

    this.api.getTnxById(id, "accounts").subscribe({
      next: res => {

        this.storeAccounts = res;

        this.AccountsForm.patchValue(res);

        this.accountLoaded = true;

        this.tryPatchDynamicFields(); // 🔥 FIX

      },
      error: err => console.error('Load failed', err)
    });
  }
}
  private patchDynamicFields(dynamicFields: any[]): void {

  if (!this.dynamicFieldsForm || !this.fields?.length || !dynamicFields?.length) return;

  dynamicFields.forEach(df => {

    const fieldDef = this.fields.find(f => f.fieldId === df.fieldId);

    if (fieldDef) {
      this.dynamicFieldsForm
        .get(fieldDef.fieldName)
        ?.setValue(df.value);
    }

  });
}

  
  private loadCompanies(): void {
  this.api.getTnxByStatus('A',"company").subscribe({
    next: companies => {

      this.allCompanies = companies;

      console.log('Fetched companies:', this.allCompanies);

      // 🔥 repatch in edit mode
      if (this.storeAccounts?.companyId) {

        const selectedCompany = this.allCompanies.find(
          (c:any) => c.companyId === this.storeAccounts.companyId
        );

        if (selectedCompany) {

          this.AccountsForm.patchValue({
            companyId: selectedCompany.id
          });

        }
      }
    },
    error: err => console.error('Error fetching companies', err)
  });
}
  // ---------------- CREATE ----------------
 onSave(): void {

  if (this.AccountsForm.invalid || this.dynamicFieldsForm.invalid) return;

  const dynamicPayload = this.fields.map(f => ({
    fieldId: f.fieldId,
    value: this.dynamicFieldsForm.get(f.fieldName)?.value || ''
  }));

  const payload = {
    ...this.AccountsForm.getRawValue(),
    dynamicFields: dynamicPayload
  };

  this.api.saveTnx(payload, 'accounts').subscribe({
    next: res => {
      Swal.fire('Saved!', 'Accounts saved successfully', 'success')
        .then(() => this.router.navigate(['/admin/accounts-list']));
    },
    error: err => console.error('Save failed', err)
  });
}
  // ---------------- UPDATE ----------------
 update(id: number): void {

  if (this.AccountsForm.invalid) return;

  const dynamicPayload = this.fields.map(f => ({
    fieldId: f.fieldId,
    value: this.dynamicFieldsForm?.get(f.fieldName)?.value || ''
  }));

  const payload = {
    ...this.AccountsForm.getRawValue(),
    dynamicFields: dynamicPayload
  };
 console.log("payload to update " ,payload)
   
  this.api.updateTnx(payload, 'accounts', id).subscribe({
    
    next: () => {
      Swal.fire('Updated!', 'Accounts updated successfully', 'success')
        .then(() => this.router.navigate(['/admin/edit-accounts', id]));
    },
    error: err => console.error('Update failed', err)
  });
}
  
  activate(id: number): void {
    this.api.setTnxByStatus('Active', id, 'accounts').subscribe({
      next: () => {
        Swal.fire('Activated!', 'Accounts is now Active', 'success')
          .then(() => this.loadAccounts());
      },
      error: err => console.error('Activate failed', err)
    });
  }

  deactivate(id: number): void {
    this.api.setTnxByStatus('Inactive', id, 'accounts').subscribe({
      next: () => {
        Swal.fire('Deactivated!', 'Accounts is now Inactive', 'success')
          .then(() => this.loadAccounts());
      },
      error: err => console.error('Deactivate failed', err)
    });
  }

  // ---------------- UI HELPERS ----------------
 isReadOnly(): boolean {
  // New customer (no storeCustomer) → editable
  if (this.storeAccounts?.id) return false;{
    return true;
  }

  // Existing customer:
  // - Draft (D) → editable
  // - Submitted (S), Approved (A) → read-only
  return false;
}



  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  onBack(): void {
    this.location.back();
  }

  onCancel(): void {
    this.AccountsForm.reset();
  }
  submit() {    
    if (!this.storeAccounts?.id) return;
    this.api.setTnxByStatus('S', this.storeAccounts.id, 'accounts').subscribe({
      next: (res) => {
        console.log('Submited response:', res);
        Swal.fire('Submitted!', 'Accounts submitted successfully', 'success')
          .then(() => this.router.navigate(['/admin/accounts-inquiry', this.storeAccounts.id],{ queryParams: { tabName: 'submitted' } }));
      },  
      error: err => console.error('Submit failed', err)
    });
  }

 


  reject(id:number): void { 
    if (!this.storeAccounts?.id) return;
    this.api.setTnxByStatus('I', this.storeAccounts.id, 'accounts').subscribe({
      next: () => {
        Swal.fire('Rejected!', 'Accounts rejected successfully', 'success')
          .then(() => this.router.navigate(['/admin/accounts-inquiry', this.storeAccounts.id],{ queryParams: { tabName: 'Rejected' } }));
      },
      error: err => console.error('Reject failed', err)
    });
  } 

  approve(id: number): void {
  if (!this.storeAccounts?.id) return;

  this.api.setTnxByStatus('A', this.storeAccounts.id, 'accounts').subscribe({
    next: () => {
      Swal.fire('Approved!', 'Accounts approved successfully', 'success')
        .then(() => 
          this.router.navigate(['/admin/accounts-inquiry', this.storeAccounts.id], { queryParams: { tabName: 'approved' } })
        );
    },
    error: err => console.error('Approve failed', err)
  });
}

// delete an account
deleteAccount(id: number): void {

  if (!id) {
    Swal.fire('Warning', 'Invalid account id', 'warning');
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {

    if (!result.isConfirmed) return;

    this.api.deleteAccount(id, 'accounts').subscribe({

      // ✅ SUCCESS
      next: (res) => {
        console.log("delete account response ", res)
        Swal.fire(
          'Deleted',
          'Account removed successfully',
          'success'
        ).then(() => {

          // 🔥 get dynamic custId from selected account
          const custId = this.storeAccounts?.custId;

          console.log('Redirecting with custId:', custId);

          if (custId) {

            this.router.navigate([
              '/admin/create-customer',
              custId
            ]);

          } else {

            // fallback if custId missing
            this.router.navigate([
              '/admin/create-customer',
              this.storeAccounts.custId
            ]);

          }

        });

      },

      // ❌ ERROR
      error: (err) => {

        console.log('DELETE ERROR:', err);

        Swal.fire(
          'Error',
          err?.error?.message ||
          err?.message ||
          'Failed to delete account',
          'error'
        );

      }

    });

  });
}
// dynamicFields methods 

private loadDynamicFields(): void {

  this.api.getFieldsByScreenAndStatus('Accounts', 'A').subscribe({
    next: (res: any) => {

      this.fields = res || [];

      const group: any = {};

      this.fields.forEach((f: any) => {
        group[f.fieldName] = [''];
      });

      this.dynamicFieldsForm = this.fb.group(group);

      this.fieldsLoaded = true;

      this.tryPatchDynamicFields(); // 🔥 FIX

    },
    error: err => console.error('Dynamic fields error', err)
  });

}
private tryPatchDynamicFields(): void {

  if (!this.accountLoaded || !this.fieldsLoaded) return;

  const dynamicFields = this.storeAccounts?.dynamicFields;

  if (!dynamicFields || !dynamicFields.length) return;

  dynamicFields.forEach((df:any) => {

    const fieldDef = this.fields.find(f => f.fieldId === df.fieldId);

    if (fieldDef) {

      this.dynamicFieldsForm
        .get(fieldDef.fieldName)
        ?.setValue(df.value);

    }

  });

  this.dynamicReady = true;
}
}
