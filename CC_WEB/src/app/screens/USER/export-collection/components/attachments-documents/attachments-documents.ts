import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-attachments-documents',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './attachments-documents.html',
  styleUrls: ['./attachments-documents.scss']
})
export class AttachmentsDocuments implements OnInit {

  attachmentsForm!: FormGroup;
  @Input() form!: FormGroup;
  isOpen = true;
  uploadedFiles: File[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.attachmentsForm = this.fb.group({
      documents: this.fb.array([this.createDocumentGroup()])
    });
  }

  get documents(): FormArray {
    return this.attachmentsForm.get('documents') as FormArray;
  }

  createDocumentGroup(): FormGroup {
    return this.fb.group({
      type: ['', Validators.required],
      attachment: ['', Validators.required],
      date: ['', Validators.required]
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  addDocument() {
    this.documents.push(this.createDocumentGroup());
  }

  removeDocument(index: number) {
    this.documents.removeAt(index);
  }

  selectAttachment(index: number) {
    alert(`Select attachment for document #${index + 1}`);
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(input.files);
    }
  }

  addFiles(files: FileList) {
    Array.from(files).forEach(file => {
      if (this.uploadedFiles.length < 5 && file.size <= 1024 * 1024) {
        this.uploadedFiles.push(file);
      } else {
        alert('Max 5 files, each ≤ 1MB');
      }
    });
  }

  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }

  onSubmit() {
    if (this.attachmentsForm.valid) {
      console.log(this.attachmentsForm.value, this.uploadedFiles);
    } else {
      this.documents.controls.forEach(ctrl => ctrl.markAllAsTouched());
      alert('Please fill all required fields');
    }
  }
}
