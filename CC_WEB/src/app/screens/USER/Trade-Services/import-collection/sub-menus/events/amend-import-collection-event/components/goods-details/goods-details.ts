import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-goods-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIcon,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './goods-details.html',
  styleUrls: ['./goods-details.scss'],
})
export class GoodsDetails {
  isOpen = true;
  @Input() form!: FormGroup;
  @Input() previousValues: { [key: string]: any } = {};

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
