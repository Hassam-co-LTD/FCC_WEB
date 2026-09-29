import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormGroup, ReactiveFormsModule } from '@angular/forms';

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

  currencies = ['USD', 'EUR', 'GBP', 'PKR', 'JPY'];

  @Input() form!: FormGroup;

  // Previous/rejected transaction values
  @Input() previousValues: { [key: string]: any } = {};

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
}