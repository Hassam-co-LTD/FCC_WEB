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
import { MatNativeDateModule } from '@angular/material/core'; // or MatMomentDateModule if using Moment

import Swal from 'sweetalert2';
import { ApiService } from '../../../../../../core/services/api.service';

@Component({
  selector: 'app-customer-profile',
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
    MatButtonModule,

    
  ],
  templateUrl: './customer-branch.html',
  styleUrls: ['./customer-branch.scss']
})
export class CustomerBranch implements OnInit {

  branchForm!: FormGroup;
  storeBranch: any = {};
  storeCities: any[] = [];

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
    this.loadBranch();
    this.getAllCities();
  }

  private buildForm(): void {
  this.branchForm = this.fb.group({
    branchCode: [''],
    branchName: [''],
    branchAddress: [''],
    swiftAddress: [''],
    emailAddress: [''],
    localCurrency: [''],
    status: [''],        // D / A / S
    recordStatus: [''],  // optional
    cityId: [''],        // CityMaster reference (ID)
    contactPerson: [''],
    contactNo: ['']
  });
}


  private loadBranch(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Loading branch with ID:', id);
     if (!isNaN(id)) {
      this.isEditMode = true;

      this.api.getTnxById(id,"branch").subscribe({
        next: res => {
          this.storeBranch = res;
          console.log('get Branch By:', res);
          this.branchForm.patchValue(res);
        },
        error: err => console.error('Load failed', err)
      });
    }
  }

  // ---------------- CREATE ----------------
  onSave(): void {
    if (this.branchForm.invalid) return;

    const payload = this.branchForm.getRawValue();
    console.log('Payload to save:', payload);
    
    this.api.saveTnx(payload, 'branch').subscribe({
      next: res => {
        console.log("Saved response:", res);
        Swal.fire('Saved!', 'Branch saved successfully', 'success')
          .then(() => this.router.navigate(['/admin/branch-list'], { queryParams: { tabName: 'Draft' } } ));
      },
      error: err => console.error('Save failed', err)
    });
  }

  // ---------------- UPDATE ----------------
  update(id:number): void {
    if (this.branchForm.invalid) return;

    const payload = this.branchForm.getRawValue();

    this.api.updateTnx(payload, 'branch',id).subscribe({
      next: () => {
        Swal.fire('Updated!', 'Branch updated successfully', 'success')
          .then(() => this.router.navigate(['/admin/create-branch', id]));
      },
      error: err => console.error('Update failed', err)
    });
  }

  
  activate(id: number): void {
    this.api.setTnxByStatus('Active', id, 'branch').subscribe({
      next: () => {
        Swal.fire('Activated!', 'Branch is now Active', 'success')
          .then(() => this.loadBranch());
      },
      error: err => console.error('Activate failed', err)
    });
  }

  deactivate(id: number): void {
    this.api.setTnxByStatus('Inactive', id, 'branch').subscribe({
      next: () => {
        Swal.fire('Deactivated!', 'Branch is now Inactive', 'success')
          .then(() => this.loadBranch());
      },
      error: err => console.error('Deactivate failed', err)
    });
  }

  // ---------------- UI HELPERS ----------------
 isReadOnly(): boolean {
  // New branch (no storeBranch) → editable
  if (!this.storeBranch) {
    return false;
  }

  // Existing branch:
  // - Draft (D) → editable
  // - Submitted (S), Approved (A) → read-only
  return this.storeBranch.status !== 'D';
} 



  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  onBack(): void {
    this.location.back();
  }

  onCancel(): void {
    this.branchForm .reset();
  }
  submit() {    
    if (!this.storeBranch?.id) return;
    this.api.setTnxByStatus('S', this.storeBranch.id, 'branch').subscribe({
      next: (res) => {
        console.log('Submited response:', res);
        Swal.fire('Submitted!', 'Branch submitted successfully', 'success')
          .then(() => this.router.navigate(['/admin/branch-list'],{ queryParams: { tabName: 'submitted' } }));
      },  
      error: err => console.error('Submit failed', err)
    });
  }

 


  reject(id:number): void { 
    if (!this.storeBranch?.id) return;
    this.api.setTnxByStatus('I', this.storeBranch.id, 'branch').subscribe({
      next: () => {
        Swal.fire('Rejected!', 'Branch rejected successfully', 'success')
          .then(() => this.router.navigate(['/admin/branch-list'],{ queryParams: { tabName: 'Rejected' } }));
      },
      error: err => console.error('Reject failed', err)
    });
  } 

  approve(id: number): void {
  if (!this.storeBranch?.id) return;

  this.api.setTnxByStatus('A', this.storeBranch.id, 'branch').subscribe({
    next: () => {
      Swal.fire('Approved!', 'Branch approved successfully', 'success')
        .then(() => 
          this.router.navigate(['/admin/branch-list'], { queryParams: { tabName: 'approved' } })
        );
    },
    error: err => console.error('Approve failed', err)
  });
}
// get All Cities for dropdown
getAllCities(): void {
 this.api.getTnxByStatus('A',"city").subscribe({
  next: res => {
    this.storeCities = res;
    console.log('Active cities for dropdown:', res);
    console.log('All cities:', res);
  },
  error: err => console.error('Failed to load cities', err)

})
}
}