import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import Swal from 'sweetalert2';
import { ApiService } from '../../../../../../core/services/api.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    CommonModule
  ],
  templateUrl: './create-customer.html',
  styleUrls: ['./create-customer.scss']
})
export class CreateCustomer implements OnInit {

  customerForm!: FormGroup;
  storeCustomer: any;
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
     
      cId: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', Validators.required],
      legalId: [''],
      customerStatus: ['Active'],  // default Active
      branchCode: [''],
      countryCity: [''],
      customerType: ['Regular', Validators.required],
      address1: [''],
      address2: [''],
      address3: ['']
    });
  }

  private loadCustomer(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!isNaN(id)) {
      this.isEditMode = true;

      this.api.getCityById(id).subscribe({
        next: res => {
          this.storeCustomer = res;
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
        Swal.fire('Saved!', 'Customer saved successfully', 'success')
          .then(() => this.router.navigate(['/admin/customer-list']));
      },
      error: err => console.error('Save failed', err)
    });
  }

  // ---------------- UPDATE ----------------
  update(): void {
    if (this.customerForm.invalid) return;

    const payload = this.customerForm.getRawValue();

    this.api.updateTnx(payload, 'customer').subscribe({
      next: () => {
        Swal.fire('Updated!', 'Customer updated successfully', 'success')
          .then(() => this.router.navigate(['/admin/customer-list']));
      },
      error: err => console.error('Update failed', err)
    });
  }

  // ---------------- ACTIVATE / DEACTIVATE ----------------
  activate(id: number): void {
    this.api.setTnxByStatus('Active', id).subscribe({
      next: () => {
        Swal.fire('Activated!', 'Customer is now Active', 'success')
          .then(() => this.loadCustomer());
      },
      error: err => console.error('Activate failed', err)
    });
  }

  deactivate(id: number): void {
    this.api.setTnxByStatus('Inactive', id).subscribe({
      next: () => {
        Swal.fire('Deactivated!', 'Customer is now Inactive', 'success')
          .then(() => this.loadCustomer());
      },
      error: err => console.error('Deactivate failed', err)
    });
  }

  // ---------------- UI HELPERS ----------------
  isReadOnly(): boolean {
    return this.storeCustomer?.customerStatus === 'Inactive';
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
  submit(id:number): void {    
    if (!this.storeCustomer?.id) return;
    this.api.setTnxByStatus('S', this.storeCustomer.id).subscribe({
      next: () => {
        Swal.fire('Submitted!', 'Customer submitted successfully', 'success')
          .then(() => this.router.navigate(['/admin/customer-list']));
      },  
      error: err => console.error('Submit failed', err)
    });
  }

  reject(id:number): void { 
    if (!this.storeCustomer?.id) return;
    this.api.setTnxByStatus('R', this.storeCustomer.id).subscribe({
      next: () => {
        Swal.fire('Rejected!', 'Customer rejected successfully', 'success')
          .then(() => this.router.navigate(['/admin/customer-list']));
      },
      error: err => console.error('Reject failed', err)
    });
  } 

  approve(id:number): void {  
    if (!this.storeCustomer?.id) return;    

    this.api.setTnxByStatus('A', this.storeCustomer.id).subscribe({   
      next: () => {
        Swal.fire('Approved!', 'Customer approved successfully', 'success')
          .then(() => this.router.navigate(['/admin/customer-list']));
      },
      error: err => console.error('Approve failed', err)
    });
  } 


}
