import { Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GeneralDetails } from './components/General-details/general-details';
import { Upload } from './components/upload/upload';
import { Attachments } from './components/attachments/attachments';
import { Sidebar } from '../../../../../core/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { SharedService } from '../../../../../core/services/user-service/shared-form-service/shared-service';


@Component({
  selector: 'app-internal-transfer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GeneralDetails,
    Upload,
    Attachments,
    Sidebar,
    RouterOutlet
  ],
  templateUrl: './internal-transfer.html',
  styleUrl: './internal-transfer.scss',
})
export class InternalTransfer {

  currentStep = 0;
  isPreviewRoute = false;

  exportlcSteps = [
    { label: 'General Details' },
    { label: 'Upload MT700/MT701' },
    { label: 'Attachments' }
  ];

  exportLCForm!: FormGroup;

  @ViewChild(Attachments) attachmentsComponent!: Attachments;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sharedService: SharedService
  ) {
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

  // =======================
  // Getters
  // =======================
  get generalDetailsForm(): FormGroup {
    return this.exportLCForm.get('generalDetails') as FormGroup;
  }

  get uploadForm(): FormGroup {
    return this.exportLCForm.get('appUpload') as FormGroup;
  }

  get attachmentsArray(): FormArray {
    return this.exportLCForm.get('attachments') as FormArray;
  }

  // =======================
  // Attachments handler
  // =======================
  onAttachmentsChange(files: File[]) {
    this.attachmentsArray.clear();
    const previewFiles: any[] = [];

    files.forEach(file => {
      const fg = this.fb.group({
        title: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        size: file.size,
        type: file.type,
        file
      });
      this.attachmentsArray.push(fg);
      previewFiles.push(fg.value);
    });

    const data = this.sharedService.getFormData() || {};
    this.sharedService.setFormData({
      ...data,
      attachments: {
        preview: previewFiles,
        files // actual File[] for download
      }
    });
  }

  // =======================
  // Preview
  // =======================
  preview() {
    if (this.exportLCForm.invalid) {
      this.exportLCForm.markAllAsTouched();
      alert('Please fill all required fields before preview.');
      return;
    }

    const attachmentFiles = this.attachmentsComponent?.files || [];
    const attachmentsPreview = attachmentFiles.map(file => ({
      title: file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name,
      size: file.size,
      type: file.type,
      file
    }));

    const fullFormData = {
      ...this.exportLCForm.value,
      attachments: {
        preview: attachmentsPreview,
        files: attachmentFiles
      }
    };

    this.sharedService.setFormData(fullFormData);

    this.router.navigate(['/export-screen/preview']);
  }

  // =======================
  // Step scroll tracking
  // =======================
  ngAfterViewInit() {
    setTimeout(() => {
      const sections = document.querySelectorAll('section');
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.currentStep = Array.from(sections).indexOf(entry.target as HTMLElement);
            }
          });
        },
        { threshold: 0.4, root: document.querySelector('.scroll-area') }
      );
      sections.forEach(section => observer.observe(section));
    }, 200);
  }

  scrollToSection(index: number) {
    this.currentStep = index;
    const section = document.getElementById(`section-${index}`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  back() {
    this.router.navigate(['/exportlc-welcome']);
  }

  save() {
    alert('Form saved successfully!');
  }
}
