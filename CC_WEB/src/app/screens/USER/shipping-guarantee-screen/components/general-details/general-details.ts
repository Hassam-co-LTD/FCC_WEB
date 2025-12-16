import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';   
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatOption } from '@angular/material/select';

import { SharedService } from '../../../../../core/services/user-service/shared-form-service/shared-service';
@Component({
  selector: 'app-general-details',
  standalone: true,
  imports: [
   CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSelectModule,
    MatOption,
    MatButtonModule
  ],
  templateUrl: './general-details.html',
  styleUrls: ['./general-details.scss'],
})
export class GeneralDetails implements OnInit {

  isOpen = true;
  activeSection: string | null = 'general';
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      expiryDate: ['', Validators.required],
      beneficiaryReference: [''],
      customerReference: [''],
      billNumber: ['', Validators.required],
      modeOfShipment: ['', Validators.required],
      shippingDetails: [''],
      descriptionOfGoods: ['', [Validators.required, Validators.maxLength(222)]],
    });

    // 🔁 Auto-save data for preview
    this.form.valueChanges.subscribe(value => {
      const existing = this.sharedService.getFormData() || {};
      this.sharedService.setFormData({
        ...existing,
        generalDetails: value
      });
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  onSubmit() {
    if (this.form.valid) {
      // Optional manual save (already auto-saved)
      const existing = this.sharedService.getFormData() || {};
      this.sharedService.setFormData({
        ...existing,
        generalDetails: this.form.value
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
