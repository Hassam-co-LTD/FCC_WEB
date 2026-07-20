import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-payment-amount',
  standalone: true,
  imports: [
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
  @Input() form!: FormGroup; // Parent form group passed from export-collection
  isOpen = true;
  currencies = ['USD', 'EUR', 'GBP', 'PKR'];

  constructor() {}

  ngOnInit(): void {}

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
