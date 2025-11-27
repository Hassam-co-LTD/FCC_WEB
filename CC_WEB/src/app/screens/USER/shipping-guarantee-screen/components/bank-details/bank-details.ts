import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-bank-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './bank-details.html',
  styleUrls: ['./bank-details.scss'],
})
export class BankDetails {
  isOpen = true;

  activeSection: string | null = 'bank';
  form: FormGroup;

  bankList = ['UBL', 'HBL', 'SAMBA'];
  currencyList = [
    { code: 'PKR', name: 'Pakistan Rupee' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'SAR', name: 'Saudi Riyal' },
    { code: 'IRR', name: 'Iran Rial' }
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      bankName: ['', Validators.required],
      IssuerReference: ['', Validators.required],
      currency: ['', Validators.required],
      guaranteeAmount: [0, Validators.required]
    });
  }
toggle(){
  this.isOpen = !this.isOpen;}


  incrementAmount() {
    const current = this.form.get('guaranteeAmount')?.value || 0;
    this.form.get('guaranteeAmount')?.setValue(current + 1);
  }

  decrementAmount() {
    const current = this.form.get('guaranteeAmount')?.value || 0;
    if (current > 0) {
      this.form.get('guaranteeAmount')?.setValue(current - 1);
    }
  }
}
