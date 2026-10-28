import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

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
export class ShipmentDetails implements OnInit {

  @Input() previousValues: { [key: string]: any } = {};

  isOpen = true;

  shipmentForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.shipmentForm = this.fb.group({
      shipmentFrom: ['', Validators.required],
      shipmentTo: ['', Validators.required],
      placeOfLoading: ['', Validators.required],
      placeOfDischarge: ['', Validators.required],
      lastShipmentDate: ['', Validators.required],
      shipmentPeriodNarrative: [
        '',
        [Validators.required, Validators.maxLength(390)]
      ],
      partialShipment: ['Allowed', Validators.required],
      transhipment: ['Not Allowed', Validators.required]
    });
  }

  ngOnInit(): void {
    // Previous values are supplied by the parent component.
  }

  toggle() {
    this.isOpen = !this.isOpen;
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

  onSubmit() {
    if (this.shipmentForm.valid) {
      console.log('Shipment Details:', this.shipmentForm.value);
    } else {
      this.shipmentForm.markAllAsTouched();
    }
  }
}
