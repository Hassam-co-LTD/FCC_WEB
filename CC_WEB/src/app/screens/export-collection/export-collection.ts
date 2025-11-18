import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-export-collection',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './export-collection.html',
  styleUrls: ['./export-collection.scss']
})
export class ExportCollectionComponent {

  @ViewChildren('accordionSection') sections!: QueryList<ElementRef>;

  activeSection = 'general';
  ecForm: FormGroup;

  banks = ['NBP', 'MCB', 'HBL', 'UBL', 'Bank Alfalah'];

  isDragging = false;
  uploadedFiles: File[] = [];
  maxFiles = 5;
  maxFileSize = 1 * 1024 * 1024;
  errorMessage = '';

  sidebarSteps = [
    { number: 1, label: 'General Details', key: 'general' },
    { number: 2, label: 'Drawer and Drawee Details', key: 'drawer' },
    { number: 3, label: 'Bank Details', key: 'bank' },
    { number: 4, label: 'Payment and Amount Details', key: 'payment' },
    { number: 5, label: 'Shipment Details', key: 'shipment' },
    { number: 6, label: 'Licenses', key: 'licenses' },
    { number: 7, label: 'Collection Instructions', key: 'instructions' },
    { number: 8, label: 'Attachments and Documents', key: 'attachments' },
    { number: 9, label: 'Preview', key: 'preview' }
  ];

  constructor(private fb: FormBuilder, private el: ElementRef) {
    this.ecForm = this.fb.group({
      collectionType: ['', Validators.required],
      documentReference: [''],
      drawerName: [''],
      draweeName: [''],
      issuingBank: ['', Validators.required],
      amount: ['', Validators.required],
      currency: ['', Validators.required],
      shipmentMode: [''],
      licenseNumber: [''],
      collectionInstructions: ['']
    });
  }

  toggleSection(key: string) {
    this.activeSection = this.activeSection === key ? '' : key;
  }

  scrollToSection(id: string) {
    const el = this.el.nativeElement.querySelector('#' + id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeSection = id;
    }
  }

  // ---------------- FILE UPLOAD ------------------
  onDragOver(ev: DragEvent) {
    ev.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(ev: DragEvent) {
    this.isDragging = false;
  }

  onDrop(ev: DragEvent) {
    ev.preventDefault();
    this.isDragging = false;
    if (ev.dataTransfer?.files) this.handleFiles(ev.dataTransfer.files);
  }

  onFileSelect(event: any) {
    if (event.target.files) this.handleFiles(event.target.files);
  }

  removeFile(i: number) {
    this.uploadedFiles.splice(i, 1);
  }

  handleFiles(files: FileList) {
    if (this.uploadedFiles.length + files.length > this.maxFiles) {
      this.errorMessage = `Max ${this.maxFiles} files allowed.`;
      return;
    }

    for (let f of Array.from(files)) {
      if (f.size > this.maxFileSize) {
        this.errorMessage = `${f.name} exceeds 1MB limit.`;
        continue;
      }
      this.uploadedFiles.push(f);
    }
  }
}
