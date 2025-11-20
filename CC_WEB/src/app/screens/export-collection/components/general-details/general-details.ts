import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-general-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './general-details.html',
  styleUrls: ['./general-details.scss'],
})
export class GeneralDetails {

  /** Accordion Active Section */
  activeSection: string | null = 'general';

  /** Form Group */
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      collectionType: ['', Validators.required],
      customerReference: [''],
      draweeReference: ['']
    });
  }

  /** Toggle Accordion Section */
  toggleSection(section: string) {
    this.activeSection = this.activeSection === section ? null : section;
  }
}
