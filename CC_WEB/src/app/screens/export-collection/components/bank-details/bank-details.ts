import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-bank-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bank-details.html',
  styleUrls: ['./bank-details.scss'],
})
export class BankDetailsComponent {
  
  activeSection: string = 'bankDetails';
  bankTab: string = 'remitting';

  bankList = [
    'Bank of America',
    'Habib Bank Limited',
    'Meezan Bank',
    'Standard Chartered',
    'Faysal Bank',
    'United Bank Limited'
  ];

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({

      // Remitting
      remittingBankName: [''],
      remittingIssuerRef: [''],
      principalAccount: [''],
      feeAccount: [''],

      // Presenting
      presentingBankName: [''],
      presentingAddress1: [''],
      presentingAddress2: [''],

      // Collecting
      collectingBankName: [''],
      collectingSwiftCode: [''],
      collectingReference: ['']
    });
  }

  toggleSection(key: string) {
    this.activeSection = this.activeSection === key ? '' : key;
  }

  switchBankTab(tab: string) {
    this.bankTab = tab;
  }
}
