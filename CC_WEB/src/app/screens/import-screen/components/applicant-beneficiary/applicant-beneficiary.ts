import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-applicant-beneficiary',
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
  templateUrl: './applicant-beneficiary.html',
  styleUrls: ['./applicant-beneficiary.scss']
})
export class ApplicantBeneficiary {
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
