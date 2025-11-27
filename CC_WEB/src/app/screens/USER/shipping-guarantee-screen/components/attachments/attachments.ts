import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-attachments-documents',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './attachments.html',
  styleUrls: ['./attachments.scss'],
})
export class AttachmentsDocuments {
  isOpen = true;
  activeSection: string | null = 'attachments';
  isDragging = false;
  uploadedFiles: File[] = [];
  errorMessage: string = '';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

toggle(){
  this.isOpen = !this.isOpen;
}

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
    if (!event.dataTransfer) return;

    const files = Array.from(event.dataTransfer.files);
    this.handleFiles(files);
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    this.handleFiles(files);
  }

  handleFiles(files: File[]) {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/gif',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = `File type not allowed: ${file.name}`;
        continue;
      }
      if (file.size > 1024 * 1024) {
        this.errorMessage = `File exceeds 1MB: ${file.name}`;
        continue;
      }
      if (this.uploadedFiles.length >= 5) {
        this.errorMessage = `Maximum 5 files allowed`;
        break;
      }
      this.uploadedFiles.push(file);
      this.errorMessage = '';
    }
  }

  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }
}
