import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from '@angular/material/datepicker';

@Component({
  selector: 'app-collection-instructions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDatepickerModule
  ],
  templateUrl: './collection-instructions.html',
  styleUrls: ['./collection-instructions.scss']
})
export class CollectionInstructionsComponent {

  @Input() form!: FormGroup;

  @Input() previousValues: { [key: string]: any } = {};

  activeSection: string | null = 'adviceCharges';

  advicePaymentOptions = [
    { value: 'bank', viewValue: 'Bank' },
    { value: 'customer', viewValue: 'Customer' }
  ];

  toggleSection(section: string) {
    this.activeSection =
      this.activeSection === section ? null : section;
  }

  // Date controls hold 'yyyy-MM-dd' strings (backend LocalDate);
  // the datepicker works with Date objects, so convert both ways in local time.
  getDateValue(field: string): Date | null {
    const v = this.form?.get(field)?.value;
    if (!v) return null;
    if (v instanceof Date) return v;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v));
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }

  onDateChange(field: string, event: MatDatepickerInputEvent<Date>): void {
    const d = event.value;
    const control = this.form.get(field);
    if (!control) return;
    const pad = (n: number) => String(n).padStart(2, '0');
    control.setValue(
      d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '',
    );
    control.markAsDirty();
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
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}