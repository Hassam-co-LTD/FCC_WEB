import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GeneralDetails } from '../../USER/export-screen/components/general-details/general-details';
import { Upload } from "./components/upload/upload";
import { Attachments } from "./components/attachments/attachments";
import { Preview } from "./components/preview/preview";
import { Sidebar } from '../../../core/sidebar/sidebar';

@Component({
  selector: 'app-export-screen',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GeneralDetails,
    Upload,
    Attachments,
    Preview,
    Sidebar
  ],
  templateUrl: './export-screen.html',
  styleUrls: ['./export-screen.scss']
})
export class ExportScreen {

  currentStep = 0;

  exportlcSteps = [
    { label: 'General Details' },
    { label: 'Upload MT700/MT701' },
    { label: 'Attachments' },
    { label: 'Preview' }
  ];

  exportLCForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.exportLCForm = this.fb.group({
      generalDetails: this.fb.group({
        customerRef: [''],
        advisingBank: ['', Validators.required],
        issuerRef: ['', Validators.required]
      }),
      appUpload: this.fb.group({
        file: [null]
      }),
      attachments: this.fb.array([])
    });
  }

  // ============================
  // GETTERS
  // ============================

  get generalDetailsForm(): FormGroup {
    return this.exportLCForm.get('generalDetails') as FormGroup;
  }

  get uploadForm(): FormGroup {
    return this.exportLCForm.get('appUpload') as FormGroup;
  }

  get attachmentsArray(): FormArray {
    return this.exportLCForm.get('attachments') as FormArray;
  }

  // ============================
  // ATTACHMENTS HANDLER
  // ============================

  updateAttachments(files: File[]) {
    this.attachmentsArray.clear();
    files.forEach(file => {
      this.attachmentsArray.push(this.fb.group({
        title: file.name.replace(/\.[^/.]+$/, ""),
        fileName: file.name,
        size: file.size,
        type: file.type,
        file: file
      }));
    });
  }

  // ============================
  // SIDEBAR SCROLL SPY
  // ============================

  ngAfterViewInit() {
    setTimeout(() => {
      const sections = document.querySelectorAll('section');
      const observer = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              this.currentStep = Array.from(sections).indexOf(entry.target as HTMLElement);
            }
          }
        },
        { threshold: 0.4, root: document.querySelector('.scroll-area') }
      );
      sections.forEach(section => observer.observe(section));
    }, 200);
  }

  scrollToSection(i: number) {
    this.currentStep = i;
    const section = document.getElementById(`section-${i}`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  next() {
    if (this.currentStep < this.exportlcSteps.length - 1)
      this.scrollToSection(this.currentStep + 1);
  }

  previous() {
    if (this.currentStep > 0)
      this.scrollToSection(this.currentStep - 1);
  }
}
