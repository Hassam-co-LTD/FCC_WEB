import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-general-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './general-details.html',
  styleUrl: './general-details.scss',
})
export class GeneralDetails {
  @Input() form!: FormGroup;
  @Input() previousValues: { [key: string]: any } = {};

  isOpen = true;

  // TODO: replace with your real option codes (only values seen in data are certain)
  productTypes = [
    { value: 'performance', label: 'Performance' },
    { value: 'advancePayment', label: 'Advance Payment' },
    { value: 'bidBond', label: 'Bid Bond' },
  ];
  transmissionModes = [
    { value: 'SWIFT', label: 'SWIFT' },
    { value: 'Courier/Mail', label: 'Courier/Mail' },
    { value: 'Other', label: 'Other' },
  ];
  formsOfUndertaking = [
    { value: 'sloc', label: 'Standby LC' },
    { value: 'guarantee', label: 'Guarantee' },
  ];
  purposes = [
    { value: 'clundertaking', label: 'Counter / LC Undertaking' },
    { value: 'direct', label: 'Direct Undertaking' },
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