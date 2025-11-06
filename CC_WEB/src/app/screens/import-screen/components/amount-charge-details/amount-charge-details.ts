import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-amount-charge-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule
  ],
  templateUrl: './amount-charge-details.html',
  styleUrls: ['./amount-charge-details.scss']
})
export class AmountChargeDetails {
  amountChargeForm: FormGroup;
  isOpen = true;

  currencies = ['USD', 'EUR', 'GBP', 'PKR', 'JPY'];

  constructor(private fb: FormBuilder) {
    this.amountChargeForm = this.fb.group({
      currency: ['', Validators.required],
      amount: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      variationPlus: [''],
      variationMinus: [''],
      issuingBankCharges: ['Applicant', Validators.required],
      outsideCountryCharges: ['Beneficiary', Validators.required],
      additionalAmountDetails: ['', Validators.maxLength(140)]
    });
  }

  toggle(){
    this.isOpen = !this.isOpen;
  }
  onSubmit() {
    if (this.amountChargeForm.valid) {
      console.log('Form Submitted:', this.amountChargeForm.value);
    }
  }
}
