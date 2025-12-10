import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedService } from '../../../../../core/services/user-service/shared-form-service/shared-service';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ]
})
export class preview implements OnInit {
  form!: FormGroup;
  selectedTab: string = 'issuing';

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    // Get data from shared service
    const formData = this.sharedService.getFormData() || {};
    
    // Initialize form with all sections
    this.form = this.fb.group({
      generalDetails: this.fb.group(formData.generalDetails || {}),
      applicantBeneficiaryForm: this.fb.group(formData.applicantBeneficiaryForm || {}),
      bankForm: this.fb.group({
        ...formData.bankForm,
        selectedTab: formData.bankForm?.selectedTab || 'issuing'
      }),
      undertakingDetailsForm: this.fb.group(formData.undertakingDetailsForm || {}),
      instructionsForm: this.fb.group(formData.instructionsForm || {}),
      attachments: this.fb.array(formData.attachments || [])
    });

    // Set selected tab from bank form
    this.selectedTab = this.form.get('bankForm.selectedTab')?.value || 'issuing';
  }

  // Helper methods for formatting
  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return value.toString();
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toLocaleDateString();
    return date.toString();
  }

  formatAddress(addr1?: string, addr2?: string, addr3?: string): string {
    const parts = [addr1, addr2, addr3].filter(part => part && part.trim());
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  }

  formatEffectiveOption(option: string): string {
    const optionsMap: {[key: string]: string} = {
      'openIssuance': 'Upon Issuance',
      'whenSigned': 'When contract is signed',
      'advancedOccur': 'When advance payment occurs',
      'other': 'Other'
    };
    return optionsMap[option] || option || 'N/A';
  }

  formatDemandOption(option: string): string {
    const optionsMap: {[key: string]: string} = {
      'multipleDemandnot': 'Multiple demand not permitted',
      'multiplepartialDemandnot': 'Multiple & partial demands not permitted',
      'partialDemand': 'Partial demands permitted',
      'multiplepartialDemand': 'Multiple & partial demands permitted'
    };
    return optionsMap[option] || option || 'N/A';
  }

  formatGoverningLaws(countryCode: string): string {
    const lawsMap: {[key: string]: string} = {
      'pk': 'Pakistan',
      'in': 'India',
      'ae': 'UAE',
      'pl': 'Poland'
    };
    return lawsMap[countryCode] || countryCode || 'N/A';
  }

  getSelectedTabLabel(): string {
    const labels: {[key: string]: string} = {
      'issuing': 'Issuing Bank',
      'advising': 'Advising Bank',
      'adviseThrough': 'Advise Through Bank'
    };
    return labels[this.selectedTab] || 'N/A';
  }

  get attachmentsArray(): FormArray {
    return this.form.get('attachments') as FormArray;
  }

  getFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    const typeMap: {[key: string]: string} = {
      'pdf': 'PDF',
      'jpg': 'Image',
      'jpeg': 'Image',
      'png': 'Image',
      'gif': 'Image',
      'doc': 'Document',
      'docx': 'Document',
      'xls': 'Spreadsheet',
      'xlsx': 'Spreadsheet',
      'txt': 'Text',
      'rtf': 'Rich Text'
    };
    return typeMap[extension || ''] || 'File';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  downloadFile(index: number): void {
    const file = this.attachmentsArray.at(index).value;
    if (file && file.file) {
      const blob = new Blob([file.file], { type: file.type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      window.URL.revokeObjectURL(url);
      
      this.snackBar.open('File download started', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }
  }

  removeFile(index: number): void {
    this.attachmentsArray.removeAt(index);
    this.snackBar.open('File removed', 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  previous(): void {
    this.router.navigate(['/import-screen']);
  }

  submit(): void {
    console.log('Form submitted:', this.form.value);
    
    this.snackBar.open('Undertaking successfully submitted!', 'Close', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });

    // Navigate to success page
    this.router.navigate(['/import-screen/success']);
  }
}