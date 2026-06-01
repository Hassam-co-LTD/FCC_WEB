import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
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
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'app-account-types',
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
  templateUrl: './create-account-types.html',
  styleUrls: ['./create-account-types.scss']
})
export class CreateAccountTypes implements OnInit {

  accountForm!: FormGroup;
  dynamicFieldsForm!: FormGroup;

  storeAccount: any = {};
  fields: any[] = [];
  storeDynamicFieldsResponse: any[] = [];
  storeCities = [];

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

  // ================= INIT =================
  ngOnInit(): void {
    this.buildForm();
    this.loadDynamicFields();
    this.getAllCities();
  }

  // ================= FORM =================
  private buildForm(): void {
    this.accountForm = this.fb.group({
      typeName: ['', Validators.required],
      description: ['', Validators.required],
      accountStatus: ['A', Validators.required]
    });
  }

  // ================= LOAD DYNAMIC FIELDS =================
  private loadDynamicFields(): void {
    this.api.getFieldsByScreenAndStatus('AccountTypes', 'A').subscribe({
      next: (res: any) => {

        this.fields = res;

        const group: any = {};

        // FIX: use fieldId instead of fieldName
        this.fields.forEach((f: any) => {
          group[f.fieldId] = new FormControl('');
        });

        this.dynamicFieldsForm = this.fb.group(group);

        this.loadAccountMaster();
      },
      error: err => console.error('Dynamic field load failed', err)
    });
  }

  // ================= LOAD MAIN =================
  private loadAccountMaster(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isEditMode = true;

    this.api.getTnxById(id, 'AccountMaster').subscribe({
      next: (res: any) => {

        this.storeAccount = res;
        console.log("accout master loaded ", this.storeAccount)
        this.storeDynamicFieldsResponse = res.dynamicFields || [];
         
        this.accountForm.patchValue(res);

        this.patchDynamicValues();
      },
      error: err => console.error('Load failed', err)
    });
  }

  // ================= PATCH DYNAMIC =================
  private patchDynamicValues(): void {

    if (!this.dynamicFieldsForm || !this.fields.length) return;

    const patch: any = {};

    // FIX: direct mapping using fieldId
    this.storeDynamicFieldsResponse.forEach(saved => {
      patch[saved.fieldId] = saved.value || '';
    });

    this.dynamicFieldsForm.patchValue(patch);
  }

  // ================= SAVE =================
  onSave(): void {

    if (this.accountForm.invalid || this.dynamicFieldsForm.invalid) return;

    const dynamicPayload = this.fields.map(f => ({
      fieldId: f.fieldId,
      value: this.dynamicFieldsForm.get(f.fieldId)?.value || ''
    }));

    const payload = {
      ...this.accountForm.getRawValue(),
      dynamicFields: dynamicPayload
    };

    this.api.saveTnx(payload, 'AccountMaster').subscribe({
      next: () => {
        Swal.fire('Saved!', 'Account Type saved successfully', 'success')
          .then(() => this.router.navigate(['/admin/account-types-inquiry']));
      },
      error: err => Swal.fire('Error', 'Save failed', 'error')
    });
  }

  // ================= UPDATE =================
  update(id: number): void {

    if (this.accountForm.invalid) return;

    const dynamicPayload = this.fields.map(f => ({
      fieldId: f.fieldId,
      value: this.dynamicFieldsForm.get(f.fieldId)?.value || ''
    }));

    const payload = {
      ...this.accountForm.getRawValue(),
      dynamicFields: dynamicPayload
    };

    this.api.updateTnxx(payload, `AccountMaster/${id}`).subscribe({
      next: () => {
        Swal.fire('Updated!', 'Account Type updated successfully', 'success')
          .then(() => this.router.navigate(['/admin/account-types-inquiry']));
      },
      error: err => console.error('Update failed', err)
    });
  }

  // ================= WORKFLOW =================
  submit(): void {
    if (!this.storeAccount?.id) return;

    this.api.setTnxByStatus('S', this.storeAccount.id, 'AccountMaster').subscribe({
      next: () =>
        Swal.fire('Submitted!', 'Account submitted successfully', 'success')
          .then(() =>
            this.router.navigate(['/admin/account-types-inquiry'], {
              queryParams: { tabName: 'submitted' }
            })
          )
    });
  }

  approve(id: number): void {
    this.api.setTnxByStatus('A', id, 'AccountMaster').subscribe({
      next: () =>
        Swal.fire('Approved!', 'Account approved successfully', 'success')
          .then(() =>
            this.router.navigate(['/admin/account-types-inquiry'], {
              queryParams: { tabName: 'approved' }
            })
          )
    });
  }

  reject(id: number): void {
    this.api.setTnxByStatus('I', id, 'AccountMaster').subscribe({
      next: () =>
        Swal.fire('Rejected!', 'Account rejected successfully', 'success')
          .then(() =>
            this.router.navigate(['/admin/account-types-inquiry'], {
              queryParams: { tabName: 'rejected' }
            })
          )
    });
  }

  // ================= UI =================
  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  toggleDynamicFields(): void {
    this.isDynamicFieldsOpen = !this.isDynamicFieldsOpen;
  }

  isReadOnly(): boolean {
    return this.storeAccount?.recordStatus === 'A';
  }

  onBack(): void {
    this.location.back();
  }

  onCancel(): void {
    this.accountForm.reset();
    this.dynamicFieldsForm.reset();
  }

  // ================= DROPDOWN =================
  getAllCities(): void {
    this.api.getTnxByStatus('A', 'city').subscribe({
      next: (res: any) => {
        this.storeCities = res;
      },
      error: err => console.error(err)
    });
  }
}