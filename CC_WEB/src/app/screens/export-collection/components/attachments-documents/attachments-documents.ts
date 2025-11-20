import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-attachments-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIcon],
  templateUrl: './attachments-documents.html',
  styleUrls: ['./attachments-documents.scss'],
})
export class AttachmentsDocuments {
files: any;
onFileDropped($event: DragEvent) {
throw new Error('Method not implemented.');
}
  // Active accordion section
  activeSection = 'attachments';

  // Drag & drop / file upload
  uploadedFiles: File[] = [];
  isDragging = false;
  errorMessage: string | null = null;

  // Document list
  documents: Array<{ type: string; attachment: string; date: string }> = [
    { type: '', attachment: '', date: '' }
  ];

  // Toggle accordion section
  toggleSection(key: string) {
    this.activeSection = this.activeSection === key ? '' : key;
  }

  // ---------------- Drag & Drop File Upload ----------------
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(input.files);
    }
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
    if (event.dataTransfer?.files) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }

  private addFiles(files: FileList) {
    this.errorMessage = null;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (this.uploadedFiles.length >= 5) {
        this.errorMessage = 'Maximum 5 files allowed';
        break;
      }
      if (file.size > 1_000_000) {
        this.errorMessage = 'File size exceeds 1MB';
        continue;
      }
      this.uploadedFiles.push(file);
    }
  }

  // ---------------- Document List Functions ----------------
  addDocument() {
    this.documents.push({ type: '', attachment: '', date: '' });
  }

  removeDocument(index: number) {
    this.documents.splice(index, 1);
  }

  selectAttachment(index: number) {
    // Here you can open a modal or file selector
    // For demo, we select first uploaded file if exists
    if (this.uploadedFiles.length > 0) {
      this.documents[index].attachment = this.uploadedFiles[0].name;
    } else {
      console.log('No files uploaded to attach');
    }
  }
}
