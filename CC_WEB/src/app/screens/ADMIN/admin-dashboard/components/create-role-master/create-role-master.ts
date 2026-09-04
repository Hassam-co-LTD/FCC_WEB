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
import { TransactionComparisonService } from '../../../../../core/services/admin-service/transaction-comparison.service';
import Swal from 'sweetalert2';
import { ApiService } from '../../../../../core/services/api.service';
@Component({
  selector: 'app-role-profile',
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
  templateUrl: './create-role-master.html',
  styleUrls: ['./create-role-master.scss'],
})
export class CreateRoleMaster implements OnInit {
  roleForm!: FormGroup;
  storeRole: any = {};

  isEditMode = false;
  isOpen = true;

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
    this.loadRole();
  }

  private buildForm(): void {
    this.roleForm = this.fb.group({
      roleId: ['', Validators.required], // roleId from DTO
      roleDesc: ['', Validators.required], // roleDesc from DTO
      roleDest: ['', Validators.required], // roleDest from DTO
      roleStatus: ['Active', Validators.required],
      createdBy: [this.authService.getLoginId()], // createdBy from DTO
      // roleStatus from DTO, default 'A'
      // optional, recordStatus, default 'I'
    });
  }

  private loadRole(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Loading role with ID:', id);

    if (id) {
      this.isEditMode = true;

      this.api.getTnxByRolId(id, 'roles').subscribe({
        next: (res) => {
          this.storeRole = res;
          console.log('Get Role By ID:', res);
          this.roleForm.patchValue(res);

          if (this.storeRole?.recordStatus === 'S') {
            this.api
              .getRejectedTransaction(this.storeRole.roleId, 'roles')
              .subscribe({
                next: (rejectedRes) => {
                  this.storeRejectedRole = rejectedRes;
                  console.log('Rejected Role Data:', rejectedRes);
                  this.compareRoleData();
                },
                error: (err) =>
                  console.error('Failed to load rejected role data', err),
              });
          }
        },
        error: (err) => console.error('Load failed', err),
      });
    }
  }

  // ---------------- CREATE ----------------
  onSave(): void {
    if (this.roleForm.invalid) return;

    const payload = this.roleForm.getRawValue();
    console.log('Payload to save:', payload);

    this.api.saveTnx(payload, 'roles').subscribe({
      next: () => {
        Swal.fire('Saved!', 'Role saved successfully', 'success').then(() =>
          this.router.navigate(['/admin/role-master-inquiry']),
        );
      },
      error: (err) => {
        console.error('Save failed', err);

        // Show exactly the backend message
        let backendMessage = '';
        if (typeof err.error === 'string') {
          backendMessage = err.error; // backend string message
        } else if (err.error?.message) {
          backendMessage = err.error.message; // if backend sends JSON { message: ... }
        }

        Swal.fire('Error', backendMessage, 'error');
      },
    });
  }

  // ---------------- UPDATE ----------------
  update(id: String): void {
    if (this.roleForm.invalid) return;
    const payload = {
      ...this.roleForm.getRawValue(),
      updatedBy: this.authService.getLoginId(),
    };

    this.api.updateTnxByRoleId(payload, 'roles', id).subscribe({
      next: () => {
        Swal.fire('Updated!', 'Role updated successfully', 'success').then(() =>
          this.router.navigate(['/admin/role-master-inquiry']),
        );
      },
      error: (err) => console.error('Update failed', err),
    });
  }

  // ---------------- UI HELPERS ----------------
  isReadOnly(): boolean {
    if (!this.storeRole) {
      return true;
    }
    return false;
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  onBack(): void {
    this.location.back();
  }

  onCancel(): void {
    this.roleForm.reset();
  }

  submit(): void {
    const payload = this.authService.getSubmitPayload();
    console.log('Submit payload:', payload);
    this.api.setTnxByStatus(payload, this.storeRole.roleId, 'roles').subscribe({
      next: (res) => {
        console.log('Submit response:', res);
        Swal.fire('Submitted!', 'Role submitted successfully', 'success').then(
          () =>
            this.router.navigate(['/admin/role-master-inquiry'], {
              queryParams: { tabName: 'submitted' },
            }),
        );
      },
      error: (err) => console.error('Submit failed', err),
    });
  }

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

      this.api
        .setTnxByStatus(payload, this.storeRole.roleId, 'roles')
        .subscribe({
          next: (res: any) => {
            Swal.fire(
              'Rejected!',
              res?.message || 'Role rejected successfully',
              'success',
            ).then(() =>
              this.router.navigate(['/admin/role-master-inquiry'], {
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
  private getBackendMessage(error: any): string {
    return (
      error?.error?.message ||
      error?.error?.error ||
      error?.message ||
      'An unexpected error occurred'
    );
  }
  approve(roleId: String): void {
    if (!this.storeRole?.roleId) return;
    const payload = this.authService.getApprovePayload();
    console.log('Approve payload:', payload);
    this.api.setTnxByStatus(payload, this.storeRole.roleId, 'roles').subscribe({
      next: () => {
        Swal.fire('Approved!', 'Role approved successfully', 'success').then(
          () =>
            this.router.navigate(['/admin/role-master-inquiry'], {
              queryParams: { tabName: 'approved' },
            }),
        );
      },
      error: (err) => console.error('Approve failed', err),
    });
  }
  amend(roleId: String): void {
    if (!this.storeRole?.roleId) return;
    const payload = this.authService.getAmendPayload();
    console.log('Amend payload:', payload);
    this.api.setTnxByStatus(payload, this.storeRole.roleId, 'roles').subscribe({
      next: () => {
        Swal.fire(
          'Amended!',
          'Role moved to Draft for amendment',
          'success',
        ).then(() => this.router.navigate(['/admin/role-master-inquiry']));
      },
      error: (err) => console.error('Amend failed', err),
    });
  }

  // previous values

  storeRejectedRole: any | null = null;

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

  private readonly roleFields = [
    'roleId',
    'roleDesc',
    'roleDest',
    'roleStatus',
  ];

  // =====================================================
  // COMPARE ROLE GENERAL DETAILS
  // =====================================================

  private compareRoleData(): void {
    this.previousValues = this.comparisonService.compare(
      this.storeRole,
      this.storeRejectedRole,
      this.roleFields,
    );

    console.log('Previous role values:', this.previousValues);
  }

  // =====================================================
  // COMPARE DYNAMIC FIELDS
  // =====================================================

  // =====================================================
  // CHECK PREVIOUS ROLE VALUE
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
}
