import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-applicant-beneficiary',
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
  templateUrl: './applicant-beneficiary.html',
  styleUrls: ['./applicant-beneficiary.scss'],
})
export class ApplicantBeneficiary {

  isOpen = true;
  @Input() form!: FormGroup;

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
