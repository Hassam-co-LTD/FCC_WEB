import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
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
import { MatCard } from '@angular/material/card';
import Swal from 'sweetalert2';
import { ApiService } from '../../../../../core/services/api.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { TransactionComparisonService } from '../../../../../core/services/admin-service/transaction-comparison.service';
export interface UserDetails {
  id: number;
  loginId: string;
  companyId: number | null;
  userStatus: string | null;
  userCategory: string;
  recordStatus: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdOn?: string | null;
  updatedOn?: string | null;
}

export interface RoleMasterResponseDTO {
  roleId: string;
  roleDesc: string;
  roleDest?: string;
  recordStatus?: string;
}

export interface UsersRolesResponseDTO {
  roleId: string;
  roleDesc?: string;
  roleDest?: string;
  status?: string; // SUCCESS, DUPLICATE, FAILED
}

@Component({
  selector: 'app-create-user-client',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
  templateUrl: './create-user-client.html',
  styleUrls: ['./create-user-client.scss'],
})
export class CreateClientUser implements OnInit {
  // ---------- CLIENT USER FORM ----------
  clientUserForm!: FormGroup;
  storeClientUser: any = null;
  allCompanies: any[] = [];
  isEditMode = false;
  isOpen = true;

  userId = sessionStorage.getItem('userId');

