import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-instructions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './instructions.html',
  styleUrls: ['./instructions.scss'],
})
export class InstructionsComponent {
  activeSection: string | null = 'instructions';
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      instructionType: ['', Validators.required],
      details: ['', [Validators.required, Validators.maxLength(300)]],
    });
  }

  toggleSection(section: string) {
    this.activeSection = this.activeSection === section ? null : section;
  }
}
