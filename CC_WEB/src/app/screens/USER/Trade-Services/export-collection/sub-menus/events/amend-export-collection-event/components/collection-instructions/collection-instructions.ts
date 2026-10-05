
import { Component, Input, OnInit } from '@angular/core';

import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';

import { MatSelectModule } from '@angular/material/select';

import { MatRadioModule } from '@angular/material/radio';

import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-collection-instructions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './collection-instructions.html',
  styleUrls: ['./collection-instructions.scss']
})
export class CollectionInstructionsComponent implements OnInit {

  @Input() form!: FormGroup;

  @Input() previousValues: { [key: string]: any } = {};

  activeSection: string | null = 'adviceCharges';

  advicePaymentOptions = [
    { value: 'bank', viewValue: 'Bank' },
    { value: 'customer', viewValue: 'Customer' }
  ];

  ngOnInit(): void {
    // Do NOT create a new form here.
    // The parent provides the FormGroup.
  }

  toggleSection(section: string): void {
    this.activeSection =
      this.activeSection === section ? null : section;
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }

  hasPreviousValue(field: string): boolean {
    return (
      this.previousValues &&
      Object.prototype.hasOwnProperty.call(
        this.previousValues,
        field
      ) &&
      this.previousValues[field] !== null &&
      this.previousValues[field] !== undefined &&
      String(this.previousValues[field]).trim() !== ''
    );
  }

  getPreviousValue(field: string): any {
    return this.previousValues?.[field] ?? '';
  }
}

