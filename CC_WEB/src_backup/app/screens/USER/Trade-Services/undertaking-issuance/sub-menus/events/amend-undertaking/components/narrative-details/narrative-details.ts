import { Component, ElementRef } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-narrative-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule
],
  templateUrl: './narrative-details.html',
  styleUrls: ['./narrative-details.scss']
})
export class NarrativeDetails {
  isOpen = true;
  activeTabIndex = 0;
  narrativeForm!: FormGroup;

  constructor(private fb: FormBuilder, private el: ElementRef) {
    this.narrativeForm = this.fb.group({
      descriptionOfGoods: ['', [Validators.required, Validators.maxLength(6500)]],
      documentsRequired: ['', [Validators.required, Validators.maxLength(6500)]],
      additionalInstructions: ['', [Validators.maxLength(2000)]],
      otherDetails: ['']
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  onTabChange(index: number) {
    this.activeTabIndex = index;
  }

  onSubmit() {
    if (this.narrativeForm.valid) {
      console.log('Narrative Details:', this.narrativeForm.value);
    } else {
      this.narrativeForm.markAllAsTouched();
    }
  }
}
