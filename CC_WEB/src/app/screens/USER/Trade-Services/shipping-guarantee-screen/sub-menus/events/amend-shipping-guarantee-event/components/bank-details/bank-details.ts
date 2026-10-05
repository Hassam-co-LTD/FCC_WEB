
import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatError } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import{NgIf} from '@angular/common';
@Component({
  selector: 'app-bank-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatOptionModule,
    MatIcon,
    NgIf
],
  templateUrl: './bank-details.html',
  styleUrl: './bank-details.scss',
})
export class BankDetails {
  isOpen = true;
  currencies = ['USD', 'EUR', 'GBP', 'PKR', 'JPY'];
  @Input() form!: FormGroup;
@Input() previousValues: { [key: string]: any } = {};


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
}
