import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-export-screen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './export-screen.html',
  styleUrls: ['./export-screen.scss']
})
export class ExportScreenComponent {
  currentStep = 1;
  formSubmitted = false;
  files: File[] = [];

  generalDetails = {
    customerRef: '',
    advisingBank: '',
    issuerRef: ''
  };

  goToStep(step: number) {
    this.currentStep = step;
  }

  next() {
    this.formSubmitted = true;

    // Step 1 validation
    if (this.currentStep === 1) {
      const { advisingBank, issuerRef } = this.generalDetails;
      if (!advisingBank || !issuerRef) {
        alert('Please fill in all required fields before proceeding.');
        return;
      }
    }

    if (this.currentStep < 4) {
      this.currentStep++;
      this.formSubmitted = false;
    }
  }

  previous() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0]; // only 1 file allowed
    const allowedTypes = ['text/plain', 'application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      alert('Only .txt or .pdf files are allowed!');
      input.value = '';
      this.files = [];
      return;
    }

    this.files = [file]; // store only one file
  }

  formatFileSize(size: number): string {
    if (size < 1024) return size + ' B';
    if (size < 1048576) return (size / 1024).toFixed(1) + ' KB';
    return (size / 1048576).toFixed(1) + ' MB';
  }

  submit() {
    console.log('Submitting Letter of Credit:', {
      ...this.generalDetails,
      files: this.files.map(f => f.name)
    });
    alert('Letter of Credit exported successfully!');
    this.resetForm();
  }

  resetForm() {
    this.currentStep = 1;
    this.formSubmitted = false;
    this.generalDetails = { customerRef: '', advisingBank: '', issuerRef: '' };
    this.files = [];
  }
}
