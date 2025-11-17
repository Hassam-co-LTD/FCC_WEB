import { Component, HostListener, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({
  selector: 'app-shipping-guarantee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './shipping-guarantee-screen.html',
  styleUrls: ['./shipping-guarantee-screen.scss']
})
export class ShippingGuarantee {
  @ViewChildren('formSection, accordionSection') sections!: QueryList<ElementRef>;

  shippingForm: FormGroup;
  activeSection: string = 'general';
  issuingBanks: string[] = [];
  isDragging = false;
  uploadedFiles: File[] = [];
  errorMessage: string = '';
  maxFiles = 5;
  maxFileSize = 1 * 1024 * 1024; // 1MB

  sidebarSteps = [
    { number: 1, label: 'General Details', key: 'general' },
    { number: 2, label: 'Applicant & Beneficiary', key: 'applicant' },
    { number: 3, label: 'Bank Details', key: 'bank' },
    { number: 4, label: 'Instructions', key: 'instructions' },
    { number: 5, label: 'Attachments', key: 'attachments' },
    { number: 6, label: 'Preview', key: 'preview' }
  ];

  countryBanks: { [key: string]: string[] } = {
    PK: ['NBP', 'Bank Alfalah', 'Bank Islami', 'MCB Bank', 'Habib Bank Limited'],
    US: ['Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank'],
    IR: ['Bank Melli Iran', 'Bank Tejarat', 'Bank Sepah'],
    BD: ['Sonali Bank', 'BRAC Bank', 'Dutch-Bangla Bank', 'Islami Bank Bangladesh'],
    PS: ['Bank of Palestine', 'Arab Bank', 'Quds Bank']
  };

  constructor(private fb: FormBuilder, private el: ElementRef) {
    this.shippingForm = this.fb.group({
      expiryDate: ['', Validators.required],
      beneficiaryReference: [''],
      customerReference: [''],
      billNumber: ['', Validators.required],
      modeOfShipment: ['', Validators.required],
      shippingDetails: [''],
      descriptionOfGoods: ['', [Validators.required, Validators.maxLength(222)]],
      applicantName: ['', Validators.required],
      applicantAddress: ['', Validators.required],
      beneficiaryName: ['', Validators.required],
      beneficiaryAddress: ['', Validators.required],
      beneficiaryCountry: ['', Validators.required],
      issuingBank: ['', Validators.required],
      guaranteeAmount: ['', Validators.required],
      currency: ['', Validators.required],
      instructions: ['']
    });

    // Dynamically update bank list
    this.shippingForm.get('beneficiaryCountry')?.valueChanges.subscribe(countryCode => {
      this.issuingBanks = this.countryBanks[countryCode] || [];
      this.shippingForm.get('issuingBank')?.reset();
    });
  }

  // ---------- Accordion Behavior ----------
  toggleSection(section: string) {
    this.activeSection = this.activeSection === section ? '' : section;
    if (this.activeSection) {
      this.scrollToSection(this.activeSection);
    }
  }

  // ---------- Smooth Scroll ----------
  scrollToSection(sectionId: string) {
    this.activeSection = sectionId;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ---------- Auto Highlight & Open on Scroll ----------
  @HostListener('window:scroll', [])
  onScroll() {
    const sections = this.sidebarSteps.map(step => {
      const el = document.getElementById(step.key);
      if (!el) return { key: step.key, top: 0 };
      const rect = el.getBoundingClientRect();
      return { key: step.key, top: rect.top };
    });

    // Find the section closest to the top of viewport
    const visible = sections
      .filter(s => s.top >= -150) // tolerance for header
      .sort((a, b) => a.top - b.top)[0];

    if (visible && visible.key !== this.activeSection) {
      this.activeSection = visible.key;
    }
  }

  // ---------- File Upload ----------
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
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) this.handleFileUpload(Array.from(files));
  }

  onFileSelect(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) this.handleFileUpload(Array.from(files));
  }

  handleFileUpload(files: File[]) {
    this.errorMessage = '';

    for (const file of files) {
      if (this.uploadedFiles.length >= this.maxFiles) {
        this.errorMessage = `You can upload a maximum of ${this.maxFiles} files.`;
        break;
      }

      if (file.size > this.maxFileSize) {
        this.errorMessage = `File ${file.name} exceeds 1MB limit.`;
        continue;
      }

      const allowedTypes = [
        'application/pdf',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'image/gif',
        'image/png',
        'image/jpeg',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = `File ${file.name} has an unsupported format.`;
        continue;
      }

      this.uploadedFiles.push(file);
    }
  }

  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }

  previous() {}
  next() {}
}
