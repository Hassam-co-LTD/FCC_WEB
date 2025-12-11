import { Component, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeneralDetails } from '../../USER/export-screen/components/general-details/general-details';
import { Upload } from "./components/upload/upload";
import { Attachments } from "./components/attachments/attachments";
import { Sidebar } from '../../../core/sidebar/sidebar';
import { Router, NavigationEnd } from '@angular/router';
import { SharedService } from '../../../core/services/user-service/shared-form-service/shared-service';
import { RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-export-screen',
  standalone: true,
  imports: [
    CommonModule,
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
  isPreviewRoute = false; // <-- Track if preview is active

  exportlcSteps = [
    { label: 'General Details' },
    { label: 'Upload MT700/MT701' },
    { label: 'Attachments' }
  ];

  exportLCForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private dataService: SharedService) {
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

    // Listen to route changes to detect preview
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isPreviewRoute = event.urlAfterRedirects.includes('export-screen/preview');
    });
  }

  get generalDetailsForm(): FormGroup {
    return this.exportLCForm.get('generalDetails') as FormGroup;
  }

  get uploadForm(): FormGroup {
    return this.exportLCForm.get('appUpload') as FormGroup;
  }

  get attachmentsArray(): FormArray {
    return this.exportLCForm.get('attachments') as FormArray;
  }

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

  previous() {
    if (this.currentStep > 0)
      this.scrollToSection(this.currentStep - 1);
  }

  save() {
    alert("Form saved successfully!");
  }

  preview() {
  if (this.exportLCForm.invalid) {
    this.exportLCForm.markAllAsTouched();
    alert("Please fill all required fields before preview.");
    return;
  }

  // Save form data to shared service
  this.dataService.setFormData(this.exportLCForm.value);

  // Navigate to preview page
  this.router.navigate(['/export-screen/preview']);
}

}
