import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-collection-instructions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './collection-instructions.html',
  styleUrls: ['./collection-instructions.scss']
})
export class CollectionInstructionsComponent implements OnInit {

  @Input() form!: FormGroup; // Parent-provided form
  activeSection: string | null = 'adviceCharges';

  advicePaymentOptions = [
    { value: 'bank', viewValue: 'Bank' },
    { value: 'customer', viewValue: 'Customer' }
  ];


  ngOnInit(): void {
    // ❗ Do NOT create a new form here
    // The parent must provide a FormGroup with all necessary controls
  }

  toggleSection(section: string) {
    this.activeSection = this.activeSection === section ? null : section;
  }

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
