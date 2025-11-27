import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './upload.html',
  styleUrls: ['./upload.scss']
})
export class Upload {
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
