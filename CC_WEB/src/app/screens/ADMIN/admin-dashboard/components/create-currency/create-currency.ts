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
import {AuthService} from '../../../../../core/services/auth.service';
import Swal from 'sweetalert2';
import { ApiService } from '../../../../../core/services/api.service';
@Component({
  selector: 'app-currency-profile',
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
  templateUrl: './create-currency.html',
  styleUrls: ['./create-currency.scss']
})
export class CreateCurrency implements OnInit {

  currencyForm!: FormGroup;
  dynamicFieldsForm!: FormGroup;

  storeCurrency: any = {};
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
  
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCurrency();
    this.loadDynamicFields();
  }

  // ---------------- FORM BUILD ----------------
  private buildForm(): void {
    this.currencyForm = this.fb.group({
      currencyId: [''],
      currencyCode: ['', Validators.required],
      currencyDesc: ['', Validators.required],
      currencyMapId: [''],
      currencyStatus: ['A'],
      createdBy: [this.authService.getLoginId() || '']
    });
  }

  // ---------------- LOAD CURRENCY ----------------
  private loadCurrency(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isEditMode = true;
    this.api.getTnxById(id, 'currency').subscribe({
      next: res => {
        this.storeCurrency = res;
        this.storeDynamicFieldsResponse = res.dynamicFields || [];
        this.currencyForm.patchValue(res);
        this.patchDynamicValues();
      },
      error: err => console.error('Load failed', err)
    });
  }

  // ---------------- LOAD DYNAMIC FIELDS ----------------
  private loadDynamicFields(): void {
    this.api.getFieldsByScreenAndStatus('currency', 'A').subscribe({
      next: res => {
        this.fields = res;
        const group: any = {};
        this.fields.forEach(f => group[f.fieldName] = ['']);
        this.dynamicFieldsForm = this.fb.group(group);
        this.patchDynamicValues();
      },
      error: err => console.error('Dynamic field load failed', err)
    });
  }

  // ---------------- PATCH DYNAMIC VALUES ----------------
  private patchDynamicValues(): void {
    if (!this.dynamicFieldsForm || !this.fields.length || !this.storeDynamicFieldsResponse.length) return;
    const patch: any = {};
    this.storeDynamicFieldsResponse.forEach(saved => {
      const def = this.fields.find(f => f.fieldId == saved.fieldId);
      if (def) patch[def.fieldName] = saved.value || '';
    });
    this.dynamicFieldsForm.patchValue(patch);
  }

  // ---------------- SAVE ----------------
