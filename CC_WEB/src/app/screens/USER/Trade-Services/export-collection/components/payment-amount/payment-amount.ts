import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

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
export class PaymentAmountComponent {
  @Input() form!: FormGroup; // Parent form group passed from export-collection
  isOpen = true;
  currencies = ['USD', 'EUR', 'GBP', 'PKR'];
  toggle() {
    this.isOpen = !this.isOpen;
  }
}
