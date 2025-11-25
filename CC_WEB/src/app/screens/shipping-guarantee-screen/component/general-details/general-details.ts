import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-general-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './general-details.html',
  styleUrls: ['./general-details.scss'],
})
export class GeneralDetails {
  activeSection: string | null = 'general';
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      expiryDate: ['', Validators.required],
      beneficiaryReference: [''],
      customerReference: [''],
      billNumber: ['', Validators.required],
      modeOfShipment: ['', Validators.required],
      shippingDetails: [''],
      descriptionOfGoods: ['', [Validators.required, Validators.maxLength(222)]],
    });
  }

  toggleSection(section: string) {
    this.activeSection = this.activeSection === section ? null : section;
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('Form submitted:', this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
