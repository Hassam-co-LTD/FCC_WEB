import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
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

  @Input() form!: FormGroup;   // <-- parent passes the form
  isOpen = true;

  shippingMethods = ['Air', 'Sea', 'Land'];
  incotermsRules = ['FOB', 'CIF', 'EXW'];
  incoterms = ['DAP', 'DDP', 'FCA'];

  ngOnInit(): void {
    // ❗ Do NOT create a new form here
    // The form must come from parent component
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
