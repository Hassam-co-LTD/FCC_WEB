import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { ApiService } from '../../../../../core/services/api.service';

/** Strongly-typed Interface for the Permission Group Payload */
export interface PermissionGroupPayload {
  permissionGroupId?: string | number;
  permissionGroupName: string;
  permissionIds: Array<string | number>;
  permissionGroupStatus: string;
  description?: string;
  id?: number;
  recordStatus?: string;
  moduleName?: string; // Bound in HTML template
}

/** Strongly-typed Interface for the individual Permission Items in the Dropdown */
export interface PermissionGroupItem {
  id: string | number;
  permissionName: string; // Aligned with template: {{ permission.permissionName }}
  [key: string]: unknown;
}

@Component({
  selector: 'app-permission-master',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './permissions-group.html',
  styleUrls: ['./permissions-group.scss'],
})
export class PermissionGroup implements OnInit {
  // =========================
  // CLASS PROPERTIES
  // =========================
  public permissionsFormGroup!: FormGroup;
  public storePermissionGroup: PermissionGroupPayload | null = null;
  public storePermissionGroups: PermissionGroupItem[] = [];
  public isEditMode = false;
  public isOpen = true;

  // Constants
  private readonly TXN_PERMISSIONS_GROUP = 'PermissionsGroup';
  private readonly TXN_PERMISSIONS = 'Permissions';
  private readonly STATUS_ACTIVE = 'A';
  private readonly STATUS_SUBMITTED = 'S';
  private readonly STATUS_REJECTED_OR_AMENDED = 'I';

  private readonly ROUTE_INQUIRY_GROUP = '/admin/permission-group-inquiry';
  private readonly ROUTE_INQUIRY_MASTER = '/admin/permission-master-inquiry';

  // =========================
  // CONSTRUCTOR
  // =========================
  constructor(
    private readonly fb: FormBuilder,
    private readonly api: ApiService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly location: Location
  ) {}

  // =========================
  // LIFECYCLE HOOKS
  // =========================
  public ngOnInit(): void {
    this.buildForm();
    this.loadPermissionGroup();
    this.getPermissionGroups();
  }

  // =========================
  // PRIVATE HELPER METHODS
  // =========================
  private buildForm(): void {
    this.permissionsFormGroup = this.fb.group({
      permissionGroupId: [''],
      permissionGroupName: ['', Validators.required],
      permissionIds: [[], Validators.required],
      permissionGroupStatus: [this.STATUS_ACTIVE, Validators.required],
      description: [''],
    });
  }

  private loadPermissionGroup(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.isEditMode = true;
    this.api.getTnxById(id, this.TXN_PERMISSIONS_GROUP).subscribe({
      next: (res) => {
        const payload = res as PermissionGroupPayload;
        this.storePermissionGroup = payload;
        this.permissionsFormGroup.patchValue(payload);
      },
      error: (err: unknown) => {
        console.error('Load failed', err);
      },
    });
  }

  private handleStatusChange(
    status: string,
    title: string,
    message: string,
    redirectUrl: string
  ): void {
    const id = this.storePermissionGroup?.id ?? this.storePermissionGroup?.permissionGroupId;
    if (!id) {
      return;
    }

    this.api.setTnxByStatus(status, id, this.TXN_PERMISSIONS_GROUP).subscribe({
      next: () => {
        this.showAlert(title, message, 'success').then(() => {
          this.router.navigate([redirectUrl]);
        });
      },
      error: (err: unknown) => {
        console.error('Status update failed', err);
      },
    });
  }

