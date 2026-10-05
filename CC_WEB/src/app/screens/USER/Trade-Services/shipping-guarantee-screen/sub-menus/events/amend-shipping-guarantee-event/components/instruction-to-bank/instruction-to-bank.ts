import { Component, Input } from '@angular/core';
import{NgIf} from '@angular/common';

import { FormGroup, ReactiveFormsModule} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-instruction-to-bank',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    NgIf
],
  templateUrl: './instruction-to-bank.html',
  styleUrls: ['./instruction-to-bank.scss']
})
export class InstructionToBank {
  isOpen = true;
  @Input() form!: FormGroup;
@Input() previousValues: { [key: string]: any } = {};
  // Dropdown lists
  principalAccounts = ['Account 1', 'Account 2', 'Account 3'];

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
