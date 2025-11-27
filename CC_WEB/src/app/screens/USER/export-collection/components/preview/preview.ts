import { Component, Input } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
})
export class PreviewSectionComponent {
  @Input() form: FormGroup | null = null;
  @Input() attachmentsForm: FormGroup | null = null;
  @Input() uploadedFiles: any[] = [];

  getField(key: string) {
    return this.form?.get(key)?.value ?? '-';
  }

  get documents(): FormArray {
    return (this.attachmentsForm?.get('documents') as FormArray) ?? new FormArray([]);
  }

  formatCheckbox(value: any) {
    return value ? 'Yes' : 'No';
  }
}