  private showConfirmationAlert(
    title: string,
    text: string,
    confirmText: string,
    onConfirm: () => void
  ): void {
    Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm();
      }
    });
  }

  private showAlert(
    title: string,
    text: string,
    icon: SweetAlertIcon,
    timer?: number
  ): Promise<any> {
    return Swal.fire({
      title,
      text,
      icon,
      timer,
      showConfirmButton: timer ? false : true,
    });
  }

  // =========================
  // DATA LOADING
  // =========================
  public getPermissionGroups(): void {
    this.api.getAllTnx(this.TXN_PERMISSIONS).subscribe({
      next: (res: any) => {
        this.storePermissionGroups = Array.isArray(res)
          ? res
          : (res?.data ?? []);
      },
      error: (err: unknown) => {
        console.error('Permission Groups load failed', err);
        this.storePermissionGroups = [];
      },
    });
  }

  // =========================
  // CRUD METHODS
  // =========================
  public onSave(): void {
    if (this.permissionsFormGroup.invalid) {
      this.permissionsFormGroup.markAllAsTouched();
      return;
    }

    const payload = this.permissionsFormGroup.getRawValue() as PermissionGroupPayload;
    this.api.saveTnx(payload, this.TXN_PERMISSIONS_GROUP).subscribe({
      next: () => {
        this.showAlert('Saved!', 'Permission group saved successfully', 'success').then(() => {
          this.router.navigate([this.ROUTE_INQUIRY_GROUP]);
        });
      },
      error: (err: any) => {
        console.error('Save Error', err);
        const message = err.error?.message ?? err.error ?? 'Something went wrong';
        this.showAlert('Error', message, 'error');
      },
    });
  }

  public update(id: number | undefined): void {
    if (!id || this.permissionsFormGroup.invalid) {
      this.permissionsFormGroup.markAllAsTouched();
      return;
    }

    const payload = this.permissionsFormGroup.getRawValue() as PermissionGroupPayload;
    this.api.updateTnx(payload, this.TXN_PERMISSIONS_GROUP, id).subscribe({
      next: () => {
        this.showAlert('Updated!', 'Permission group updated successfully', 'success').then(() => {
          this.router.navigate([this.ROUTE_INQUIRY_MASTER]);
        });
      },
      error: (err: unknown) => {
        console.error('Update failed', err);
      },
    });
  }

  // =========================
  // STATUS METHODS
  // =========================
  public submit(): void {
    this.showConfirmationAlert(
      'Are you sure?',
      'Do you want to submit this Permission Group?',
      'Yes, Submit',
      () => {
        const id = this.storePermissionGroup?.id ?? this.storePermissionGroup?.permissionGroupId;
        if (!id) return;

        this.api.setTnxByStatus(this.STATUS_SUBMITTED, id, this.TXN_PERMISSIONS_GROUP).subscribe({
          next: () => {
            this.showAlert('Success', 'Permission Group submitted successfully.', 'success', 2000);
          },
          error: (error: any) => {
            const msg = error?.error?.message || 'Failed to submit Permission Group.';
            this.showAlert('Error', msg, 'error');
          },
        });
      }
    );
  }

  public approve(): void {
    this.showConfirmationAlert(
      'Are you sure?',
      'Do you want to approve this Permission Group?',
      'Yes, Approve',
      () => {
        const id = this.storePermissionGroup?.id ?? this.storePermissionGroup?.permissionGroupId;
        if (!id) return;

        this.api.setTnxByStatus(this.STATUS_ACTIVE, id, this.TXN_PERMISSIONS_GROUP).subscribe({
          next: () => {
            this.showAlert('Approved!', 'Permission Group approved successfully.', 'success', 2000).then(() => {
              this.router.navigate([this.ROUTE_INQUIRY_GROUP]);
            });
          },
          error: (err: any) => {
            console.error('Approval failed', err);
            const msg = err?.error?.message || 'Failed to approve Permission Group.';
            this.showAlert('Error', msg, 'error');
          },
        });
      }
    );
  }

  public reject(): void {
    this.handleStatusChange(
      this.STATUS_REJECTED_OR_AMENDED,
      'Rejected!',
      'Permission group rejected successfully',
      this.ROUTE_INQUIRY_MASTER
    );
  }

  public amend(id: number | string | undefined): void {
    this.handleStatusChange(
      this.STATUS_REJECTED_OR_AMENDED,
      'Amended!',
      'Permission group moved to draft',
      this.ROUTE_INQUIRY_MASTER
    );
  }

  public isReadOnly(): boolean {
    return this.storePermissionGroup?.recordStatus === this.STATUS_ACTIVE;
  }

  // =========================
  // UI & NAVIGATION METHODS
  // =========================
  public toggle(): void {
    this.isOpen = !this.isOpen;
  }

  public onBack(): void {
    this.location.back();
  }

  public onCancel(): void {
    this.permissionsFormGroup.reset({
      permissionGroupStatus: this.STATUS_ACTIVE,
    });
  }
}