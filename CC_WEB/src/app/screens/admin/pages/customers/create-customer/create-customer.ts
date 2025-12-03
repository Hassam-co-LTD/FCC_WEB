import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../customer-service';
import { Router } from '@angular/router';
import { NgModel } from '@angular/forms';
import { NgModule } from '@angular/core';
@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-customer.html',
  styleUrls: ['./create-customer.scss']
})
export class CreateCustomer implements OnInit {


  
  customerForm!: FormGroup;

  createdOn = '2025-12-01';
  createdBy = 'Admin User';
  updatedOn = '2025-12-01';

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router
  ) {}

ngOnInit(): void {
  this.customerForm = this.fb.group({
    Name: ['', Validators.required],
    Email: ['', [Validators.required, Validators.email]],
    Contact: ['', Validators.required],
    Status: ['Active', Validators.required],
    L_ID: [''],
    Branch_Code: [''],
    Ctry_City: [''],
    Customer_Type: ['Regular', Validators.required],
    Company_ID: [''],           // added Company ID
    Address1: [''],             // added Address Line 1
    Address2: [''],             // added Address Line 2
    Address3: [''],             // added Address Line 3
    createdOn: [''],
    createdBy: [''],
    updatedOn: [''],
    putOn: [''],                // InputerID
    putById: ['']               // AuthorizedID
  });
}

  onCancel() {
    this.customerForm.reset();
  }

  onSave() {
    if (this.customerForm.dirty) {
      console.log('Form saved:', this.customerForm.value);
      // Call save API or store locally
    }
  }

 onSubmit() {
  if (this.customerForm.valid) {
    this.customerService.saveCustomerData(this.customerForm.value);
     console.log("data submitted", this.customerForm.value)
    // Redirect inside admin layout
    this.router.navigate(['/admin/showCustomerDetails']);
  }
}



}
