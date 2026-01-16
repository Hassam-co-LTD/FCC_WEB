import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { SharedService } from '../../../../../../core/services/user-service/shared-form-service/shared-service';
@Component({
  selector: 'app-instructions',
  standalone: true,
  imports: [
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
export class InstructionsComponent implements OnInit {

  isOpen = true;
  activeSection: string | null = 'instructions';
  form!: FormGroup;

  // Dropdown lists
  principalAccounts = ['Account 1', 'Account 2', 'Account 3'];
  faxAccounts = ['Fax 001', 'Fax 002', 'Fax 003'];

  constructor(private fb: FormBuilder, private sharedService: SharedService) {}

  ngOnInit() {
  this.form = this.fb.group({
    instructionType: ['', Validators.required], // <-- Add this
    details: ['', [Validators.required, Validators.maxLength(300)]]
  });

  // Restore existing data if available
  const existingData = this.sharedService.getFormData();
  if (existingData?.instructions) {
    this.form.patchValue(existingData.instructions);
  }

  // Auto-save for preview
  this.form.valueChanges.subscribe(value => {
    const data = this.sharedService.getFormData() || {};
    this.sharedService.setFormData({
      ...data,
      instructions: value
    });
  });
}

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
