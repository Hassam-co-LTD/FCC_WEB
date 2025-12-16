import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { SharedService } from '../../../../../core/services/user-service/shared-form-service/shared-service';
@Component({
  selector: 'app-applicant-beneficiary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './applicant-beneficiary.html',
  styleUrls: ['./applicant-beneficiary.scss'],
})
export class ApplicantBeneficiary implements OnInit {

  isOpen = true;
  activeSection: string | null = 'applicant';
  form!: FormGroup;

  countryList = [
    { code: 'PK', name: 'Pakistan' },
    { code: 'IR', name: 'Iran' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'US', name: 'United States' }
  ];

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      applicantName: ['', Validators.required],
      applicantAddress1: ['', Validators.required],
      applicantAddress2: [''],

      beneficiaryName: ['', Validators.required],
      beneficiaryCountry: ['', Validators.required],
      beneficiaryAddress1: ['', Validators.required],
      beneficiaryAddress2: ['']
    });

    // 🔄 Restore data if available
    const existingData = this.sharedService.getFormData();
    if (existingData?.applicantBeneficiary) {
      this.form.patchValue(existingData.applicantBeneficiary);
    }

    // 🔁 Auto-save for preview
    this.form.valueChanges.subscribe(value => {
      const data = this.sharedService.getFormData() || {};
      this.sharedService.setFormData({
        ...data,
        applicantBeneficiary: value
      });
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
