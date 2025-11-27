import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatListModule
],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss']
})
export class Preview {
  form: FormGroup;

  // sample lists
  bankList = ['UBL', 'HBL', 'SAMBA'];
  countryList = [
    { code: 'PKR', name: 'Pakistan (PKR)' },
    { code: 'USD', name: 'United States (USD)' },
    { code: 'SAR', name: 'Saudi Arabia (SAR)' },
    { code: 'IRR', name: 'Iran (IRR)' }
  ];

  uploadedFiles: File[] = [];
  errorMessage = '';
  isDragging = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      // General
      expiryDate: [''],
      beneficiaryReference: [''],
      customerReference: [''],
      billNumber: [''],
      modeOfShipment: [''],
      shippingDetails: [''],
      descriptionOfGoods: [''],

      // Applicant & Beneficiary
      applicantName: [''],
      applicantAddress1: [''],
      applicantAddress2: [''],
      beneficiaryName: [''],
      beneficiaryAddress1: [''],
      beneficiaryAddress2: [''],
      beneficiaryCountry: [''],

      // Bank
      bankName: [''],
      IssuerReference: [''],
      currency: [''],
      guaranteeAmount: [0],

      // Instructions
      principalAccount: [''],
      faxAccount: [''],
      details: [''],

      // Attachments will be handled separately (uploadedFiles array)
    });

    // (optional) react to changes — we don't need to subscribe for template bindings,
    // but you can use this.form.valueChanges if you want to process changes server-side.
  }

  // Amount controls
  incrementAmount() {
    const current = Number(this.form.get('guaranteeAmount')?.value || 0);
    this.form.get('guaranteeAmount')?.setValue(current + 1);
  }

  decrementAmount() {
    const current = Number(this.form.get('guaranteeAmount')?.value || 0);
    if (current > 0) this.form.get('guaranteeAmount')?.setValue(current - 1);
  }

  // Attachment handlers (drag/drop + browse)
  onDragOver(ev: DragEvent) {
    ev.preventDefault();
    this.isDragging = true;
  }
  onDragLeave(ev: DragEvent) {
    ev.preventDefault();
    this.isDragging = false;
  }
  onDrop(ev: DragEvent) {
    ev.preventDefault();
    this.isDragging = false;
    const files = Array.from(ev.dataTransfer?.files || []);
    this.addFiles(files);
  }
  onFileSelected(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    this.addFiles(files);
    // clear input value so selecting same file again works
    (e.target as HTMLInputElement).value = '';
  }

  private addFiles(files: File[]) {
    for (const file of files) {
      if (this.uploadedFiles.length >= 5) {
        this.errorMessage = 'Maximum 5 files allowed.';
        return;
      }
      if (file.size > 1024 * 1024) {
        this.errorMessage = 'Each file must be <= 1 MB.';
        return;
      }
      // Accept common extensions — you may want to validate type/name here
      this.uploadedFiles.push(file);
    }
    this.errorMessage = '';
  }

  removeFile(i: number) {
    this.uploadedFiles.splice(i, 1);
  }

  // Optional submit handler
  onSubmit() {
    if (this.form.invalid) return;
    // gather data and send to server or pass to preview — preview is live already
    console.log('Form submitted', this.form.value, { attachments: this.uploadedFiles });
    alert('Submitted (see console)');
  }

  // helper: safe value getter used in template
  getValue(path: string) {
    return this.form.get(path)?.value;
  }
}
