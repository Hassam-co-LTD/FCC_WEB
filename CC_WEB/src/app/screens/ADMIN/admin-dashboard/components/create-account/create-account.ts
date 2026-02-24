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
  templateUrl: './create-account.html',
  styleUrls: ['./create-account.scss']
})
export class Accounts implements OnInit {

  AccountsForm!: FormGroup;
  storeAccounts: any = {};
  allCompanies : any = {};
  
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
    this.loadAccounts();
    this.loadCompanies()
  }

  private buildForm(): void {
    this.AccountsForm = this.fb.group({
     
       accountNo: ['', Validators.required],
    iban: ['', Validators.required],
    accountType: ['', Validators.required],
    accountTitle: ['', Validators.required],
    accountStatus: ['', Validators.required],
    companyId:['',Validators.required]
    });
  }

  private loadAccounts(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Loading Accounts with ID:', id);
     if (!isNaN(id)) {
      this.isEditMode = true;

      this.api.getTnxById(id,"accounts").subscribe({
        next: res => {
          this.storeAccounts = res;
          console.log('get Accounts By:', res);
          this.AccountsForm.patchValue(res);
        },
        error: err => console.error('Load failed', err)
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

  // ---------------- CREATE ----------------
  onSave(): void {
    if (this.AccountsForm.invalid) return;

    const payload = this.AccountsForm.getRawValue();
    console.log('Payload to save:', payload);
    
    this.api.saveTnx(payload, 'accounts').subscribe({
      next: res => {
        console.log("Saved response:", res);
        Swal.fire('Saved!', 'Accounts saved successfully', 'success')
          .then(() => this.router.navigate(['/admin/accounts-list'], { queryParams: { tabName: 'Draft' } } ));
      },
      error: err => console.error('Save failed', err)
    });
  }

  // ---------------- UPDATE ----------------
  update(id:number): void {
    console.log("updated Account to send",this.AccountsForm.value);
    if (this.AccountsForm.invalid) return;

    const payload = this.AccountsForm.getRawValue();

    this.api.updateTnx(payload, 'accounts',id).subscribe({
      next: () => {
        Swal.fire('Updated!', 'Accounts updated successfully', 'success')
          .then(() => this.router.navigate(['/admin/edit-accounts', id]));
      },
      error: err => console.error('Update failed', err)
    });
  }

  
  activate(id: number): void {
    this.api.setTnxByStatus('Active', id, 'accounts').subscribe({
      next: () => {
        Swal.fire('Activated!', 'Accounts is now Active', 'success')
          .then(() => this.loadAccounts());
      },
      error: err => console.error('Activate failed', err)
    });
  }

  deactivate(id: number): void {
    this.api.setTnxByStatus('Inactive', id, 'accounts').subscribe({
      next: () => {
        Swal.fire('Deactivated!', 'Accounts is now Inactive', 'success')
          .then(() => this.loadAccounts());
      },
      error: err => console.error('Deactivate failed', err)
    });
  }

  // ---------------- UI HELPERS ----------------
 isReadOnly(): boolean {
  // New customer (no storeCustomer) → editable
  if (this.storeAccounts?.id) return false;{
    return true;
  }

  // Existing customer:
  // - Draft (D) → editable
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
    this.AccountsForm.reset();
  }
  submit() {    
    if (!this.storeAccounts?.id) return;
    this.api.setTnxByStatus('S', this.storeAccounts.id, 'accounts').subscribe({
      next: (res) => {
        console.log('Submited response:', res);
        Swal.fire('Submitted!', 'Accounts submitted successfully', 'success')
          .then(() => this.router.navigate(['/admin/accounts-inquiry', this.storeAccounts.id],{ queryParams: { tabName: 'submitted' } }));
      },  
      error: err => console.error('Submit failed', err)
    });
  }

 


  reject(id:number): void { 
    if (!this.storeAccounts?.id) return;
    this.api.setTnxByStatus('I', this.storeAccounts.id, 'accounts').subscribe({
      next: () => {
        Swal.fire('Rejected!', 'Accounts rejected successfully', 'success')
          .then(() => this.router.navigate(['/admin/accounts-inquiry', this.storeAccounts.id],{ queryParams: { tabName: 'Rejected' } }));
      },
      error: err => console.error('Reject failed', err)
    });
  } 

  approve(id: number): void {
  if (!this.storeAccounts?.id) return;

  this.api.setTnxByStatus('A', this.storeAccounts.id, 'accounts').subscribe({
    next: () => {
      Swal.fire('Approved!', 'Accounts approved successfully', 'success')
        .then(() => 
          this.router.navigate(['/admin/accounts-inquiry', this.storeAccounts.id], { queryParams: { tabName: 'approved' } })
        );
    },
    error: err => console.error('Approve failed', err)
  });
}

// delete an account

  deleteAccount(id: number): void {

  if (!id) {
    Swal.fire('Warning', 'Invalid account id', 'warning');
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {

    if (result.isConfirmed) {

      this.api.deleteAccount(id, 'accounts').subscribe({
        next: (res: any) => {

          Swal.fire('Deleted', res?.message || 'Account removed successfully', 'success');

          // 🔹 Refresh list after delete
          this.loadAccounts();   // make sure this method reloads accounts
        },

        error: (err) => {

          const errorMessage = err?.error?.message || 'Failed to delete account';

          Swal.fire('Error', errorMessage, 'error');
        }
      });

    }

  });
}


}
