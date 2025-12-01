import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatIcon } from "@angular/material/icon";
@Component({
  selector: 'app-preview',
  imports: [
    CommonModule,
    MatIcon
],
  templateUrl: './preview.html',
  styleUrl: './preview.scss',
})
export class PreviewSectionComponent {
  isOpen = true;
  @Input() form!: FormGroup;              // Main form
  @Input() attachmentsForm!: FormGroup;   // Attachments form
  @Input() uploadedFiles: any[] = [];     // Uploaded files

  get documents(): FormArray {
    return this.attachmentsForm.get('documents') as FormArray;
  }

  formatCheckbox(value: boolean) {
    return value ? 'Yes' : 'No';
  }
  toggle() {
    this.isOpen = !this.isOpen;
  }
}
