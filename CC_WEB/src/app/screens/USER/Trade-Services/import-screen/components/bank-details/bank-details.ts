
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-bank-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatOptionModule,
    MatIcon,
  ],
  templateUrl: './bank-details.html',
  styleUrl: './bank-details.scss',
})
export class BankDetails {

  selectedTab = 0;

  isOpen = true;

  @Input() form!: FormGroup;

  @Input() previousValues: { [key: string]: any } = {};

  bankList: string[] = [
    'National Bank Of Pakistan (NBP)',
    'Habib Bank Limited (HBL)',
    'United Bank Limited (UBL)',
    'MCB Bank',
    'Standard Chartered Bank',
    'Bank Alfalah',
  ];

  constructor() {}

  toggle() {
    this.isOpen = !this.isOpen;
  }

  // ==========================================
  // Previous Value Helpers
  // ==========================================

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

