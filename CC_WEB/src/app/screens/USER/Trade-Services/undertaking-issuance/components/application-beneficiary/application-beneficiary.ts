
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-application-beneficiary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule
  ],
  templateUrl: './application-beneficiary.html',
  styleUrl: './application-beneficiary.scss',
})
export class ApplicationBeneficiary implements OnInit {

  @Input() form!: FormGroup;

  @Input() previousValues: { [key: string]: any } = {};

  isOpen: boolean = true;
  showAlternate: boolean = false;

  ngOnInit() {
    // Initialize form with default values if empty
    if (!this.form.get('applicantName')?.value) {
      this.form.patchValue({
        applicantName: '',
        applicantAddress1: '',
        beneficiaryName: '',
        beneficiaryCountry: ''
      });
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  toggleAlternate() {
    this.showAlternate = !this.showAlternate;
  }

  hasPreviousValue(field: string): boolean {
    return (
      this.previousValues &&
      Object.prototype.hasOwnProperty.call(this.previousValues, field) &&
      this.previousValues[field] !== null &&
      this.previousValues[field] !== undefined &&
      String(this.previousValues[field]).trim() !== ''
    );
  }

  getPreviousValue(field: string): any {
    return this.previousValues?.[field] ?? '';
  }
}

