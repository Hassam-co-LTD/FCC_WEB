import { Component } from '@angular/core';

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
  isOpen = true;
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

toggle(){
    this.isOpen = !this.isOpen;
}

  onSubmit() {
    if (this.form.valid) {
      console.log('Form submitted:', this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
