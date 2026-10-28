import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-bank-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
],
  templateUrl: './bank-details.html',
  styleUrls: ['./bank-details.scss']
})
export class BankDetailsComponent{

  @Input() form!: FormGroup;
  @Input() previousValues: { [key: string]: any } = {};
  isOpen = true;
  bankTab: 'remitting' | 'presenting' | 'collecting' = 'remitting';

  bankList: string[] = ['Bank A', 'Bank B', 'Bank C']; // Example bank list

  toggle() {
    this.isOpen = !this.isOpen;
  }

  switchBankTab(tab: 'remitting' | 'presenting' | 'collecting') {
    this.bankTab = tab;
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
