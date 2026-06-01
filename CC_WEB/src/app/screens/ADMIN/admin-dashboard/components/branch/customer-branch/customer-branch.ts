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
import { MatCard } from '@angular/material/card';

import Swal from 'sweetalert2';
import { ApiService } from '../../../../../../core/services/api.service';

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
    MatCard
  ],
  templateUrl: './customer-branch.html',
  styleUrls: ['./customer-branch.scss']
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
    private location: Location
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
      contactNo: ['']
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
        console.log("storeBranch", this.storeBranch);
        this.storeDynamicFieldsResponse = res.dynamicFields || [];
        this.branchForm.patchValue(res);
        this.patchDynamicValues();
      },
      error: (err: any) => console.error('Load failed', err)
    });
  }

  // ================= LOAD DYNAMIC FIELDS =================
  private loadDynamicFields(): void {
    this.api.getFieldsByScreenAndStatus('branch', 'A').subscribe({
      next: (res: any) => {
        console.log('Branch Dynamic Fields:', res);
        this.fields = res;

        const group: any = {};
        this.fields.forEach((f: any) => {
          group[f.fieldName] = [''];
        });

        this.dynamicFieldsForm = this.fb.group(group);
        this.patchDynamicValues();
      },
      error: (err: any) => console.error('Dynamic field load failed', err)
    });
  }

  // ================= PATCH DYNAMIC =================
  private patchDynamicValues(): void {
    if (!this.dynamicFieldsForm || !this.fields?.length || !this.storeDynamicFieldsResponse?.length) return;

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
  const dynamicPayload = this.fields?.map(f => ({
     // Use existing ID or 0 for new
     branchId: this.branchForm.value.branchId || 0,
    fieldId: f.fieldId,
    value: this.dynamicFieldsForm.get(f.fieldName)?.value || ''
  })) || [];

  // 🔹 Create FULL payload (matches BranchMasterRequestDto)
  const branchPayload = {
    ...this.branchForm.getRawValue(),
    dynamicFields: dynamicPayload,
    createdOn: new Date().toISOString().split('.')[0]
  };

  console.log('Sending DTO payload:', branchPayload);

  // 🔹 SINGLE API CALL
  this.api.saveTnx(branchPayload, 'branch').subscribe({
    next: (res: any) => {
      console.log('Branch + Dynamic saved:', res);

      Swal.fire('Saved!', 'Branch saved successfully', 'success')
        .then(() => {
          this.router.navigate(['/admin/branch-list'], {
            queryParams: { tabName: 'Draft' }
          });
        });
    },
    error: (err: any) => {
      console.error('Save failed', err);
      Swal.fire('Error', 'Branch save failed', 'error');
    }
  });
}
  // ================= UPDATE =================
 // ---------------- UPDATE ----------------
update(id:number): void {

  if (this.branchForm.invalid) return;

  const branchId = this.branchForm.value.branchId;

  const dynamicPayload = this.fields?.map(f => ({
    fieldId: f.fieldId,
    value: this.dynamicFieldsForm.get(f.fieldName)?.value || ''
  })) || [];

  const branchPayload = {
    ...this.branchForm.getRawValue(),
    dynamicFields: dynamicPayload,
    updatedOn: new Date().toISOString().split('.')[0]
  };

  console.log('Payload to update:', branchPayload);

  this.api.updateTnxx(branchPayload, `branch/update/${branchId}`).subscribe({

    next: () => {

      Swal.fire(
        'Updated!',
        'Branch and Additional Fields updated successfully',
        'success'
      );

      console.log('Branch updated successfully');
    },

    error: err => {
      console.error('Branch update failed', err);
    }

  });

}
  // ================= WORKFLOW =================
  submit(): void {
    if (!this.storeBranch?.id) return;

    this.api.setTnxByStatus('S', this.storeBranch.id, 'branch').subscribe({
      next: () =>
        Swal.fire('Submitted!', 'Branch submitted successfully', 'success')
          .then(() =>
            this.router.navigate(['/admin/branch-list'], {
              queryParams: { tabName: 'submitted' }
            })
          )
    });
  }

  reject(id: number): void {
    this.api.setTnxByStatus('I', id, 'branch').subscribe({
      next: () =>
        Swal.fire('Rejected!', 'Branch rejected successfully', 'success')
          .then(() =>
            this.router.navigate(['/admin/branch-list'], {
              queryParams: { tabName: 'Rejected' }
            })
          )
    });
  }

  approve(id: number): void {
    this.api.setTnxByStatus('A', id, 'branch').subscribe({
      next: () =>
        Swal.fire('Approved!', 'Branch approved successfully', 'success')
          .then(() =>
            this.router.navigate(['/admin/branch-list'], {
              queryParams: { tabName: 'approved' }
            })
          )
    });
  }

  // ================= UTIL =================
  getAllCities(): void {
    this.api.getTnxByStatus('A', 'city/getApprovedCities').subscribe({
      next: res => this.storeCities = res,
      error: err => console.error('Failed to load cities', err)
    });
  }

  toggle(): void { this.isOpen = !this.isOpen; }
  toggleDynamicFields(): void { this.isDynamicFieldsOpen = !this.isDynamicFieldsOpen; }

  onBack(): void { this.location.back(); }
  onCancel(): void {
    this.branchForm.reset();
    this.dynamicFieldsForm?.reset();
  }

  isReadOnly(): boolean {
    return this.storeBranch?.recordStatus === 'A';
  }
}