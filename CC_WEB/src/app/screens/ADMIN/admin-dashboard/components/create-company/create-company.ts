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
import { MatNativeDateModule } from '@angular/material/core';

import Swal from 'sweetalert2';
import { ApiService } from '../../../../../core/services/api.service';

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
    MatNativeDateModule
  ],
  templateUrl: './create-company.html',
  styleUrls: ['./create-company.scss']
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
    private location: Location
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
      companyType: ['', Validators.required]
    });
  }

  private buildDynamicForm(): void {
    const group: any = {};
    this.fields.forEach(f => group[f.fieldName] = ['']);
    this.dynamicFieldsForm = this.fb.group(group);
  }

  // ================= LOAD COMPANY =================
  private loadCompany(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.isEditMode = true;
    this.api.getTnxById((id), 'company').subscribe({
      next: (res: any) => {
        this.storeCompany = res;
        console.log('Loaded Company:', this.storeCompany);
        this.storeDynamicFieldsResponse = res.dynamicFields || [];
        this.companyForm.patchValue(res);
        this.patchDynamicValues();
      },
      error: err => console.error('Load failed', err)
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
      error: err => console.error('Dynamic field load failed', err)
    });
  }

  // ================= PATCH DYNAMIC VALUES =================
  private patchDynamicValues(): void {
    if (!this.dynamicFieldsForm  || !this.storeDynamicFieldsResponse.length) return;
    const patch: any = {};
    this.storeDynamicFieldsResponse.forEach(saved => {
      const def = this.fields.find(f => f.fieldId == saved.fieldId);
      if (def) patch[def.fieldName] = saved.value || '';
    });
    this.dynamicFieldsForm.patchValue(patch);
  }

  // ================= SAVE COMPANY =================
  onSave(): void {
  if (this.companyForm.invalid) return;

  // 1️⃣ Merge company form + dynamic fields
  const dynamicPayload = this.fields?.map(f => ({
    fieldId: f.fieldId,
    value: this.dynamicFieldsForm.get(f.fieldName)?.value || '',
    companyId: this.companyForm.get('companyId')?.value || ''
  })) || [];

  const payload = {
    ...this.companyForm.getRawValue(),
    dynamicFields: dynamicPayload
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
    }
  });
}

  // ================= SAVE DYNAMIC FIELDS =================
  private saveDynamicFields(companyId: string): void {
    if (!this.fields.length) return;

    const dynamicPayload = this.fields.map(f => ({
      fieldId: f.fieldId,
      value: this.dynamicFieldsForm.get(f.fieldName)?.value || '',
      companyId: companyId
    }));

    this.api.saveTnx(dynamicPayload, 'company').subscribe({
      next: () => console.log('Dynamic fields saved', dynamicPayload),
      error: err => console.error('Dynamic fields save failed', err)
    });
  }

  // ================= UPDATE COMPANY =================
update(id: number): void {
  if (this.companyForm.invalid) return;

  // 1️⃣ Merge company form + dynamic fields
  const dynamicPayload = this.fields?.map(f => ({
    fieldId: f.fieldId,
    value: this.dynamicFieldsForm.get(f.fieldName)?.value || ''
  })) || [];

  const payload = {
    ...this.companyForm.getRawValue(),
    dynamicFields: dynamicPayload,
    updatedOn: new Date().toISOString().split('.')[0] // YYYY-MM-DDTHH:MM:SS
  };

  this.api.updateTnxx(payload, `company/update/${this.storeCompany.companyId}`).subscribe({
    next: (res) => {
      console.log('Company updated:', res);
      Swal.fire('Updated!', 'Company updated successfully', 'success');
    },
    error: (err) => {
      console.error('Company update failed', err);
      Swal.fire('Error', 'Company update failed', 'error');
    }
  });
}
  // ================= WORKFLOW =================
  submit(): void {
  if (!this.storeCompany?.companyId) return;

  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to submit this company?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Submit',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: 'Submitting...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      this.api.setTnxByStatus('S', this.storeCompany.companyId, 'company').subscribe({
        next: () => {
          Swal.fire('Submitted!', 'Company submitted successfully', 'success')
            .then(() => this.router.navigate(['/admin/company-inquiry'], { queryParams: { tabName: 'submitted' } }));
        },
        error: err => {
          console.error('Submit failed', err);
          Swal.fire('Error', 'Failed to submit company', 'error');
        }
      });
    }
  });
}

reject(storeCompanyId:String): void {
  if (!this.storeCompany?.companyId) return;

  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to reject this company?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Reject',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: 'Rejecting...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      this.api.setTnxByStatus('I', this.storeCompany.companyId, 'company').subscribe({
        next: () => {
          Swal.fire('Rejected!', 'Company rejected successfully', 'success')
            .then(() => this.router.navigate(['/admin/company-inquiry'], { queryParams: { tabName: 'rejected' } }));
        },
        error: err => {
          console.error('Reject failed', err);
          Swal.fire('Error', 'Failed to reject company', 'error');
        }
      });
    }
  });
}

approve(companyId:String): void {
  if (!this.storeCompany?.companyId) return;

  Swal.fire({
   
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: 'Approving...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      this.api.setTnxByStatus('A', this.storeCompany.companyId, 'company').subscribe({
        next: () => {
          Swal.fire('Approved!', 'Company approved successfully', 'success')
            .then(() => this.router.navigate(['/admin/company-inquiry'], { queryParams: { tabName: 'approved' } }));
        },
        error: err => {
          console.error('Approve failed', err);
          Swal.fire('Error', 'Failed to approve company', 'error');
        }
      });
    }
  });
}
  // ================= UI HELPERS =================
  toggle(): void { this.isOpen = !this.isOpen; }
  toggleDynamicFields(): void { this.isDynamicFieldsOpen = !this.isDynamicFieldsOpen; }
  onBack(): void { this.location.back(); }
  onCancel(): void { this.companyForm.reset(); }

  isReadOnly(): boolean { return this.storeCompany?.recordStatus === 'A'; }

}