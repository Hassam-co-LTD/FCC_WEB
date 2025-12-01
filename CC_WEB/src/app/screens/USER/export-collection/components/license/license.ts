import { Component, Input, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-license',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIcon],
  templateUrl: './license.html',
  styleUrls: ['./license.scss'],
})
export class License {
  isOpen = true;
  form: FormGroup;
  file: File | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];
    const allowedTypes = ['text/plain', 'application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      alert('Only .txt or .pdf files are allowed!');
      input.value = '';
      this.file = null;
      return;
    }

    this.file = file;
  }

  formatFileSize(n: number) {
    if (n < 1024) return `${n} B`;
    if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1048576).toFixed(1)} MB`;
  }
}
