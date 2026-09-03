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
import { MatCardModule } from '@angular/material/card';
import { TransactionComparisonService } from '../../../../../core/services/admin-service/transaction-comparison.service';
import Swal from 'sweetalert2';

import { AuthService } from '../../../../../core/services/auth.service';
import { ApiService } from '../../../../../core/services/api.service';

@Component({
  selector: 'app-city',
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
    MatCardModule,
  ],
  templateUrl: './city.html',
  styleUrls: ['./city.scss'],
})
export class City implements OnInit {
  // =========================
  // FORMS
  // =========================
  cityForm!: FormGroup;
  dynamicFieldsForm!: FormGroup;

  // =========================
  // DATA
  // =========================
  storeCity: any = {};
  fields: any[] = [];
  storeDynamicFieldsResponse: any[] = [];

  // =========================
  // UI STATE
  // =========================
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
    this.loadCity();
    this.loadDynamicFields();
  }

  // =========================
  // BUILD CITY FORM
  // =========================
  private buildForm(): void {
    this.cityForm = this.fb.group({
      cityId: [''],
      cityName: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      createdBy: [this.authService.getLoginId() || '', Validators.required],
    });
  }

  // =========================
  // LOAD CITY
  // =========================
  private loadCity(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.isEditMode = true;

    this.api.getTnxById(id, 'city').subscribe({
      next: (res: any) => {
        this.storeCity = res;
        this.storeDynamicFieldsResponse = res?.dynamicFields || [];

        if (this.storeCity?.recordStatus === 'S') {
          this.api.getRejectedTransaction(this.storeCity.id, 'city').subscribe({
            next: (rejectedRes: any) => {
              console.log('Rejected city response:', rejectedRes);
              this.storeRejectedCity = rejectedRes;
              this.storeRejectedDynamicCity = rejectedRes?.dynamicFields || [];
              this.compareCityData();
              this.compareCityDynamicFields();
            },
          });
        }

        this.cityForm.patchValue(res);

        this.patchDynamicValues();
      },

      error: () => {
        Swal.fire('Error', 'Failed to load city', 'error');
      },
    });
  }

  // =========================
  // LOAD DYNAMIC FIELDS
  // =========================
  private loadDynamicFields(): void {
    this.api.getFieldsByScreenAndStatus('city', 'A').subscribe({
      next: (res: any) => {
        this.fields = res || [];

        const group: {
          [key: string]: any;
        } = {};

        this.fields.forEach((field: any) => {
          group[field.fieldName] = [''];
        });

        this.dynamicFieldsForm = this.fb.group(group);

        this.patchDynamicValues();
      },

      error: () => {
        Swal.fire('Error', 'Failed to load city dynamic fields', 'error');
      },
    });
  }

  // =========================
  // PATCH DYNAMIC VALUES
  // =========================
  private patchDynamicValues(): void {
    if (
      !this.dynamicFieldsForm ||
      !this.fields?.length ||
      !this.storeDynamicFieldsResponse?.length
    ) {
      return;
    }

    const patch: {
      [key: string]: any;
    } = {};

    this.storeDynamicFieldsResponse.forEach((saved: any) => {
      const definition = this.fields.find(
        (field: any) => field.fieldId == saved.fieldId,
      );

      if (definition) {
        patch[definition.fieldName] = saved.value || '';
      }
    });

    this.dynamicFieldsForm.patchValue(patch);
  }

  // =========================
  // SAVE CITY
  // =========================
  onSave(): void {
    if (
      this.cityForm.invalid ||
      !this.dynamicFieldsForm ||
      this.dynamicFieldsForm.invalid
    ) {
      this.cityForm.markAllAsTouched();

      if (this.dynamicFieldsForm) {
        this.dynamicFieldsForm.markAllAsTouched();
      }

      return;
    }

    const cityData = this.cityForm.getRawValue();

    const dynamicFields = this.fields.map((field: any) => ({
      fieldId: field.fieldId,

      value: this.dynamicFieldsForm.get(field.fieldName)?.value || '',

      cityId: cityData.cityId,
    }));

    const payload = {
      ...cityData,

      dynamicFields,
    };

    this.api.saveTnx(payload, 'city').subscribe({
      next: (res: any) => {
        this.storeCity = res;

        Swal.fire('Saved!', 'City saved successfully', 'success').then(() => {
          this.router.navigate(['/admin/city-list'], {
            queryParams: {
              tabName: 'draft',
            },
          });
        });
      },

      error: () => {
        Swal.fire('Error', 'City save failed', 'error');
      },
    });
  }

  // =========================
  // UPDATE CITY
  // =========================
  updateCity(): void {
    if (
      this.cityForm.invalid ||
      !this.dynamicFieldsForm ||
      this.dynamicFieldsForm.invalid
    ) {
      this.cityForm.markAllAsTouched();

      if (this.dynamicFieldsForm) {
        this.dynamicFieldsForm.markAllAsTouched();
      }

      return;
    }

    const cityId = this.cityForm.getRawValue().cityId;

    if (!cityId) {
      Swal.fire('Error', 'City ID is required', 'error');

      return;
    }

    const dynamicFields = this.fields.map((field: any) => ({
      fieldId: field.fieldId,

      value: this.dynamicFieldsForm.get(field.fieldName)?.value || '',
    }));

    const cityPayload = {
      ...this.cityForm.getRawValue(),

      dynamicFields,

      updatedBy: this.authService.getLoginId() || '',
    };

    this.api.updateTnxx(cityPayload, `city/update/${cityId}`).subscribe({
      next: () => {
        Swal.fire('Updated!', 'City updated successfully', 'success').then(
          () => {
            this.router.navigate(['/admin/city-list'], {
              queryParams: {
                tabName: 'draft',
              },
            });
          },
        );
      },

      error: () => {
        Swal.fire('Error', 'City update failed', 'error');
      },
    });
  }

  // =========================
  // SUBMIT CITY
  // =========================
  submit(): void {
    if (!this.storeCity?.id) {
      return;
    }

    const payload = this.authService.getSubmitPayload();

    this.api.setTnxByStatus(payload, this.storeCity.id, 'city').subscribe({
      next: () => {
        Swal.fire('Submitted!', 'City submitted successfully', 'success').then(
          () => {
            this.router.navigate(['/admin/city-list'], {
              queryParams: {
                tabName: 'submitted',
              },
            });
          },
        );
      },

      error: () => {
        Swal.fire('Error', 'City submission failed', 'error');
      },
    });
  }

  // =========================
  // REJECT CITY
  // =========================
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

      this.api.setTnxByStatus(payload, id, 'city').subscribe({
        next: (res: any) => {
          console.log('Reject successful:', res);

          Swal.fire(
            'Rejected!',
            res?.message || 'City rejected successfully',
            'success',
          ).then(() => {
            this.router.navigate(['/admin/city-list'], {
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

  // =========================
  // APPROVE CITY
  // =========================
  approve(id: number): void {
    if (!id) {
      return;
    }

    const payload = this.authService.getApprovePayload();

    this.api.setTnxByStatus(payload, id, 'city').subscribe({
      next: () => {
        Swal.fire('Approved!', 'City approved successfully', 'success').then(
          () => {
            this.router.navigate(['/admin/city-list'], {
              queryParams: {
                tabName: 'approved',
              },
            });
          },
        );
      },

      error: () => {
        Swal.fire('Error', 'City approval failed', 'error');
      },
    });
  }

  // Amend function
  amend(id: number): void {
    let payload = this.authService.getAmendPayload();
    this.api.setTnxByStatus(payload, id, 'city').subscribe({
      next: () =>
        Swal.fire('Amended!', 'City amended successfully', 'success').then(() =>
          this.router.navigate(['/admin/city-list'], {
            queryParams: { tabName: 'amended' },
          }),
        ),
    });
  }

  // =========================
  // UI HELPERS
  // =========================
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
    this.cityForm.reset();

    if (this.dynamicFieldsForm) {
      this.dynamicFieldsForm.reset();
    }
  }

  isReadOnly(): boolean {
    return this.storeCity?.recordStatus === 'A';
  }

  // =====================================================
  // REJECTED CITY
  // =====================================================

  storeRejectedCity: any | null = null;

  storeRejectedDynamicCity: any | null = null;
  // =====================================================
  // PREVIOUS NORMAL CITY VALUES
  // =====================================================

  previousValues: { [key: string]: any } = {};

  // =====================================================
  // PREVIOUS DYNAMIC FIELD VALUES
  // =====================================================

  previousDynamicValues: { [key: string]: any } = {};

  // =====================================================
  // CITY GENERAL DETAILS FIELDS
  // =====================================================

  private readonly cityFields = [
    'cityId',
    'cityName',
    'state',
    'country',
    'recordStatus',
    'branchCode',
    'countryCity',
    'customerType',
    'customerCategory',
    'address1',
    'address2',
    'address3',
  ];

  // =====================================================
  // COMPARE CITY GENERAL DETAILS
  // =====================================================

  private compareCityData(): void {
    this.previousValues = this.comparisonService.compare(
      this.storeCity,
      this.storeRejectedCity,
      this.cityFields,
    );

    console.log('Previous city values:', this.previousValues);
  }

  // =====================================================
  // COMPARE DYNAMIC FIELDS
  // =====================================================

  private compareCityDynamicFields(): void {
    // Clear old values first
    this.previousDynamicValues = {};

    if (!this.storeCity?.dynamicFields || !this.storeRejectedDynamicCity) {
      return;
    }

    this.previousDynamicValues = this.comparisonService.compareDynamicFields(
      this.storeCity.dynamicFields,
      this.storeRejectedDynamicCity,
    );

    console.log('Previous dynamic values:', this.previousDynamicValues);
  }

  // =====================================================
  // CHECK PREVIOUS CITY VALUE
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
  // GET PREVIOUS CITY VALUE
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
