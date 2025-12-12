import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-attachments',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './attachments.html',
  styleUrls: ['./attachments.scss']
})
export class Attachments {
  isOpen = true;
  files: File[] = [];

  // Add Output event emitter
  @Output() filesChange = new EventEmitter<File[]>();

  toggle() {
    this.isOpen = !this.isOpen;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    const droppedFiles: File[] = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(droppedFiles);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const selectedFiles: File[] = Array.from(input.files);
    this.handleFiles(selectedFiles);
  }

  handleFiles(newFiles: File[]) {
    const previousCount = this.files.length;
    
    for (let file of newFiles) {
      if (this.files.length >= 5) {
        alert('Maximum 5 files allowed.');
        break;
      }

      if (file.size > 1 * 1024 * 1024) {
        alert(`${file.name} exceeds 1 MB limit.`);
        continue;
      }

      this.files.push(file);
    }

    // Emit event only if files were actually added
    if (this.files.length > previousCount) {
      this.filesChange.emit([...this.files]);
    }
  }

  removeFile(index: number) {
    this.files.splice(index, 1);
    // Emit event after removal
    this.filesChange.emit([...this.files]);
  }
}