import { Component } from '@angular/core';
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
  shippingForm: FormGroup;
  activeSection: string = 'general';

  // Existing fields
  fileName: string | null = null;
  issuingBanks: string[] = [];
  countryBanks: { [key: string]: string[] } = {
    PK: ['NBP', 'Bank Alfalah', 'Bank Islami', 'MCB Bank', 'Habib Bank Limited'],
    US: ['Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank'],
    IR: ['Bank Melli Iran', 'Bank Tejarat', 'Bank Sepah'],
    BD: ['Sonali Bank', 'BRAC Bank', 'Dutch-Bangla Bank', 'Islami Bank Bangladesh'],
    PS: ['Bank of Palestine', 'Arab Bank', 'Quds Bank']
  };

  // 🔽 New properties for attachments
  uploadedFiles: File[] = [];
  errorMessage: string = '';
  isDragging: boolean = false;

  // Allowed file extensions
  allowedExtensions = ['pdf', 'txt', 'docx', 'gif', 'doc', 'png', 'csv', 'xls', 'xlsx', 'jpg', 'jpeg'];

  constructor(private fb: FormBuilder) {
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

    // 🔥 Update banks dynamically based on country
    this.shippingForm.get('beneficiaryCountry')?.valueChanges.subscribe(countryCode => {
      this.issuingBanks = this.countryBanks[countryCode] || [];
      this.shippingForm.get('issuingBank')?.reset();
    });
  }

  toggleSection(section: string) {
    this.activeSection = this.activeSection === section ? '' : section;
  }

  // 🔽 Handle manual file selection
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.validateAndAddFiles(files);
    }
  }

  // 🔽 Handle drag enter
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  // 🔽 Handle drag leave
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  // 🔽 Handle file drop
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      const files = Array.from(event.dataTransfer.files);
      this.validateAndAddFiles(files);
    }
  }

  // 🔽 Validate and add files
  private validateAndAddFiles(files: File[]) {
    this.errorMessage = '';

    for (let file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const sizeMB = file.size / (1024 * 1024);

      if (!this.allowedExtensions.includes(ext)) {
        this.errorMessage = `Invalid file type: ${file.name}`;
        return;
      }

      if (sizeMB > 1) {
        this.errorMessage = `File too large (max 1MB): ${file.name}`;
        return;
      }

      if (this.uploadedFiles.length >= 5) {
        this.errorMessage = 'Maximum 5 files allowed.';
        return;
      }

      // Avoid duplicate files
      const duplicate = this.uploadedFiles.some(f => f.name === file.name && f.size === file.size);
      if (!duplicate) this.uploadedFiles.push(file);
    }
  }

  // 🔽 Remove a file
  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }
}
