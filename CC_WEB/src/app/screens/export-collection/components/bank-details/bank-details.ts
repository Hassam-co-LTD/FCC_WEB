import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-bank-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './bank-details.html',
  styleUrls: ['./bank-details.scss']
})
export class BankDetailsComponent implements OnInit {

  form!: FormGroup;

  activeSection: string | null = 'bankDetails';
  bankTab: string = 'remitting';

  bankList = [
    'Standard Chartered Bank',
    'Bank Al Habib',
    'Habib Bank Limited',
    'United Bank Limited',
    'Meezan Bank'
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
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

  toggleSection(section: string) {
    this.activeSection = this.activeSection === section ? null : section;
  }

  switchBankTab(tab: string) {
    this.bankTab = tab;
  }
}
