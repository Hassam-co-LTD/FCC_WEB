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
  selector: 'app-Permission-group',
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
  templateUrl: './permissions-group.html',
  styleUrls: ['./permissions-group.scss']
})
export class CreatePermissionGroup implements OnInit {

  permissionGroupForm!: FormGroup;
  storePermissionGroup: any = {};
  allPermissions: any[] = [];

  isEditMode = false;
  isOpen = true;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadPermissionGroup();
    this.loadPermissions()
  }
private buildForm(): void {
  this.permissionGroupForm = this.fb.group({

    permissionGroupId: ['', Validators.required],

    permissionGroupName: ['', Validators.required],

    description: ['', Validators.required],

    permissionIds: [[], Validators.required],

    permissionGroupStatus: ['A', Validators.required]

  });
}

  private loadPermissionGroup(): void {

    const id = this.route.snapshot.paramMap.get('id');
    console.log('Loading permission group with ID:', id);

    if (id) {

      this.isEditMode = true;

      this.api.getTnxById(id, 'PermissionsGroup').subscribe({
        next: res => {
          this.storePermissionGroup = res;
          console.log('Permission Group:', res);
          this.permissionGroupForm.patchValue(res);
        },
        error: err => console.error(err)
      });

    }

  }


  // ---------------- CREATE ----------------
  onSave(): void {

    if (this.permissionGroupForm.invalid) return;

    const payload = this.permissionGroupForm.getRawValue();
    
    console.log('Payload to save:', payload);

    this.api.saveTnx(payload, 'PermissionsGroup').subscribe({

      next: () => {

        Swal.fire('Saved!', 'Permission Group saved successfully', 'success')
          .then(() => this.router.navigate(['/admin/permission-group-master-inquiry']));

      },

      error: err => {

        console.error('Save failed', err);

        let backendMessage = '';

        if (typeof err.error === 'string') {
          backendMessage = err.error;
        }
        else if (err.error?.message) {
          backendMessage = err.error.message;
        }

        Swal.fire('Error', backendMessage, 'error');

      }

    });

  }



  // ---------------- UPDATE ----------------
  update(id: Number): void {

    if (this.permissionGroupForm.invalid) return;

    const payload = this.permissionGroupForm.getRawValue();

    this.api.updateTnx(payload, 'PermissionsGroup', id).subscribe({

      next: () => {

        Swal.fire('Updated!', 'Permission Group updated successfully', 'success')
          .then(() => this.router.navigate(['/admin/permission-group-master-inquiry']));

      },

      error: err => console.error('Update failed', err)

    });

  }



  // ---------------- UI HELPERS ----------------

  isReadOnly(): boolean {
    if (!this.storePermissionGroup) {
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
    this.permissionGroupForm.reset();
  }



  submit(): void {

    this.api.setTnxByStatus(
      'S',
      this.storePermissionGroup.id,
      'PermissionsGroup'
    )
    .subscribe({

      next: () => {

        Swal.fire('Submitted!', 'Permission Group submitted successfully', 'success')
          .then(() => this.router.navigate(['/admin/permission-group-master-inquiry']));

      },

      error: err => console.error('Submit failed', err)

    });

  }



  reject(id: Number): void {

    if (!this.storePermissionGroup?.permissionGroupId) return;


    this.api.setTnxByStatus(
      'I',
      this.storePermissionGroup.permissionGroupId,
      'PermissionGroup'
    )
    .subscribe({

      next: () => {

        Swal.fire('Rejected!', 'Permission Group rejected successfully', 'success')
          .then(() => this.router.navigate(['/admin/permission-group-master-inquiry']));

      },

      error: err => console.error('Reject failed', err)

    });

  }



  approve(): void {

    if (!this.storePermissionGroup?.permissionGroupId) return;


    this.api.setTnxByStatus(
      'A',
      this.storePermissionGroup.id,
      'PermissionsGroup'
    )
    .subscribe({

      next: () => {

        Swal.fire('Approved!', 'Permission Group approved successfully', 'success')
          .then(() => this.router.navigate(['/admin/permission-group-master-inquiry']));

      },

      error: err => console.error('Approve failed', err)

    });

  }



  amend(permissionGroupId: String): void {

    if (!this.storePermissionGroup?.permissionGroupId) return;


    this.api.setTnxByStatus(
      'I',
      this.storePermissionGroup.permissionGroupId,
      'PermissionGroup'
    )
    .subscribe({

      next: () => {

        Swal.fire('Amended!', 'Permission Group moved to Draft for amendment', 'success')
          .then(() => this.router.navigate(['/admin/permission-group-master-inquiry']));

      },

      error: err => console.error('Amend failed', err)

    });

  }

  private loadPermissions(): void {

  this.api.getTnxByStatus('A', 'Permissions').subscribe({

    next: (res: any[]) => {
      this.allPermissions = res;
      console.log('Loaded Permissions:', this.allPermissions);
    },

    error: err => {
      console.error('Permission loading failed', err);
    }

  });

}
}