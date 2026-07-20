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

  currencies = ['USD', 'EUR', 'GBP', 'PKR', 'JPY'];

  constructor() {
  }

  onVariationTypeChange(value: string) {
    this.variationType = value;
    // Optionally clear fields when switching type:
    this.form.patchValue({
      variationPlus: '',
      variationMinus: ''
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
