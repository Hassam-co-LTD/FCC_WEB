import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-payment-amount',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './payment-amount.html',
  styleUrls: ['./payment-amount.scss']
})
export class PaymentAmountComponent implements OnInit {

  form!: FormGroup;
  activeSection: string | null = 'paymentAmount';

  currencies = ['USD', 'EUR', 'GBP', 'PKR'];
  
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      amount: ['', Validators.required],
      currency: ['', Validators.required],
      paymentType: ['', Validators.required],
      tenor: ['', Validators.required],
      paymentReference: ['']
    });
  }

  toggleSection(section: string) {
    this.activeSection = this.activeSection === section ? null : section;
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('Payment & Amount Submitted', this.form.value);
    }
  }
}
