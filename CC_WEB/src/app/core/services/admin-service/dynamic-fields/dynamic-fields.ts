import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dynamic-fields',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './dynamic-fields.html',
  styleUrl: './dynamic-fields.scss'
})
export class DynamicFields {

  @Input() fields: any[] = [];

  @Input() form!: FormGroup;

  @Input() isOpen = true;
@Input() previousDynamicValues: { [key: string]: any } = {};
  toggleDynamicFields(): void {
    this.isOpen = !this.isOpen;
  }
  hasPreviousDynamicValue(fieldId: string): boolean {
  return (
    this.previousDynamicValues &&
    Object.prototype.hasOwnProperty.call(
      this.previousDynamicValues,
      fieldId
    ) &&
    this.previousDynamicValues[fieldId] !== null &&
    this.previousDynamicValues[fieldId] !== undefined &&
    String(this.previousDynamicValues[fieldId]).trim() !== ''
  );
}

getPreviousDynamicValue(fieldId: string): any {
  return this.previousDynamicValues?.[fieldId] ?? '';
}
}