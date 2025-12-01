import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-shipping-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './shipping-details.html',
  styleUrls: ['./shipping-details.scss']
})
export class ShippingDetailsComponent implements OnInit {
isOpen = true;
  form!: FormGroup;
  activeSection: string | null = 'shipmentDetails';

  shippingMethods = ['Air', 'Sea', 'Land'];
  incotermsRules = ['FOB', 'CIF', 'EXW'];
  incoterms = ['DAP', 'DDP', 'FCA'];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      shippingMethod: [''],
      shipmentReference: [''],
      shippingFrom: [''],
      shippingTo: [''],
      shipmentDate: [''],
      incotermsRules: [''],
      incoterms: ['']
    });
  }

  toggle(){
    this.isOpen = !this.isOpen;
  }
}
