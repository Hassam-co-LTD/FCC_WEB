import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-undertaking-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatRadioModule,
    MatIconModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDatepickerModule
  ],
  templateUrl: './undertaking-details.html',
  styleUrls: ['./undertaking-details.scss'],
})
export class UndertakingDetails {
  undertakingForm!: FormGroup;
  isOpen = true;

  constructor(private fb: FormBuilder) { 
    this.undertakingForm = this.fb.group({
      typeOfUndertaking: [''],
      effectiveDate: [''],
      effectiveOption: ['openIssuance'],
      DemandOption: ['multipleDemandnot'],
      tsOption: ['bkstandard'],
      

      expiryType: ['fixed'],
      expiryDate: [''],
      expiryDaysAfter: [''],

      currency: [''],
      undertakingAmount: [''],

      variationPlus: [''],
      variationMinus: [''],

      issuanceCharges: ['applicant'],
      correspondentCharges: ['beneficiary'],

      supplementaryInfo: [''],

      increaseDecreaseType: ['regular'],
      basicextensionType: ['regular'],

      contractType: [''],
      languageType:['en'],
      governinglawsType:[''],
      contractDate: [''],
      contractCurrency: [''],
      contractAmount: [''],
      percentageCovered: [''],
      contractReference: [''],

      applicableRules: ['urdg']
    });
  }


  toggle() {
    this.isOpen = !this.isOpen;
  }
}
