import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-payment-amount',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-amount.html',
  styleUrls: ['./payment-amount.scss'],
})
export class PaymentAmount {
  activeSection = 'payment';

  /** Reactive Form */
  form: FormGroup;

  /** Currency Options */
  currencies: string[] = ['USD', 'EUR', 'GBP', 'PKR'];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      amount: ['', Validators.required],
      currency: ['', Validators.required],
      paymentType: ['', Validators.required],
    });
  }

  /** Accordion Toggle */
  toggleSection(key: string) {
    this.activeSection = this.activeSection === key ? '' : key;
  }
}
