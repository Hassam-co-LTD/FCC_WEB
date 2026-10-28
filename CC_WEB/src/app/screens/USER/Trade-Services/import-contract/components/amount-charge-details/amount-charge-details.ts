import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import {
  ReactiveFormsModule,
  FormGroup
} from '@angular/forms';

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
  @Input() form!: FormGroup;

  @Input() previousValues: { [key: string]: any } = {};

  isOpen = true;

  variationType: string = 'percent';
  resultText: string = '';

  currencies = ['USD', 'EUR', 'GBP', 'PKR', 'JPY'];

  ngOnInit() {
    // Set variation type from form if already available
    this.variationType =
      this.form.get('variationType')?.value || 'percent';

    // Auto update result whenever form changes
    this.form.valueChanges.subscribe(() => {
      this.calculateVariation();
    });

    this.calculateVariation();
  }

  onVariationTypeChange(value: string) {
    this.variationType = value;

    this.form.patchValue({
      variationPlus: '',
      variationMinus: ''
    });

    this.calculateVariation();
  }

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

  // ==========================================
  // Calculate Variation
  // ==========================================

  calculateVariation() {
    const amount =
      Number(this.form.get('amount')?.value) || 0;

    const variationPlus =
      Number(this.form.get('variationPlus')?.value) || 0;

    const variationMinus =
      Number(this.form.get('variationMinus')?.value) || 0;

    let plusValue = 0;
    let minusValue = 0;

    // CASE 1: Percentage
    if (this.variationType === 'percent') {
      plusValue = (amount * variationPlus) / 100;
      minusValue = (amount * variationMinus) / 100;
    }

    // CASE 2: Fixed Amount
    else {
      plusValue = variationPlus;
      minusValue = variationMinus;
    }

    const addedAmount = amount + plusValue;
    const subtractedAmount = amount - minusValue;

    this.resultText =
      `Original Amount: ${amount}. ` +
      `After adding variation: ${addedAmount}. ` +
      `After subtracting variation: ${subtractedAmount}.`;
  }
}

