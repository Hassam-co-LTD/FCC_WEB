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
  selector: 'app-Permission-profile',
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
  templateUrl: './permission-master.html',
  styleUrls: ['./permission-master.scss']
})
export class PermissionMaster implements OnInit {

  permissionForm!: FormGroup;
  storePermission: any = {};

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
    this.loadPermission();
  }

 private buildForm(): void {
  this.permissionForm = this.fb.group({
    permissionId: ['', Validators.required],
    permissionName: ['', Validators.required],
    moduleName: ['', Validators.required],
    description: [''],
    permissionStatus: ['A', Validators.required]
    // recordStatus will be handled by the backend (default 'I')
  });
}
  private loadPermission(): void {

  const id = this.route.snapshot.paramMap.get('id');
  console.log('Loading permission with ID:', id);

  if (id) {

    this.isEditMode = true;

    this.api.getTnxById(id, 'Permissions').subscribe({
      next: res => {
        this.storePermission = res;
        console.log('Permission:', res);
        this.permissionForm.patchValue(res);
      },
      error: err => console.error(err)
    });

  }

}
  // ---------------- CREATE ----------------
 onSave(): void {
  if (this.permissionForm.invalid) return;

  const payload = this.permissionForm.getRawValue();
  console.log('Payload to save:', payload);

  this.api.saveTnx(payload, 'Permissions').subscribe({
    next: () => {
      Swal.fire('Saved!', 'Permission saved successfully', 'success')
        .then(() => this.router.navigate(['/admin/Permission-master-inquiry']));
    },
    error: err => {
      console.error('Save failed', err);

      // Show exactly the backend message
      let backendMessage = '';
      if (typeof err.error === 'string') {
        backendMessage = err.error; // backend string message
      } else if (err.error?.message) {
        backendMessage = err.error.message; // if backend sends JSON { message: ... }
      }

      Swal.fire('Error', backendMessage, 'error');
    }
  });
}


  // ---------------- UPDATE ----------------
  update(id: Number): void {
    if (this.permissionForm.invalid) return;
    const payload = this.permissionForm.getRawValue();

    this.api.updateTnx(payload, 'Permissions', id).subscribe({
      next: () => {
        Swal.fire('Updated!', 'Permission updated successfully', 'success')
          .then(() => this.router.navigate(['/admin/Permission-master-inquiry']));
      },
      error: err => console.error('Update failed', err)
    });
  }

  // ---------------- UI HELPERS ----------------
  isReadOnly(): boolean {
    if (!this.storePermission) {
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
    this.permissionForm.reset();
  }

  submit(): void {
    this.api.setTnxByStatus('S', this.storePermission.permissionId, 'Permissions').subscribe({
      next: (res) => {
        console.log('Submit response:', res);
        Swal.fire('Submitted!', 'Permission submitted successfully', 'success')
          .then(() => this.router.navigate(['/admin/permission-master-inquiry']));
      },
      error: err => console.error('Submit failed', err)
    });
  }

  reject(id: Number): void {
    if (!this.storePermission?.PermissionId) return;

    this.api.setTnxByStatus('I', this.storePermission.permissionId, 'Permissions').subscribe({
      next: () => {
        Swal.fire('Rejected!', 'Permission rejected successfully', 'success')
          .then(() => this.router.navigate(['/admin/permission-master-inquiry']));
      },
      error: err => console.error('Reject failed', err)
    });
  }

  approve(): void {
    if (!this.storePermission?.permissionId) return;

    this.api.setTnxByStatus('A', this.storePermission.permissionId, 'Permissions').subscribe({
      next: () => {
        Swal.fire('Approved!', 'Permission approved successfully', 'success')
          .then(() => this.router.navigate(['/admin/permission-master-inquiry']));
      },
      error: err => console.error('Approve failed', err)
    });
  }
  amend(PermissionId: String): void {
    if (!this.storePermission?.PermissionId) return;
    this.api.setTnxByStatus('I', this.storePermission.permissionId, 'Permissions').subscribe({
      next: () => {
        Swal.fire('Amended!', 'Permission moved to Draft for amendment', 'success')
          .then(() => this.router.navigate(['/admin/permission-master-inquiry']));
      },
      error: err => console.error('Amend failed', err)
    });
  }
  
}
