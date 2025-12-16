import { Component } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
    MatIconModule
],
  templateUrl: './instruction-to-bank.html',
  styleUrls: ['./instruction-to-bank.scss']
})
export class InstructionToBank {
  isOpen = true;
  instructionForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.instructionForm = this.fb.group({
      principalAccount: ['', Validators.required],
      feeAccount: ['', Validators.required],
      otherInstructions: ['', [Validators.maxLength(31525)]]
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  onSubmit() {
    if (this.instructionForm.valid) {
      console.log('Instructions to Bank:', this.instructionForm.value);
    } else {
      this.instructionForm.markAllAsTouched();
    }
  }
}
