import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { GeneralDetails } from './components/general-details/general-details';
import { Upload } from './components/upload/upload';
import { Attachments } from './components/attachments/attachments';
import { Sidebar } from '../../../../core/sidebar/sidebar';
import { SharedService } from '../../../../core/services/user-service/shared-form-service/shared-service';

@Component({
  selector: 'app-export-screen',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GeneralDetails,
    Upload,
    Attachments,
    Sidebar,
    RouterOutlet
],
  templateUrl: './export-screen.html',
  styleUrls: ['./export-screen.scss']
})
export class ExportScreen implements AfterViewInit {

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

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isPreviewRoute = event.urlAfterRedirects.includes('/export-screen/preview');
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
  ngAfterViewInit(): void {
  setTimeout(() => {
    const scrollArea = document.querySelector('.scroll-area') as HTMLElement;

    const sections = Array.from(
      document.querySelectorAll(
        '.scroll-area > section[id^="section-"]:not(#section-3)'
      )
    ) as HTMLElement[];

    if (!scrollArea || sections.length === 0) {
      return;
    }

    const updateActiveStep = () => {
      const containerTop = scrollArea.getBoundingClientRect().top;

      let activeIndex = 0;

      sections.forEach((section, index) => {
        const sectionTop = section.getBoundingClientRect().top;

        if (sectionTop <= containerTop + 50) {
          activeIndex = index;
        }
      });

      this.currentStep = activeIndex;
    };

    scrollArea.addEventListener('scroll', updateActiveStep);

    // Set correct active step when page initially loads
    updateActiveStep();
  }, 300);
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
