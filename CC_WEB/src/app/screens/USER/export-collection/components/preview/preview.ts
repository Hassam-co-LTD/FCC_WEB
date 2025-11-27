import { Component, Input } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
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
  toggle(){
    this.isOpen = !this.isOpen;
  }
}
