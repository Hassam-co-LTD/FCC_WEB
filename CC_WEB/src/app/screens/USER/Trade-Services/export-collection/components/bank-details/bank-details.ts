import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-bank-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
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
  isOpen = true;
  bankTab: 'remitting' | 'presenting' | 'collecting' = 'remitting';

  bankList: string[] = ['Bank A', 'Bank B', 'Bank C']; // Example bank list

  toggle() {
    this.isOpen = !this.isOpen;
  }

  switchBankTab(tab: 'remitting' | 'presenting' | 'collecting') {
    this.bankTab = tab;
  }
}
