import { formatDate } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIcon } from "@angular/material/icon";
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from '@angular/material/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-general-details',
  standalone: true,
  imports: [
    MatButtonModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatIcon,
    MatDatepickerModule,
    MatNativeDateModule,
    NgIf
],
  templateUrl: './general-details.html',
  styleUrl: './general-details.scss',
})
export class GeneralDetails{
  isOpen = true;
  @Input() form!: FormGroup;
@Input() previousValues: { [key: string]: any } = {};
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
