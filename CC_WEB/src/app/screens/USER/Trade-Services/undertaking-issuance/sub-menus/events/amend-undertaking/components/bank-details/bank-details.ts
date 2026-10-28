import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bank-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './bank-details.html',
  styleUrl: './bank-details.scss',
})
export class BankDetails {
  @Input() form!: FormGroup;
  @Input() previousValues: { [key: string]: any } = {};

  isOpen = true;

  // TODO: replace with your real option codes
  issuanceTypes = [
    { value: 'direct', label: 'Direct' },
    { value: 'indirect', label: 'Indirect' },
  ];
  countries = ['Pakistan', 'UAE', 'USA', 'UK', 'Japan'];

  bankFields = [
    { key: 'recipientBankName', label: 'Recipient Bank Name' },
    { key: 'issuerReference', label: "Issuer's Reference" },
    { key: 'swiftcode', label: 'SWIFT Code' },
    { key: 'bankName', label: 'Bank Name' },
    { key: 'bankAddress1', label: 'Address 1' },
    { key: 'bankAddress2', label: 'Address 2' },
    { key: 'bankAddress3', label: 'Address 3' },
    { key: 'bankAddress4', label: 'Address 4' },
  ];

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  hasPreviousValue(field: string): boolean {
    const v = this.previousValues?.[field];
    return v !== null && v !== undefined && String(v).trim() !== '';
  }

  getPreviousValue(field: string): any {
    return this.previousValues?.[field] ?? '';
  }
}