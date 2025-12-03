import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
export class PaymentDetails {
  @Input() form!: FormGroup;
  isOpen = true;


  creditAvailableWithOptions = ['Issuing Bank', 'Advising Bank', 'Any Bank in Country'];
  creditAvailableByOptions = ['Payment', 'Acceptance', 'Negotiation', 'Deferred Payment'];
  paymentDraftOptions = ['Sight', 'Usance', 'Deferred'];

  constructor() {
    
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
