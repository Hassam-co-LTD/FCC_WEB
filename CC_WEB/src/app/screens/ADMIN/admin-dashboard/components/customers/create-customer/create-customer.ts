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
  templateUrl: './create-customer.html',
  styleUrls: ['./create-customer.scss']
})
export class CreateCustomer implements OnInit {

  customerForm!: FormGroup;
  storeCustomer: any = {};

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
    this.loadCustomer();
  }

  private buildForm(): void {
    this.customerForm = this.fb.group({
     
      custId: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', Validators.required],
      legalId: [''],
      customerStatus: ['Active'],  // default Active
      branchCode: [''],
      countryCity: [''],
      customerType: ['Regular', Validators.required],
      customerCategorty: ['Bank', Validators.required],
      address1: [''],
      address2: [''],
      address3: ['']
    });
  }

  private loadCustomer(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Loading customer with ID:', id);
     if (!isNaN(id)) {
      this.isEditMode = true;

      this.api.getTnxById(id,"customer").subscribe({
        next: res => {
          this.storeCustomer = res;
          console.log('get Customer By:', res);
          this.customerForm.patchValue(res);
        },
        error: err => console.error('Load failed', err)
      });
    }
  }

  // ---------------- CREATE ----------------
  onSave(): void {
    if (this.customerForm.invalid) return;

    const payload = this.customerForm.getRawValue();
    console.log('Payload to save:', payload);
    
    this.api.saveTnx(payload, 'customer').subscribe({
      next: res => {
        console.log("Saved response:", res);
        Swal.fire('Saved!', 'Customer saved successfully', 'success')
          .then(() => this.router.navigate(['/admin/customer-list'], { queryParams: { tabName: 'Draft' } } ));
      },
      error: err => console.error('Save failed', err)
    });
  }

  // ---------------- UPDATE ----------------
  update(id:number): void {
    if (this.customerForm.invalid) return;

    const payload = this.customerForm.getRawValue();

    this.api.updateTnx(payload, 'customer',id).subscribe({
      next: () => {
        Swal.fire('Updated!', 'Customer updated successfully', 'success')
          .then(() => this.router.navigate(['/admin/create-customer', id]));
      },
      error: err => console.error('Update failed', err)
    });
  }

  
  activate(id: number): void {
    this.api.setTnxByStatus('Active', id, 'customer').subscribe({
      next: () => {
        Swal.fire('Activated!', 'Customer is now Active', 'success')
          .then(() => this.loadCustomer());
      },
      error: err => console.error('Activate failed', err)
    });
  }

  deactivate(id: number): void {
    this.api.setTnxByStatus('Inactive', id, 'customer').subscribe({
      next: () => {
        Swal.fire('Deactivated!', 'Customer is now Inactive', 'success')
          .then(() => this.loadCustomer());
      },
      error: err => console.error('Deactivate failed', err)
    });
  }

  // ---------------- UI HELPERS ----------------
 isReadOnly(): boolean {
  // New customer (no storeCustomer) → editable
  if (!this.storeCustomer) {
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
    this.customerForm.reset();
  }
  submit() {    
    if (!this.storeCustomer?.id) return;
    this.api.setTnxByStatus('S', this.storeCustomer.id, 'customer').subscribe({
      next: (res) => {
        console.log('Submited response:', res);
        Swal.fire('Submitted!', 'Customer submitted successfully', 'success')
          .then(() => this.router.navigate(['/admin/customer-list'],{ queryParams: { tabName: 'submitted' } }));
      },  
      error: err => console.error('Submit failed', err)
    });
  }

 


  reject(id:number): void { 
    if (!this.storeCustomer?.id) return;
    this.api.setTnxByStatus('I', this.storeCustomer.id, 'customer').subscribe({
      next: () => {
        Swal.fire('Rejected!', 'Customer rejected successfully', 'success')
          .then(() => this.router.navigate(['/admin/customer-list'],{ queryParams: { tabName: 'Rejected' } }));
      },
      error: err => console.error('Reject failed', err)
    });
  } 

  approve(id: number): void {
  if (!this.storeCustomer?.id) return;

  this.api.setTnxByStatus('A', this.storeCustomer.id, 'customer').subscribe({
    next: () => {
      Swal.fire('Approved!', 'Customer approved successfully', 'success')
        .then(() => 
          this.router.navigate(['/admin/customer-list'], { queryParams: { tabName: 'approved' } })
        );
    },
    error: err => console.error('Approve failed', err)
  });
}


}
