import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-instruction-to-bank',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './instruction-to-bank.html',
  styleUrls: ['./instruction-to-bank.scss'],
})
export class InstructionToBank {
  @Input() form!: FormGroup;
  @Input() previousValues: { [key: string]: any } = {};

  isOpen = true;

  // TODO: replace with your real option codes / account list
  deliveryTypes = [
    { value: 'copy', label: 'Copy' },
    { value: 'original', label: 'Original' },
  ];
  deliveryModes = [
    { value: 'email', label: 'Email' },
    { value: 'courier', label: 'Courier' },
  ];
  deliveryTargets = [
    { value: 'applicant', label: 'Applicant' },
    { value: 'beneficiary', label: 'Beneficiary' },
    { value: 'other', label: 'Other' },
  ];
  accounts = ['Corporate Account - 1122334455'];

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