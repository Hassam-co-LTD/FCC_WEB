import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-instructions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './instructions.html',
  styleUrls: ['./instructions.scss'],
})
export class InstructionsComponent {
  activeSection: string | null = 'instructions';
  form: FormGroup;

  // Dropdown lists
  principalAccounts = ['Account 1', 'Account 2', 'Account 3'];
  faxAccounts = ['Fax 001', 'Fax 002', 'Fax 003'];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      principalAccount: ['', Validators.required],
      faxAccount: ['', Validators.required],
      details: ['', [Validators.required, Validators.maxLength(300)]]
    });
  }

  toggleSection(section: string) {
    this.activeSection = this.activeSection === section ? null : section;
  }
}
