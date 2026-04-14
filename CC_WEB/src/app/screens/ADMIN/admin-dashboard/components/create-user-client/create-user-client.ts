import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
    MatNativeDateModule
  ],
  templateUrl: './create-user-client.html',
  styleUrls: ['./create-user-client.scss']
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
    private location: Location
  ) {}

UserData = {  
  loginId: '',
  userName: '',
  password: '',
  userCategory: '',
  companyId: '',
  appUserId: '',
}
  ngOnInit(): void {
    this.buildClientUserForm();
    this.loadClientUserDetails(); // ✅ user-details logic replaces old getTnxById
    this.loadCompanies();
    this.fetchAllRoles();
    this.loadDynamicFields();
  

  }

  // ================= CLIENT USER FORM =================
  private buildClientUserForm(): void {
    this.clientUserForm = this.fb.group({
      loginId: [this.userId, Validators.required],
      userName: ['', Validators.required],

      password: ['', Validators.required],
      userCategory: [''],
      companyId: ["", Validators.required],
      userStatus: ['']
    });
  }

  // ---------------- REPLACED LOGIC ----------------
  private loadClientUserDetails(): void {
  const id = this.route.snapshot.paramMap.get('id');

  if (id) {
    console.log('Loading client user with ID:', id);
    this.isEditMode = true;

    this.api.getTnxById(Number(id), "clientUsers").subscribe({
      next: (data: any) => {

        this.storeClientUser = data;
        this.clientUserForm.patchValue(data);

        // store dynamic fields
        this.storeDynamicFieldsResponse = data.dynamicFields || [];

        // ⚠️ DO NOT PATCH HERE DIRECTLY
        // wait until fields are loaded

        this.fetchAssignedRoles();
      },
      error: err => console.error('Error fetching client user details', err)
    });
  }
}

  private loadCompanies(): void {
    this.api.getTnxByStatus('A',"company").subscribe({
      next: companies =>{
           this.allCompanies = companies
           console.log('Fetched companies:', this.allCompanies);
      } ,
      error: err => console.error('Error fetching companies', err)
    });
  }

  onSave(): void {
  if (this.clientUserForm.invalid) return;

  const payload = {
    ...this.clientUserForm.getRawValue(),
    dynamicFields: this.getDynamicPayload() // ✅ ADD THIS
  };

  console.log('Saving client user with payload:', payload);

  this.api.saveTnx(payload, 'clientUsers').subscribe({
    next: res => {
      Swal.fire('Saved!', 'Client User saved successfully', 'success')
        .then(() => this.router.navigate(['/admin/user-client-inquiry']))
    },
    error: err => console.error('Save failed', err)
  });
}
 
 update(id: number): void {
  if (this.clientUserForm.invalid) return;

  const payload = {
    ...this.clientUserForm.getRawValue(),
    dynamicFields: this.getDynamicPayload() // ✅ ADD THIS
  };

  console.log('Updating the payload payload:', payload);

  this.api.updateTnx(payload, 'clientUsers', id).subscribe({
    next: (res) => {
      console.log('Client User updated successfully',res);
      Swal.fire('Updated!', 'Client User updated successfully', 'success')
      
      .then(() => this.router.navigate(['/admin/user-client-inquiry']))

    },
    error: err => console.error('Update failed', err)
  });
}
  activate(id: number): void {
    this.api.setTnxByStatus('Active', id, 'clientUser').subscribe({
      next: () => Swal.fire('Activated!', 'Client User is now Active', 'success')
        .then(() => this.loadClientUserDetails()),
      error: err => console.error('Activate failed', err)
    });
  }

  deactivate(id: number): void {
    this.api.setTnxByStatus('Inactive', id, 'clientUser').subscribe({
      next: () => Swal.fire('Deactivated!', 'Client User is now Inactive', 'success')
        .then(() => this.loadClientUserDetails()),
      error: err => console.error('Deactivate failed', err)
    });
  }

 isReadOnly(): boolean {
  return false;
}

  toggle(): void { this.isOpen = !this.isOpen; }
  onBack(): void { this.location.back(); }
  onCancel(): void { this.clientUserForm.reset(); }

  submit(): void {
    if (!this.storeClientUser?.id) return;
    this.api.setTnxByStatus('S', this.storeClientUser.id, 'clientUsers').subscribe({
      next: (res) => {
        console.log('Client User submitted successfully',res);
        Swal.fire('Submitted!', 'Client User submitted successfully', 'success')
          .then(() => this.router.navigate(['/admin/user-client-inquiry'], { queryParams: { tabName: "submitted" } } ));
      },
    
       
      error: err => console.error('Submit failed', err)
    });
  }

  reject(id: number): void {
    if (!this.storeClientUser?.id) return;
    this.api.setTnxByStatus('I', id, 'clientUsers').subscribe({
      next: () => Swal.fire('Rejected!', 'Client User rejected successfully', 'success')
        .then(() => this.router.navigate(['/admin/user-client-inquiry'], { queryParams: { tabName: "rejected" } } )),
      error: err => console.error('Reject failed', err)
    });
  }

  approve(id: number): void {
    if (!this.storeClientUser?.id) return;
    this.api.setTnxByStatus('A', id, 'clientUsers').subscribe({
      next: () => Swal.fire('Approved!', 'Client User approved successfully', 'success')
        .then(() => this.router.navigate(['/admin/user-client-inquiry'], { queryParams: { tabName: "approved" } } )),
      error: err => console.error('Approve failed', err)
    });
  }

  // ================= ROLES MANAGEMENT =================
  fetchAllRoles(): void {
    this.api.getTnxByStatus('A',"roles").subscribe({
      next: (roles: RoleMasterResponseDTO[]) => {
        this.userRoles = roles.filter(r => r.roleDest === 'B'); // Only BANK roles for client users
        console.log('Fetched all roles:', this.userRoles);
        this.fetchAssignedRoles();
      },
      error: err => console.error('Error fetching roles', err)
    });
  }

  fetchAssignedRoles(): void {
    if (!this.storeClientUser?.id || !this.userRoles.length) return;
    this.api.getRolesByUser(this.storeClientUser.id, 'user-roles').subscribe({
      next: (roleIds: string[]) => {
        this.selectedRoleIds = roleIds;
        this.userAssignedRoles = this.userRoles.filter(role => roleIds.includes(role.roleId));
      },
      error: err => console.error(err)
    });
  }

  toggleRoles(): void { this.isRolesOpen = !this.isRolesOpen; }

  assignRoles(): void {
    if (!this.storeClientUser?.id) return;
    const payload = this.selectedRoleIds.map(roleId => ({ userId: this.storeClientUser.id, roleId }));
    console.log('Assigning roles with payload:', payload);
    this.api.saveTnx(payload, 'user-roles').subscribe({
      next: (response: UsersRolesResponseDTO[]) => {
        const success = response.filter(r => r.status === 'SUCCESS');
        const duplicate = response.filter(r => r.status === 'DUPLICATE');
        const failed = response.filter(r => r.status === 'FAILED');
        if (success.length) Swal.fire('Success', `Roles assigned: ${success.map(r => r.roleId).join(', ')}`, 'success');
        if (duplicate.length) Swal.fire('Warning', `Already assigned: ${duplicate.map(r => r.roleId).join(', ')}`, 'warning');
        if (failed.length) Swal.fire('Error', `Failed: ${failed.map(r => r.roleId).join(', ')}`, 'error');
        this.fetchAssignedRoles();
      },
      error: err => Swal.fire('Error', 'Failed to assign roles', 'error')
    });
  }

  updateRoles(): void {
    if (!this.storeClientUser?.id) return;
    const payload: string[] = this.selectedRoleIds;
    this.api.updateTnxx(payload, `user-roles/update/${this.storeClientUser.id}`).subscribe({
      next: () => Swal.fire('Success', 'Roles updated successfully', 'success')
        .then(() => this.fetchAssignedRoles()),
      error: err => Swal.fire('Error', 'Failed to update roles', 'error')
    });
  }

  deleteRole(roleId: string): void {
    if (!this.storeClientUser?.id) return;
    const payload = { userId: this.storeClientUser.id, roleId };
    this.api.deleteTnx(payload, 'user-roles').subscribe({
      next: () => {
        Swal.fire('Deleted', 'Role removed successfully', 'success');
        this.selectedRoleIds = this.selectedRoleIds.filter(r => r !== roleId);
        this.userAssignedRoles = this.userAssignedRoles.filter(r => r.roleId !== roleId);
      },
      error: err => Swal.fire('Error', 'Failed to delete role', 'error')
    });
  }

  getRoleName(roleId: string): string {
    const role = this.userRoles.find(r => r.roleId === roleId);
    return role ? (role.roleDest || role.roleDesc) : roleId;
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
    error: (err: any) => console.error('Dynamic field load failed', err)
  });
}

// ================= PATCH DYNAMIC =================
private patchDynamicValues(): void {
  if (!this.dynamicFieldsForm || !this.fields?.length || !this.storeDynamicFieldsResponse?.length) return;

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

  return this.fields.map(f => ({
    fieldId: f.fieldId,
  value: this.dynamicFieldsForm.get(f.fieldId)?.value || '',
    loginId: this.clientUserForm.get('loginId')?.value || ''
  }));
}

// ================= TOGGLE =================
toggleDynamicFields(): void {
  this.isDynamicFieldsOpen = !this.isDynamicFieldsOpen;
}
}
