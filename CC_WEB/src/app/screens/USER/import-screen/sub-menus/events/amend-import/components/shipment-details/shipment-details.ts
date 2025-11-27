import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-shipment-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './shipment-details.html',
  styleUrls: ['./shipment-details.scss']
})
export class ShipmentDetails {
  isOpen = true;

  shipmentForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.shipmentForm = this.fb.group({
      shipmentFrom: ['', Validators.required],
      shipmentTo: ['', Validators.required],
      placeOfLoading: ['', Validators.required],
      placeOfDischarge: ['', Validators.required],
      lastShipmentDate: ['', Validators.required],
      shipmentPeriodNarrative: ['', [Validators.required, Validators.maxLength(390)]],
      partialShipment: ['Allowed', Validators.required],
      transhipment: ['Not Allowed', Validators.required]
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  onSubmit() {
    if (this.shipmentForm.valid) {
      console.log('Shipment Details:', this.shipmentForm.value);
    } else {
      this.shipmentForm.markAllAsTouched();
    }
  }
}
