import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-applicant-beneficiary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './applicant-beneficiary.html',
  styleUrls: ['./applicant-beneficiary.scss'],
})
export class ApplicantBeneficiary {
  isOpen = true;
  activeSection: string | null = 'applicant';
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      applicantName: ['', Validators.required],
      beneficiaryName: ['', Validators.required],
      beneficiaryCountry: ['', Validators.required],
    });
  }
toggle(){
    this.isOpen = !this.isOpen;}
 
}
