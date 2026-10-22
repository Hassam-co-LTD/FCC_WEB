import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import {  MatLabel } from "@angular/material/form-field";
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-general-details',
  standalone: true,
  imports: [ReactiveFormsModule, MatIcon, MatLabel, MatSelectModule, MatInputModule],
  templateUrl: './general-details.html',
  styleUrls: ['./general-details.scss']
})
export class GeneralDetails {
  isOpen = true;
  @Input() form!: FormGroup;
  @Input() previousValues: { [key: string]: any } = {};

  constructor() {}

  toggle() {
    this.isOpen = !this.isOpen;
  }

  hasPreviousValue(field: string): boolean {
    return (
      !!this.previousValues &&
      Object.prototype.hasOwnProperty.call(this.previousValues, field) &&
      this.previousValues[field] !== null &&
      this.previousValues[field] !== undefined &&
      String(this.previousValues[field]).trim() !== ''
    );
  }

  getPreviousValue(field: string): any {
    return this.previousValues?.[field] ?? '';
  }
}
