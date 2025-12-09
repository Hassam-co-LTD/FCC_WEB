import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../../../../core/services/admin-service/customer-form-service/customer-service';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatIconModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './create-customer.html',
  styleUrls: ['./create-customer.scss']
})
export class CreateCustomer implements OnInit {
  customerForm!: FormGroup;

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
      LegalID: [''],
      Branch_Code: [''],
      Ctry_City: [''],
      Customer_Type: ['Regular', Validators.required],
      Address1: [''],
      Address2: [''],
      Address3: [''],
      createdOn: [''],
      createdBy: [''],
      updatedOn: [''],
      putOn: [''],
      putById: ['']
    });
  }

  onCancel() {
    this.customerForm.reset();
  }

  onSave() {
    if (this.customerForm.dirty) {
      console.log('Form saved:', this.customerForm.value);
    }
  }

  onSubmit() {
    if (this.customerForm.valid) {
      this.customerService.saveCustomerData(this.customerForm.value);
      console.log("Data submitted", this.customerForm.value);
      this.router.navigate(['/admin/showCustomerDetails']);
    }
  }
}