onSave(): void {
  if (this.currencyForm.invalid) return;

  // Main currency payload
  const currencyPayload = this.currencyForm.getRawValue();

  // Dynamic fields payload
  const dynamicFieldsPayload = this.fields?.map(f => ({
    fieldId: f.fieldId,
    value: this.dynamicFieldsForm.get(f.fieldName)?.value || '',
    currencyId: this.currencyForm.get('currencyId')?.value || null // Include currencyId for updates
  })) || [];

  // Combine both into one DTO
  const payload = {
    ...currencyPayload,
    dynamicFields: dynamicFieldsPayload
  };

  console.log('Payload to save:', payload);

  // Single API call
  this.api.saveTnx(payload, 'currency').subscribe({
    next: () => {
      Swal.fire('Saved!', 'Currency and dynamic fields saved successfully', 'success')
        .then(() => this.router.navigate(['/admin/currency-inquiry']));
    },
    error: err => Swal.fire('Error', 'Currency save failed', 'error')
  });
}
  // ---------------- UPDATE ----------------
  updateCurrency(): void {
  if (this.currencyForm.invalid) return;
   
  const dynamicPayload = this.fields.map(f => ({
    fieldId: f.fieldId,
    value: this.dynamicFieldsForm.get(f.fieldName)?.value || ''
  })) || [];

  const payload = {
    ...this.currencyForm.getRawValue(),
    dynamicFields: dynamicPayload,
    updatedBy: this.authService.getLoginId() || ''
  };

  this.api.updateTnxx(payload, `currency/update/${this.storeCurrency.currencyId}`).subscribe({
    
    next: () => {
      Swal.fire(
        'Updated!',
        'Currency and Additional Fields updated successfully',
        'success'
      );
    },

    error: err => {
      console.error('Currency update failed', err);
    }

  });
}

  // ---------------- WORKFLOW ----------------
  submit(): void {
    if (!this.storeCurrency?.currencyCode) return;
    const payload = this.authService.getSubmitPayload()
    this.api.setTnxByStatus(payload, this.storeCurrency.id, 'currency').subscribe({
      next: () =>
        Swal.fire('Submitted!', 'Currency submitted successfully', 'success')
         .then(() =>
    this.router.navigate(['/admin/city-list'], {
      queryParams: { tabName: 'submitted' }
    })
  )
    });
  }

  approve(): void {
    if (!this.storeCurrency?.currencyCode) return;
  const payload = this.authService.getApprovePayload()
    this.api.setTnxByStatus(payload, this.storeCurrency.id, 'currency').subscribe({
      next: () =>
        Swal.fire('Approved!', 'Currency approved successfully', 'success')
          .then(() => this.router.navigate(['/admin/currency-list']))
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
          'aria-label': 'Reject reason'
        },
        showCancelButton: true,
        confirmButtonText: 'Reject',
        cancelButtonText: 'Cancel',
    
        preConfirm: (reason) => {
    
          if (!reason || !reason.trim()) {
    
            Swal.showValidationMessage(
              'Reject reason is required'
            );
    
            return false;
          }
    
          return reason.trim();
        }
    
      }).then((result) => {
    
        if (!result.isConfirmed) {
          return;
        }
    
        const rejectReason = result.value;
    
        // =========================
        // CREATE REJECT PAYLOAD
        // =========================
    
        const payload =
          this.authService.getRejectPayload(rejectReason);
    
        console.log('Reject ID:', id);
        console.log('Reject Payload:', payload);
    
        // =========================
        // CALL API
        // =========================
    
        this.api.setTnxByStatus(
          payload,
          id,
          'customer'
        ).subscribe({
    
          next: (res: any) => {
    
            console.log('Reject successful:', res);
    
            Swal.fire(
              'Rejected!',
              res?.message || 'Currency rejected successfully',
              'success'
            ).then(() => {
    
              this.router.navigate(
                ['/admin/customer-list'],
                {
                  queryParams: {
                    tabName: 'rejected'
                  }
                }
              );
    
            });
    
          },
    
          error: (err: any) => {
    
            console.error('Reject failed:', err);
    
            Swal.fire(
              'Error',
              err?.error?.message || 'Reject failed',
              'error'
            );
    
          }
    
        });
    
      });
    }

    // -------- Amend method ----------

    amend(id: number): void {
    
      if (!id) return;
    
      const payload = this.authService.getAmendPayload();
    
      console.log('🚀 Amend clicked with ID:', id);
      console.log('📦 Amend Payload:', payload);
    
      this.api.setTnxByStatus(
        payload,
        id,
        'customer'
      ).subscribe({
    
        next: (res: any) => {
    
          console.log('✅ Approve API Response:', res);
    
          Swal.fire(
            'Approved!',
            res?.message || 'Customer approved successfully',
            'success'
          ).then(() => {
    
            this.router.navigate(
              ['/admin/customer-list'],
              {
                queryParams: {
                  tabName: 'approved'
                }
              }
            );
    
          });
        },
    
        error: (err: any) => {
    
          console.log('❌ Approve API Error:', err);
          console.log('❌ Error Body:', err?.error);
          console.log('❌ Error Message:', err?.message);
    
          Swal.fire(
            'Error',
            err?.error?.message || 'Approve failed',
            'error'
          );
        }
      });
    }

  // ---------------- UI HELPERS ----------------
  toggle(): void { this.isOpen = !this.isOpen; }
  toggleDynamicFields(): void { this.isDynamicFieldsOpen = !this.isDynamicFieldsOpen; }

  isReadOnly(): boolean { return this.storeCurrency?.recordStatus === 'A'; }
  onBack(): void { this.location.back(); }
  onCancel(): void { this.currencyForm.reset(); }
}