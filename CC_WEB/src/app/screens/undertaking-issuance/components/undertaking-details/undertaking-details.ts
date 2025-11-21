import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-undertaking-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './undertaking-details.html',
  styleUrls: ['./undertaking-details.scss']
})
export class UndertakingDetails {

  isOpen: boolean = true;

  undertakingdetails!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.undertakingdetails = this.fb.group({
      // TYPE & CATEGORY
      typeOfUndertaking: [null, Validators.required],

      // EFFECTIVE DATE OPTIONS
      effectiveOption: [null, Validators.required],

      // EXPIRY TYPE
      expiryType: [null, Validators.required],
      expiryDate: [null],

      // AMOUNT & CURRENCY
      currency: [null, Validators.required],
      undertakingAmount: [null, Validators.required],
      variationPlus: [0],
      variationMinus: [0],

      // CHARGES
      issuanceCharges: [null, Validators.required],
      correspondentCharges: [null, Validators.required],

      supplementaryInfo: [''],

      // EXTENSION TYPE
      basicextensionType: [null, Validators.required],

      // INCREASE / DECREASE
      increaseDecreaseType: [null, Validators.required],

      // CONTRACT INFO
      // contractType: ['sale'],
      // contractDate: [null],
      // contractCurrency: [null],
      // contractAmount: [null],
      // percentageCovered: [null],
      // contractReference: [''],

      // APPLICABLE RULES
      applicableRules: [null, Validators.required],

      // GOVERNING LAWS
      governinglawsType: [null],
      subdivision: [''],
      jurisdiction: [''],

      // DEMAND INDICATOR
      DemandOption: [null],

      // TEXT STANDARD
      tsOption: [null],

      // LANGUAGE
      languageType: [null],

      // TEXT FIELDS
      textofundertakingInfo: [''],
      underlyingtransactionInfo: ['', Validators.required],
      presentationInfo: ['']
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
}