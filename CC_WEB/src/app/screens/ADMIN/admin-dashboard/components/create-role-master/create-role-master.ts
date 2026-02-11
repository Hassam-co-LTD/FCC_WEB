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
  styleUrls: ['./create-role-master.scss']
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
    private location: Location
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadRole();
  }

  private buildForm(): void {
  this.roleForm = this.fb.group({
    roleId: ['', Validators.required],          // roleId from DTO
    roleDesc: ['', Validators.required],          // roleDesc from DTO
    roleDest: ['', Validators.required],          // roleDest from DTO
    roleStatus: ['Active', Validators.required],       // roleStatus from DTO, default 'A'
                            // optional, recordStatus, default 'I'
  });
}

  private loadRole(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Loading role with ID:', id);

    if (id) {
      this.isEditMode = true;

      this.api.getTnxByRolId(id, 'roles').subscribe({
        next: res => {
          this.storeRole = res;
          console.log('Get Role By ID:', res);
          this.roleForm.patchValue(res);
        },
        error: err => console.error('Load failed', err)
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
      Swal.fire('Saved!', 'Role saved successfully', 'success')
        .then(() => this.router.navigate(['/admin/role-master-inquiry']));
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
  update(id: String): void {
    if (this.roleForm.invalid) return;
    const payload = this.roleForm.getRawValue();

    this.api.updateTnxByRoleId(payload, 'roles', id).subscribe({
      next: () => {
        Swal.fire('Updated!', 'Role updated successfully', 'success')
          .then(() => this.router.navigate(['/admin/role-master-inquiry']));
      },
      error: err => console.error('Update failed', err)
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
    this.api.setStatusByRoleId('S', this.storeRole.roleId, 'roles').subscribe({
      next: (res) => {
        console.log('Submit response:', res);
        Swal.fire('Submitted!', 'Role submitted successfully', 'success')
          .then(() => this.router.navigate(['/admin/role-master-inquiry']));
      },
      error: err => console.error('Submit failed', err)
    });
  }

  reject(id: Number): void {
    if (!this.storeRole?.roleId) return;

    this.api.setStatusByRoleId('I', this.storeRole.roleId, 'roles').subscribe({
      next: () => {
        Swal.fire('Rejected!', 'Role rejected successfully', 'success')
          .then(() => this.router.navigate(['/admin/role-master-list']));
      },
      error: err => console.error('Reject failed', err)
    });
  }

  approve(roleId: String): void {
    if (!this.storeRole?.roleId) return;

    this.api.setStatusByRoleId('A', this.storeRole.roleId, 'roles').subscribe({
      next: () => {
        Swal.fire('Approved!', 'Role approved successfully', 'success')
          .then(() => this.router.navigate(['/admin/role-master-inquiry']));
      },
      error: err => console.error('Approve failed', err)
    });
  }
  amend(roleId: String): void {
    if (!this.storeRole?.roleId) return;
    this.api.setStatusByRoleId('I', this.storeRole.roleId, 'roles').subscribe({
      next: () => {
        Swal.fire('Amended!', 'Role moved to Draft for amendment', 'success')
          .then(() => this.router.navigate(['/admin/role-master-inquiry']));
      },
      error: err => console.error('Amend failed', err)
    });
  }
  
}