  // ---------- ROLES ----------
  userRoles: RoleMasterResponseDTO[] = [];
  selectedRoleIds: string[] = [];
  userAssignedRoles: UsersRolesResponseDTO[] = [];
  isRolesOpen = true;
  // ---------- DYNAMIC FIELDS ----------
  dynamicFieldsForm!: FormGroup;
  fields: any[] = [];
  storeDynamicFieldsResponse: any[] = [];
  isDynamicFieldsOpen = true;
  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private authService: AuthService,
    private comparissionService: TransactionComparisonService,
  ) {}

  UserData = {
    loginId: '',
    userName: '',
    password: '',
    userCategory: '',
    companyId: '',
    appUserId: '',
  };
  ngOnInit(): void {
    this.buildClientUserForm();
    this.loadClientUserDetails(); // ✅ user-details logic replaces old getTnxById
    this.loadCompanies();
    this.fetchAllRoles();
    this.loadDynamicFields();
    this.fetchAllGroupPermissions();
  }

  // ================= CLIENT USER FORM =================
  private buildClientUserForm(): void {
    this.clientUserForm = this.fb.group({
      loginId: [this.userId, Validators.required],
      userName: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      userCategory: [''],
      companyId: ['', Validators.required],
      userStatus: [''],
      permissionGroupId: [null, Validators.required],
      createdBy: [this.authService.getLoginId() || ''],
    });
  }

  // ---------------- REPLACED LOGIC ----------------
  private loadClientUserDetails(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      console.log('Loading client user with ID:', id);
      this.isEditMode = true;

      this.api.getTnxById(Number(id), 'clientUsers').subscribe({
        next: (data: any) => {
          console.log('fetched user by id ', id, data);

          this.storeClientUser = data;
          this.clientUserForm.patchValue(data);

          // store dynamic fields
          this.storeDynamicFieldsResponse = data.dynamicFields || [];

          // ⚠️ DO NOT PATCH HERE DIRECTLY
          // wait until fields are loaded

          this.fetchAssignedRoles();

          if (this.storeClientUser.recordStatus === 'S') {
            this.api
              .getRejectedTransaction(this.storeClientUser.id, 'clientUsers')
              .subscribe({
                next: (rejectedData: any) => {
                  console.log('Fetched rejected data:', rejectedData);
                  this.storeRejectedClientUser = rejectedData;
                  this.comparelientUserData();
                },
                error: (err) =>
                  console.error('Error fetching rejected data', err),
              });
            this.clientUserForm.disable();
          }
        },
        error: (err) =>
          console.error('Error fetching client user detailsss', err),
      });
    }
  }

  private loadCompanies(): void {
    this.api.getTnxByStatus('A', 'company').subscribe({
      next: (companies) => {
        this.allCompanies = companies;
        console.log('Fetched companies:', this.allCompanies);
      },
      error: (err) => console.error('Error fetching companies', err),
    });
  }

  onSave(): void {
    if (this.clientUserForm.invalid) return;

    const payload = {
      ...this.clientUserForm.getRawValue(),
      dynamicFields: this.getDynamicPayload(), // ✅ ADD THIS
    };

    console.log('Saving client user with payload:', payload);

    this.api.saveTnx(payload, 'clientUsers').subscribe({
      next: (res) => {
        Swal.fire('Saved!', 'Client User saved successfully', 'success').then(
          () => this.router.navigate(['/admin/user-client-inquiry']),
        );
        console.log('saved data ', res);
      },
      error: (err) => console.error('Save failed', err),
    });
  }

  update(id: number): void {
    if (this.clientUserForm.invalid) {
      return;
    }

    const payload = {
      ...this.clientUserForm.getRawValue(),
      updatedby: this.authService.getLoginId(),
      dynamicFields: this.getDynamicPayload(),
    };

    console.log('Updating payload:', payload);

    this.api.updateTnx(payload, 'clientUsers', id).subscribe({
      next: (res) => {
        console.log('Client User updated successfully', res);

        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Client User updated successfully',
        }).then(() => {
          this.router.navigate(['/admin/user-client-inquiry']);
        });
      },

      error: (err) => {
        console.error('Update failed', err);

        let message = 'Unknown error occurred.';

        if (err.error) {
          if (typeof err.error === 'string') {
            message = err.error;
          } else if (err.error.message) {
            message = err.error.message;
          } else if (err.error.error) {
            message = err.error.error;
          } else {
            message = JSON.stringify(err.error, null, 2);
          }
        } else if (err.message) {
          message = err.message;
        }

        Swal.fire({
          icon: 'error',
          title: `Error ${err.status}`,
          html: `<pre style="text-align:left;white-space:pre-wrap;">${message}</pre>`,
          width: 700,
        });
      },
    });
  }

  isReadOnly(): boolean {
    return false;
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }
  onBack(): void {
    this.location.back();
  }
  onCancel(): void {
    this.clientUserForm.reset();
  }

  submit(): void {
    if (!this.storeClientUser?.id) return;
    const payload = this.authService.getSubmitPayload();
    this.api
      .setTnxByStatus(payload, this.storeClientUser.id, 'clientUsers')
      .subscribe({
        next: (res) => {
          console.log('Client User submitted successfully', res);
          Swal.fire(
            'Submitted!',
            'Client User submitted successfully',
            'success',
          ).then(() =>
            this.router.navigate(['/admin/user-client-inquiry'], {
              queryParams: { tabName: 'submitted' },
            }),
          );
        },

        error: (err) => console.error('Submit failed', err),
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

      this.api.setTnxByStatus(payload, id, 'clientUsers').subscribe({
        next: (res: any) => {
          console.log('Reject successful:', res);

          Swal.fire(
            'Rejected!',
            res?.message || 'Client User rejected successfully',
            'success',
          ).then(() => {
            this.router.navigate(['/admin/user-client-list'], {
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

  approve(id: number): void {
    if (!this.storeClientUser?.id) return;
    const payload = this.authService.getApprovePayload();
    this.api.setTnxByStatus(payload, id, 'clientUsers').subscribe({
      next: () =>
        Swal.fire(
          'Approved!',
          'Client User approved successfully',
          'success',
        ).then(() =>
          this.router.navigate(['/admin/user-client-inquiry'], {
            queryParams: { tabName: 'approved' },
          }),
        ),
      error: (err) => console.error('Approve failed', err),
    });
  }

  // ------------ Amend method ...................
  amend(id: number): void {
    if (!id) return;

    const payload = this.authService.getAmendPayload();

    console.log('🚀 Approve clicked with ID:', id);
    console.log('📦 Approve Payload:', payload);

    this.api.setTnxByStatus(payload, id, 'clientUsers').subscribe({
      next: (res: any) => {
        console.log('✅ transaction amended succssesfully', res);

        Swal.fire(
          'AMEND!',
          res?.message || 'Client User Amended successfully',
          'success',
        ).then(() => {
          this.router.navigate(['/admin/user-client-list'], {
            queryParams: {
              tabName: 'amend',
            },
          });
        });
      },

      error: (err: any) => {
        console.log('❌ Approve API Error:', err);
        console.log('❌ Error Body:', err?.error);
        console.log('❌ Error Message:', err?.message);

        Swal.fire('Error', err?.error?.message || 'Approve failed', 'error');
      },
    });
  }

  // ================= ROLES MANAGEMENT =================
  fetchAllRoles(): void {
    this.api.getTnxByStatus('A', 'roles').subscribe({
      next: (roles: RoleMasterResponseDTO[]) => {
        this.userRoles = roles.filter((r) => r.roleDest === 'C'); // Only BANK roles for client users
        console.log('Fetched all roles:', this.userRoles);
        this.fetchAssignedRoles();
      },
      error: (err) => console.error('Error fetching roles', err),
    });
  }

  fetchAssignedRoles(): void {
    if (!this.storeClientUser?.id || !this.userRoles.length) return;
    this.api.getRolesByUser(this.storeClientUser.id, 'user-roles').subscribe({
      next: (roleIds: string[]) => {
        this.selectedRoleIds = roleIds;
        this.userAssignedRoles = this.userRoles.filter((role) =>
          roleIds.includes(role.roleId),
        );
      },
      error: (err) => console.error(err),
    });
  }

  toggleRoles(): void {
    this.isRolesOpen = !this.isRolesOpen;
  }

  assignRoles(): void {
    if (!this.storeClientUser?.id) return;
    const payload = this.selectedRoleIds.map((roleId) => ({
      userId: this.storeClientUser.id,
      roleId,
    }));
    console.log('Assigning roles with payload:', payload);
    this.api.saveTnx(payload, 'user-roles').subscribe({
      next: (response: UsersRolesResponseDTO[]) => {
        const success = response.filter((r) => r.status === 'SUCCESS');
        const duplicate = response.filter((r) => r.status === 'DUPLICATE');
        const failed = response.filter((r) => r.status === 'FAILED');
        if (success.length)
          Swal.fire(
            'Success',
            `Roles assigned: ${success.map((r) => r.roleId).join(', ')}`,
            'success',
          );
        if (duplicate.length)
          Swal.fire(
            'Warning',
            `Already assigned: ${duplicate.map((r) => r.roleId).join(', ')}`,
            'warning',
          );
        if (failed.length)
          Swal.fire(
            'Error',
            `Failed: ${failed.map((r) => r.roleId).join(', ')}`,
            'error',
          );
        this.fetchAssignedRoles();
      },
      error: (err) => Swal.fire('Error', 'Failed to assign roles', 'error'),
    });
  }

  updateRoles(): void {
    if (!this.storeClientUser?.id) return;
    const payload: string[] = this.selectedRoleIds;
    this.api
      .updateTnxx(payload, `user-roles/update/${this.storeClientUser.id}`)
      .subscribe({
        next: () =>
          Swal.fire('Success', 'Roles updated successfully', 'success').then(
            () => this.fetchAssignedRoles(),
          ),
        error: (err) => Swal.fire('Error', 'Failed to update roles', 'error'),
      });
  }

  deleteRole(roleId: string): void {
    if (!this.storeClientUser?.id) return;
    const payload = { userId: this.storeClientUser.id, roleId };
    this.api.deleteTnx(payload, 'user-roles').subscribe({
      next: () => {
        Swal.fire('Deleted', 'Role removed successfully', 'success');
        this.selectedRoleIds = this.selectedRoleIds.filter((r) => r !== roleId);
        this.userAssignedRoles = this.userAssignedRoles.filter(
          (r) => r.roleId !== roleId,
        );
      },
      error: (err) => Swal.fire('Error', 'Failed to delete role', 'error'),
    });
  }

  getRoleName(roleId: string): string {
    const role = this.userRoles.find((r) => r.roleId === roleId);
    return role ? role.roleDest || role.roleDesc : roleId;
  }

  // ================= LOAD DYNAMIC FIELDS =================
  private loadDynamicFields(): void {
    this.api.getFieldsByScreenAndStatus('clientUser', 'A').subscribe({
      next: (res: any) => {
        this.fields = res;

        const group: any = {};
        this.fields.forEach((f: any) => {
          group[f.fieldId] = [''];
        });

        this.dynamicFieldsForm = this.fb.group(group);

        this.patchDynamicValues();
      },
      error: (err: any) => console.error('Dynamic field load failed', err),
    });
  }

  // ================= PATCH DYNAMIC =================
  private patchDynamicValues(): void {
    if (
      !this.dynamicFieldsForm ||
      !this.fields?.length ||
      !this.storeDynamicFieldsResponse?.length
    )
      return;

    const patch: any = {};
    this.storeDynamicFieldsResponse.forEach((saved: any) => {
      const def = this.fields.find((f: any) => f.fieldId == saved.fieldId);
      if (def) patch[def.fieldId] = saved.value ?? '';
    });

    this.dynamicFieldsForm.patchValue(patch);
  }

  // ================= GET DYNAMIC PAYLOAD =================
  private getDynamicPayload(): any[] {
    if (!this.fields?.length) return [];

    return this.fields.map((f) => ({
      fieldId: f.fieldId,
      value: this.dynamicFieldsForm.get(f.fieldId)?.value || '',
      loginId: this.clientUserForm.get('loginId')?.value || '',
    }));
  }

  // ================= TOGGLE =================
  toggleDynamicFields(): void {
    this.isDynamicFieldsOpen = !this.isDynamicFieldsOpen;
  }

  getCompanyName(companyId: any): string {
    const company = this.allCompanies?.find(
      (c: any) => c.companyId === companyId,
    );

    return company?.companyName || '—';
  }

  get hasClientUser(): boolean {
    return this.storeClientUser && Object.keys(this.storeClientUser).length > 0;
  }

  storePermissoinGroups: any[] = [];
  fetchAllGroupPermissions(): void {
    this.api.getTnxByStatus('A', 'PermissionsGroup').subscribe({
      next: (res: any) => {
        this.storePermissoinGroups = res || [];
        console.log(
          'Fetched all permission groups:',
          this.storePermissoinGroups,
        );
      },
      error: (err) => console.error('Error fetching permission groups', err),
    });
  }

  // ================= PREVIOUS VALUES =================
  // =====================================================
  // REJECTED CUSTOMER
  // =====================================================

  storeRejectedClientUser: any | null = null;

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

  private readonly clientUserFields = [
    'loginId',
    'userName',
    'email',
    'userCategory',
    'companyId',
    'userStatus',
    'permissionGroupId',
  ];

  // =====================================================
  // COMPARE CUSTOMER GENERAL DETAILS
  // =====================================================

  private comparelientUserData(): void {
    this.previousValues = this.comparissionService.compare(
      this.storeClientUser,
      this.storeRejectedClientUser,
      this.clientUserFields,
    );

    console.log('Previous client user values:', this.previousValues);
  }

  // =====================================================
  // COMPARE DYNAMIC FIELDS
  // =====================================================

  private comparelientUserDynamicFields(): void {
    // Clear old values first
    this.previousDynamicValues = {};

    if (
      !this.storeClientUser?.dynamicFields ||
      !this.storeRejectedClientUser?.dynamicFields
    ) {
      return;
    }

    this.previousDynamicValues = this.comparissionService.compareDynamicFields(
      this.storeClientUser.dynamicFields,
      this.storeRejectedClientUser.dynamicFields,
    );

    console.log('Previous dynamic values:', this.previousDynamicValues);
  }

  // =====================================================
  // CHECK PREVIOUS CLIENT USER VALUE
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
  // GET PREVIOUS CLIENT USER VALUE
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
