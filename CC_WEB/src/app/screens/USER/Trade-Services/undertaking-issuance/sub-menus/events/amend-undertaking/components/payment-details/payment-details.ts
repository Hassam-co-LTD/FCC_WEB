import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-payment-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './payment-details.html',
  styleUrls: ['./payment-details.scss']
})
export class PaymentDetails implements OnInit {

  @Input() previousValues: { [key: string]: any } = {};

  isOpen = true;

  paymentForm: FormGroup;

  creditAvailableWithOptions = [
    'Issuing Bank',
    'Advising Bank',
    'Any Bank in Country'
  ];

  creditAvailableByOptions = [
    'Payment',
    'Acceptance',
    'Negotiation',
    'Deferred Payment'
  ];

  paymentDraftOptions = [
    'Sight',
    'Usance',
    'Deferred'
  ];

  constructor(private fb: FormBuilder) {
    this.paymentForm = this.fb.group({
      creditAvailableWith: ['', Validators.required],
      bankName: [''],
      creditAvailableBy: ['Payment', Validators.required],
      paymentDraftAt: ['Sight', Validators.required]
    });
  }

  ngOnInit(): void {
    // Previous values are supplied by the parent component.
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  hasPreviousValue(field: string): boolean {
    return (
      this.previousValues &&
      Object.prototype.hasOwnProperty.call(this.previousValues, field) &&
      this.previousValues[field] !== null &&
      this.previousValues[field] !== undefined &&
      String(this.previousValues[field]).trim() !== ''
    );
  }

  getPreviousValue(field: string): any {
    return this.previousValues?.[field] ?? '';
  }

  onSubmit() {
    if (this.paymentForm.valid) {
      console.log('Payment Details:', this.paymentForm.value);
    } else {
      this.paymentForm.markAllAsTouched();
    }
  }
}
