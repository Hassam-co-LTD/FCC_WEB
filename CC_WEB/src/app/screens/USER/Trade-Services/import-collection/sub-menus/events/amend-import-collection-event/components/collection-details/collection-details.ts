import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-collection-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIcon,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  templateUrl: './collection-details.html',
  styleUrls: ['./collection-details.scss'],
})
export class CollectionDetails {
  isOpen = true;
  @Input() form!: FormGroup;
  @Input() previousValues: { [key: string]: any } = {};

  // Dropdown options — to be filled in later
  documentReleaseOptions: { value: string; viewValue: string }[] = [];
  productTypeOptions: { value: string; viewValue: string }[] = [];

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
