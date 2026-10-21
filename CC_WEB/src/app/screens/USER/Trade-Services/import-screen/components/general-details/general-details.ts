
import { CommonModule, formatDate } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIcon } from '@angular/material/icon';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-general-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatIcon,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './general-details.html',
  styleUrl: './general-details.scss',
})
export class GeneralDetails {

  @Input() form!: FormGroup;

  @Input() previousValues: { [key: string]: any } = {};

  tomorrow: string = new Date(Date.now() + 86400000)
    .toISOString()
    .split('T')[0];

  isOpen = true;

  preview: any = {};

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

  formatDateForPreview(date: string): string {
    if (!date) return '-';

    return formatDate(date, 'dd MMM yyyy', 'en-US');
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
}

