import { Component, Input } from '@angular/core';

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
  isOpen = true;
  variationType: string = 'percent';
  resultText: string = '';
  currencies = ['USD', 'EUR', 'GBP', 'PKR', 'JPY'];

  ngOnInit() {
    // auto update result whenever form changes
    this.form.valueChanges.subscribe(() => {
      this.calculateVariation();
    });
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

  calculateVariation() {
    const amount = Number(this.form.get('amount')?.value) || 0;

    const variationPlus = Number(this.form.get('variationPlus')?.value) || 0;
    const variationMinus = Number(this.form.get('variationMinus')?.value) || 0;

    let plusValue = 0;
    let minusValue = 0;

    // ✅ CASE 1: Percentage
    if (this.variationType === 'percent') {
      plusValue = (amount * variationPlus) / 100;
      minusValue = (amount * variationMinus) / 100;
    }

    // ✅ CASE 2: Fixed Amount
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
