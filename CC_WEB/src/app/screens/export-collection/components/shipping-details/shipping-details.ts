import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-shipping-details', // change for each component
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './shipping-details.html',
  styleUrls: ['./shipping-details.scss'],
})
export class ShippingDetails {

  activeSection: string | null = null;

  form: FormGroup;

  shippingMethods = ['Air', 'Sea', 'Road', 'Courier', 'Rail'];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      shippingMethod: [''],
      shipmentReference: [''],
      shipmentDate: ['']
    });
  }

  toggleSection(section: string) {
    this.activeSection = this.activeSection === section ? null : section;
  }
}
