import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
export class ApplicationBeneficiary {
  @Input() form!: FormGroup;
  formGroup!: FormGroup;
  isOpen: boolean = true; // default open
  showAlternate: boolean = false;

  constructor(private fb: FormBuilder) {
    this.createForm();
  }

  createForm() {
    this.formGroup = this.fb.group({
      applicantName: ['', Validators.required],
      applicantAddress1: ['', Validators.required],
      applicantAddress2: [''],
      applicantAddress3: [''],

      alternateName: [''],
      alternateAddress1: [''],
      alternateAddress2: [''],
      alternateAddress3: [''],

      beneficiaryName: ['', Validators.required],
      beneficiaryAddress1: ['', Validators.required],
      beneficiaryAddress2: [''],
      beneficiaryAddress3: [''],
      beneficiaryCountry: ['', Validators.required]
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  toggleAlternate() {
    this.showAlternate = !this.showAlternate;
  }
}
