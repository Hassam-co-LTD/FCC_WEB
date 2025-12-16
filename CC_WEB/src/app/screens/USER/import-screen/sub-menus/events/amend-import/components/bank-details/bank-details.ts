
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
    MatIcon
],
  templateUrl: './bank-details.html',
  styleUrl: './bank-details.scss',
})
export class BankDetails {

  selectedTab = 0;
  isOpen = true;

  @Input() form!: FormGroup;  

  bankList: string[] = [
    'Habib Bank Limited (HBL)',
    'United Bank Limited (UBL)',
    'MCB Bank',
    'Standard Chartered Bank',
    'Bank Alfalah'
  ];

  constructor() {}

  toggle() {
    this.isOpen = !this.isOpen;
  }

}
