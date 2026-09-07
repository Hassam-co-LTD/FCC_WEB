import { Component, Input } from '@angular/core';

import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-applicant-beneficiary',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule
],
  templateUrl: './applicant-beneficiary.html',
  styleUrls: ['./applicant-beneficiary.scss']
})
export class ApplicantBeneficiary {

  @Input() form!: FormGroup;

  isOpen: boolean = true;
  showAlternate: boolean = false;

  constructor() { }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  toggleAlternate() {
    this.showAlternate = !this.showAlternate;
  }
}
