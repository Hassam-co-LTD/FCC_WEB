import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { SharedService } from '../../../../../core/services/user-service/shared-form-service/shared-service';
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
export class BankDetails implements OnInit {

  isOpen = true;
  activeSection: string | null = 'bank';
  form!: FormGroup;

  bankList = ['UBL', 'HBL', 'SAMBA'];
  currencyList = [
    { code: 'PKR', name: 'Pakistan Rupee' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'SAR', name: 'Saudi Riyal' },
    { code: 'IRR', name: 'Iran Rial' }
  ];

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
  this.form = this.fb.group({
    bankName: ['', Validators.required],         // keep bank name if needed
    issuerReference: ['', Validators.required],
    currency: ['', Validators.required],
    swiftCode: [''],                             // new field for SWIFT Code
    guaranteeAmount: [0, [Validators.required, Validators.min(1)]]
  });

  // Restore existing data if available
  const existingData = this.sharedService.getFormData();
  if (existingData?.bankDetails) {
    this.form.patchValue(existingData.bankDetails);
  }

  // Auto-save to shared service for preview
  this.form.valueChanges.subscribe(value => {
    const data = this.sharedService.getFormData() || {};
    this.sharedService.setFormData({
      ...data,
      bankDetails: value
    });
  });
}


  toggle() {
    this.isOpen = !this.isOpen;
  }

  incrementAmount() {
    const current = this.form.get('guaranteeAmount')?.value || 0;
    this.form.get('guaranteeAmount')?.setValue(current + 1);
  }

  decrementAmount() {
    const current = this.form.get('guaranteeAmount')?.value || 0;
    if (current > 1) {
      this.form.get('guaranteeAmount')?.setValue(current - 1);
    }
  }
}
