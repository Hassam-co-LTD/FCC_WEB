import { Component, Input } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
})
export class PreviewSectionComponent {
  @Input() form!: FormGroup;
  isOpen = true;

  toggle() {
    this.isOpen = !this.isOpen;
  }

  get attachmentsArray(): FormArray {
    return (this.form.get('attachments')?.get('attachments') as FormArray) || new FormArray([]);
  }

  get documentsArray(): FormArray {
    return (this.form.get('attachments')?.get('documents') as FormArray) || new FormArray([]);
  }

  downloadFile(file: any) {
    if (!file || !file.file) return;
    const url = URL.createObjectURL(file.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Format a field string like 'remittingBankName' => 'Remitting Bank Name' */
  formatLabel(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')   // add space before capital letters
      .replace(/^./, str => str.toUpperCase()); // capitalize first letter
  }

  /** Format boolean values as Yes/No */
  formatValue(value: any): string {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    return value ?? '—';
  }
}
