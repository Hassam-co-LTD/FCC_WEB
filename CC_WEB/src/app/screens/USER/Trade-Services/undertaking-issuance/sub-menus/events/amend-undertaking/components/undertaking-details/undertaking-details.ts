import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-undertaking-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './undertaking-details.html',
  styleUrls: ['./undertaking-details.scss'],
})
export class UndertakingDetails {
  @Input() form!: FormGroup;
  @Input() previousValues: { [key: string]: any } = {};

  isOpen = true;

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  hasPreviousValue(field: string): boolean {
    const v = this.previousValues?.[field];
    return v !== null && v !== undefined && String(v).trim() !== '';
  }

  getPreviousValue(field: string): any {
    return this.previousValues?.[field] ?? '';
  }
}