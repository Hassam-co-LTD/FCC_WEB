import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-attachments-documents',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  templateUrl: './attachments-documents.html',
  styleUrls: ['./attachments-documents.scss']
})
export class AttachmentsDocuments implements OnInit {

  @Input() attachmentsForm!: FormGroup;
  isOpen = true;
  uploadedFiles: File[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // initialize attachments FormArray if not present
    if (!this.attachmentsForm.get('attachments')) {
      this.attachmentsForm.addControl('attachments', this.fb.array([]));
    }
    if (!this.attachmentsForm.get('documents')) {
      this.attachmentsForm.addControl('documents', this.fb.array([]));
    }
  }

  get attachmentsArray(): FormArray {
    return this.attachmentsForm.get('attachments') as FormArray;
  }

  get documents(): FormArray {
    return this.attachmentsForm.get('documents') as FormArray;
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  /** ================= Upload Files ================= */
  onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.addFiles(files);
  }

  onFileDropped(event: any) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files) as File[];
    this.addFiles(files);
  }

  onDragOver(event: any) {
    event.preventDefault();
  }

  private addFiles(files: File[]) {
    files.forEach(file => {
      // skip duplicate files
      if (!this.uploadedFiles.find(f => f.name === file.name)) {
        this.uploadedFiles.push(file);

        this.attachmentsArray.push(this.fb.group({
          file,
          fileName: file.name,
          type: file.type,
          size: file.size,
          title: file.name
        }));
      }
    });
  }

  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
    this.attachmentsArray.removeAt(index);
  }

  /** ================= Document FormArray ================= */
  addDocument() {
    const docGroup = this.fb.group({
      type: ['', Validators.required],
      attachment: ["attachments", Validators.required],  // store as {file, fileName, type, size}
      date: ['', Validators.required]
    });
    this.documents.push(docGroup);
  }

  removeDocument(index: number) {
    this.documents.removeAt(index);
  }

  selectAttachment(docIndex: number) {
    const file = this.uploadedFiles[docIndex];
    if (file) {
      this.documents.at(docIndex).patchValue({
        attachment: {
          file,
          fileName: file.name,
          type: file.type,
          size: file.size,
          title: file.name
        }
      });
    }
  }

}
