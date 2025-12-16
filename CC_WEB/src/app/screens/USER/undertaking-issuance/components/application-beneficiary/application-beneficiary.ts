import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms'; // ADD ReactiveFormsModule
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-application-beneficiary',
  standalone: true,
  imports: [
    ReactiveFormsModule, // ADD THIS
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule
  ],
  templateUrl: './application-beneficiary.html',
  styleUrl: './application-beneficiary.scss',
})
export class ApplicationBeneficiary implements OnInit {
  @Input() form!: FormGroup;
  isOpen: boolean = true;
  showAlternate: boolean = false;

  ngOnInit() {
    // Initialize form with default values if empty
    if (!this.form.get('applicantName')?.value) {
      this.form.patchValue({
        applicantName: '',
        applicantAddress1: '',
        beneficiaryName: '',
        beneficiaryCountry: ''
      });
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  toggleAlternate() {
    this.showAlternate = !this.showAlternate;
  }
}