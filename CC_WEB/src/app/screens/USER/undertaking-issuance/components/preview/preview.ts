import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedService } from '../../../../../core/services/user-service/shared-form-service/shared-service';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss']
})
export class preview implements OnInit {
previous() {
throw new Error('Method not implemented.');
}
  form!: FormGroup;
  selectedTab = 'issuing';

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.buildPreviewForm();
  }

  private buildPreviewForm(): void {
    const data = this.sharedService.getFormData();

    if (!data) {
      this.snackBar.open('No data found to preview', 'Close', { duration: 3000 });
      this.router.navigate(['/undertaking-issuance/request-undertaking']);
      return;
    }

    console.log('Preview Data:', data); // Debug log

    // Build the form structure matching RequestUndertaking
    this.form = this.fb.group({
      // FIXED: Changed from 'generalDetails' to 'generalDetailsform' to match RequestUndertaking
      generalDetails: this.fb.group({
        productType: [data.generalDetailsform?.productType ?? ''],
        modeOfTransmission: [data.generalDetailsform?.modeOfTransmission ?? ''],
        formOfUndertaking: [data.generalDetailsform?.formOfUndertaking ?? ''],
        purpose: [data.generalDetailsform?.purpose ?? '']
      }),

      // FIXED: Changed from 'applicantBeneficiaryForm' to 'applicantBeneficiary'
      applicantBeneficiaryForm: this.fb.group({
        applicantName: [data.applicantBeneficiary?.applicantName ?? ''],
        beneficiaryName: [data.applicantBeneficiary?.beneficiaryName ?? ''],
        applicantAddress1: [data.applicantBeneficiary?.applicantAddress1 ?? ''],
        applicantAddress2: [data.applicantBeneficiary?.applicantAddress2 ?? ''],
        applicantAddress3: [data.applicantBeneficiary?.applicantAddress3 ?? '']
      }),

      // FIXED: Already matches 'bankForm'
      bankForm: this.fb.group({
        recipientBankName: [data.bankForm?.recipientBankName ?? ''],
        issuerReference: [data.bankForm?.issuerReference ?? ''],
        swift: [data.bankForm?.swift ?? ''],
        bankName: [data.bankForm?.bankName ?? ''],
        country: [data.bankForm?.country ?? ''],
        selectedTab: [data.bankForm?.selectedTab ?? 'issuing']
      }),

      // FIXED: Changed from 'undertakingDetailsForm' to 'undertakingDetails'
      undertakingDetailsForm: this.fb.group({
        typeOfUndertaking: [data.undertakingDetails?.typeOfUndertaking ?? ''],
        effectiveOption: [data.undertakingDetails?.effectiveOption ?? ''],
        expiryType: [data.undertakingDetails?.expiryType ?? ''],
        expiryDate: [data.undertakingDetails?.expiryDate ?? ''],
        currency: [data.undertakingDetails?.currency ?? ''],
        undertakingAmount: [data.undertakingDetails?.undertakingAmount ?? '']
      }),

      // FIXED: Changed from 'instructionsForm' to 'instructions'
      instructionsForm: this.fb.group({
        deliveryType: [data.instructions?.deliveryType ?? ''],
        deliveryMode: [data.instructions?.deliveryMode ?? ''],
        deliveryTo: [data.instructions?.deliveryTo ?? ''],
        principalAccount: [data.instructions?.principalAccount ?? '']
      }),

      // FIXED: Changed to match the structure from RequestUndertaking
      attachments: this.fb.array([])
    });

    // Add attachments if they exist
    if (data.attachments && data.attachments.length > 0) {
      console.log('Processing attachments:', data.attachments); // Debug log
      data.attachments.forEach((file: any) => {
        this.attachmentsArray.push(this.fb.group({
          name: [file.name || ''],
          size: [file.size || 0],
          type: [file.type || this.getFileType(file.name)],
          file: [file.file || null]
        }));
      });
    }

    this.selectedTab = this.form.get('bankForm.selectedTab')?.value || 'issuing';
    console.log('Preview Form Built:', this.form.value); // Debug log
  }

  // Helper getters
  get attachmentsArray(): FormArray {
    return this.form.get('attachments') as FormArray;
  }

  // Format helpers
  format(value: any): string {
    return value || value === 0 ? String(value) : '—';
  }

  formatDate(value: any): string {
    if (!value) return '—';
    try {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date.toLocaleDateString();
    } catch {
      return value;
    }
  }

  address(a?: string, b?: string, c?: string): string {
    const parts = [a, b, c].filter(part => part && part.trim() !== '');
    return parts.length > 0 ? parts.join(', ') : '—';
  }

  getSelectedTabLabel(): string {
    const map: { [key: string]: string } = {
      issuing: 'Issuing Bank',
      advising: 'Advising Bank',
      adviseThrough: 'Advise Through Bank'
    };
    return map[this.selectedTab] || '—';
  }

  getFileType(filename: string): string {
    if (!filename) return 'FILE';
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return ext.toUpperCase();
  }

  formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Actions
  downloadFile(index: number): void {
    const fileGroup = this.attachmentsArray.at(index);
    const file = fileGroup.value;
    
    if (file.file instanceof File) {
      const url = URL.createObjectURL(file.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (file.base64) {
      const link = document.createElement('a');
      link.href = file.base64;
      link.download = file.name;
      link.click();
    } else {
      this.snackBar.open('File not available for download', 'Close', { duration: 3000 });
    }
  }

  removeFile(index: number): void {
    this.attachmentsArray.removeAt(index);
  }

  back(): void {
    this.router.navigate(['/undertaking-issuance/request-undertaking']);
  }

  submit(): void {
    const payload = this.form.getRawValue();
    console.log('Final Submit Payload:', payload);
    
    // Here you would typically send the data to your backend
    this.snackBar.open('Undertaking request submitted successfully!', 'Close', { duration: 5000 });
    
    // Navigate to success page or dashboard
    // this.router.navigate(['/success']);
  }
}