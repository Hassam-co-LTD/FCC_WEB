import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-shipping-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
],
  templateUrl: './shipping-details.html',
  styleUrls: ['./shipping-details.scss']
})
export class ShippingDetailsComponent  {

  @Input() form!: FormGroup;   // <-- parent passes the form
  isOpen = true;

  shippingMethods = ['Air', 'Sea', 'Land'];
  ApplicableRules = ['DAP', 'DDP', 'FCA'];
  incoterms       = ['FOB', 'CIF', 'EXW'];

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
