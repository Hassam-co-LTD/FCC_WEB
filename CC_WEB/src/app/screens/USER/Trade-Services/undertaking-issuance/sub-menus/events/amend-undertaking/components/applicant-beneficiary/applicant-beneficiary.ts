import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-applicant-beneficiary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './applicant-beneficiary.html',
  styleUrl: './applicant-beneficiary.scss',
})
export class ApplicantBeneficiary {
  @Input() form!: FormGroup;
  @Input() previousValues: { [key: string]: any } = {};

  isOpen = true;

  countries = ['Pakistan', 'UAE', 'USA', 'UK', 'Japan'];

  applicantFields = [
    { key: 'applicantName', label: 'Name *' },
    { key: 'applicantAddress1', label: 'Address 1 *' },
    { key: 'applicantAddress2', label: 'Address 2' },
    { key: 'applicantAddress3', label: 'Address 3' },
    { key: 'applicantAddress4', label: 'Address 4' },
  ];

  beneficiaryFields = [
    { key: 'beneficiaryName', label: 'Name *' },
    { key: 'beneficiaryAddress1', label: 'Address 1 *' },
    { key: 'beneficiaryAddress2', label: 'Address 2' },
    { key: 'beneficiaryAddress3', label: 'Address 3' },
    { key: 'beneficiaryAddress4', label: 'Address 4' },
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