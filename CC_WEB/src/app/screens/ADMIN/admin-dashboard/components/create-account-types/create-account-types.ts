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
import { ApiService } from '../../../../../core/services/api.service';
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
  templateUrl: './create-account-types.html',
  styleUrls: ['./create-account-types.scss']
})
export class CustomerAccountMaster implements OnInit {

  accountForm!: FormGroup;
  storeAccountMaster: any = {};
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
    this.loadAccountMaster();
    this.getAllCities();
  }

  
  private buildForm(): void {
  this.accountForm = this.fb.group({
    typeName: [''],        // Account Type Name
    description: [''],     // Description of the account type
    accountStatus: ['Active'] // Active / Inactive
  });
}


  private loadAccountMaster(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Loading AccountMaster with ID:', id);
     if (!isNaN(id)) {
      this.isEditMode = true;

      this.api.getTnxById(id,"AccountMaster").subscribe({
        next: res => {
          this.storeAccountMaster = res;
          console.log('get AccountMaster By:', res);
          this.accountForm.patchValue(res);
        },
        error: err => console.error('Load failed', err)
      });
    }
  }

  // ---------------- CREATE ----------------
  onSave(): void {
    if (this.accountForm.invalid) return;

    const payload = this.accountForm.getRawValue();
    console.log('Payload to save:', payload);
    
    this.api.saveTnx(payload, 'AccountMaster').subscribe({
      next: res => {
        console.log("Saved response:", res);
        Swal.fire('Saved!', 'AccountMaster saved successfully', 'success')
          .then(() => this.router.navigate(['/admin/AccountMaster-list'], { queryParams: { tabName: 'Draft' } } ));
      },
      error: err => console.error('Save failed', err)
    });
  }

  // ---------------- UPDATE ----------------
  update(id:number): void {
    if (this.accountForm.invalid) return;

    const payload = this.accountForm.getRawValue();

    this.api.updateTnx(payload, 'AccountMaster',id).subscribe({
      next: () => {
        Swal.fire('Updated!', 'AccountMaster updated successfully', 'success')
          .then(() => this.router.navigate(['/admin/create-AccountMaster', id]));
      },
      error: err => console.error('Update failed', err)
    });
  }

  
  activate(id: number): void {
    this.api.setTnxByStatus('Active', id, 'AccountMaster').subscribe({
      next: () => {
        Swal.fire('Activated!', 'AccountMaster is now Active', 'success')
          .then(() => this.loadAccountMaster());
      },
      error: err => console.error('Activate failed', err)
    });
  }

  deactivate(id: number): void {
    this.api.setTnxByStatus('Inactive', id, 'AccountMaster').subscribe({
      next: () => {
        Swal.fire('Deactivated!', 'AccountMaster is now Inactive', 'success')
          .then(() => this.loadAccountMaster());
      },
      error: err => console.error('Deactivate failed', err)
    });
  }

  // ---------------- UI HELPERS ----------------
 isReadOnly(): boolean {
  // New AccountMaster (no storeAccountMaster) → editable
  if (!this.storeAccountMaster) {
    return true;
  }

  // Existing AccountMaster:
  // - Draft (D) → editable
  // - Submitted (S), Approved (A) → read-only
  // return  → editable
  // - Submitted (S), Approved (A) → read-only
  return false;
} 



  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  onBack(): void {
    this.location.back();
  }

  onCancel(): void {
    this.accountForm .reset();
  }
  submit() {    
    if (!this.storeAccountMaster?.id) return;
    this.api.setTnxByStatus('S', this.storeAccountMaster.id, 'AccountMaster').subscribe({
      next: (res) => {
        console.log('Submited response:', res);
        Swal.fire('Submitted!', 'AccountMaster submitted successfully', 'success')
          .then(() => this.router.navigate(['/admin/AccountMaster-list'],{ queryParams: { tabName: 'submitted' } }));
      },  
      error: err => console.error('Submit failed', err)
    });
  }

 


  reject(id:number): void { 
    if (!this.storeAccountMaster?.id) return;
    this.api.setTnxByStatus('I', this.storeAccountMaster.id, 'AccountMaster').subscribe({
      next: () => {
        Swal.fire('Rejected!', 'AccountMaster rejected successfully', 'success')
          .then(() => this.router.navigate(['/admin/AccountMaster-list'],{ queryParams: { tabName: 'Rejected' } }));
      },
      error: err => console.error('Reject failed', err)
    });
  } 

  approve(id: number): void {
  if (!this.storeAccountMaster?.id) return;

  this.api.setTnxByStatus('A', this.storeAccountMaster.id, 'AccountMaster').subscribe({
    next: () => {
      Swal.fire('Approved!', 'AccountMaster approved successfully', 'success')
        .then(() => 
          this.router.navigate(['/admin/AccountMaster-list'], { queryParams: { tabName: 'approved' } })
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