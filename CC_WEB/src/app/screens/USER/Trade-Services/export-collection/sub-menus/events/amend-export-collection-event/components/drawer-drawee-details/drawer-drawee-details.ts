import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-drawer-drawee-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './drawer-drawee-details.html',
  styleUrls: ['./drawer-drawee-details.scss']
})
export class DrawerDraweeDetails {

  @Input() form!: FormGroup;

  // Receive previous/rejected values from parent
  @Input() previousValues: { [key: string]: any } = {};

  isOpen = true;

  toggle() {
    this.isOpen = !this.isOpen;
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
}