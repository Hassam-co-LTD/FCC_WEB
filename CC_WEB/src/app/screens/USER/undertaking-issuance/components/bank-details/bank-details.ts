import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bank-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule
  ],
  templateUrl: './bank-details.html',
  styleUrls: ['./bank-details.scss']
})
export class BankDetails {

  isOpen = true;
  selectedTab = 'issuing';

  formGroup: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      recipientBankName: [''],
      issuerReference: [''],
      issuanceType: ['direct'],
      swift: [''],
      bankName: [''],
      address1: [''],
      address2: [''],
      address3: [''],
      country: ['']
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }
}
