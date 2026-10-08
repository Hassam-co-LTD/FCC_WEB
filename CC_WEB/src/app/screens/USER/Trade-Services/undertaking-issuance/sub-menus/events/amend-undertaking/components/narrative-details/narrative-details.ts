import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-narrative-details',
  standalone: true,
  imports: [
    CommonModule,
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
export class NarrativeDetails implements OnInit {

  @Input() previousValues: { [key: string]: any } = {};

  isOpen = true;
  activeTabIndex = 0;
  narrativeForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private el: ElementRef
  ) {
    this.narrativeForm = this.fb.group({
      descriptionOfGoods: [
        '',
        [Validators.required, Validators.maxLength(6500)]
      ],

      documentsRequired: [
        '',
        [Validators.required, Validators.maxLength(6500)]
      ],

      additionalInstructions: [
        '',
        [Validators.maxLength(2000)]
      ],

      otherDetails: ['']
    });
  }

  ngOnInit(): void {
    // Previous values are supplied by the parent component.
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  onTabChange(index: number) {
    this.activeTabIndex = index;
  }

  hasPreviousValue(field: string): boolean {
    return (
      this.previousValues &&
      Object.prototype.hasOwnProperty.call(this.previousValues, field) &&
      this.previousValues[field] !== null &&
      this.previousValues[field] !== undefined &&
      String(this.previousValues[field]).trim() !== ''
    );
  }

  getPreviousValue(field: string): any {
    return this.previousValues?.[field] ?? '';
  }

  onSubmit() {
    if (this.narrativeForm.valid) {
      console.log('Narrative Details:', this.narrativeForm.value);
    } else {
      this.narrativeForm.markAllAsTouched();
    }
  }
}
