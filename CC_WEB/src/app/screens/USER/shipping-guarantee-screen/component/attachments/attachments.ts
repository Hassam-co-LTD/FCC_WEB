import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-attachments-documents',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './attachments.html',
  styleUrls: ['./attachments.scss']
})
export class AttachmentsDocuments {
  activeSection: string | null = 'attachments';
  form: FormGroup;

  uploadedFiles: File[] = [];
  isDragging = false;
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      attachments: [null]
    });
  }

  toggleSection(section: string) {
    this.activeSection = this.activeSection === section ? null : section;
  }

  // Drag & Drop
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const files = Array.from(event.dataTransfer?.files || []);
    this.addFiles(files);
  }

  // File input select
  onFileSelected(event: Event) {
    const files = Array.from((event.target as HTMLInputElement).files || []);
    this.addFiles(files);
  }

  private addFiles(files: File[]) {
    for (let file of files) {
      if (this.uploadedFiles.length >= 5) {
        this.errorMessage = 'Maximum 5 files allowed.';
        return;
      }
      if (file.size > 1024 * 1024) { // 1 MB limit
        this.errorMessage = 'File size cannot exceed 1 MB.';
        return;
      }
      this.uploadedFiles.push(file);
    }
    this.errorMessage = '';
  }

  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }
}
