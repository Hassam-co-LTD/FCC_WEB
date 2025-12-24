import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../../../../../core/services/user-service/shared-form-service/shared-service';
import { UndertakingIssuanceService, UndertakingTransaction } from '../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
  providers: [DatePipe]
})
export class Preview implements OnInit {
  form!: FormGroup;
  lastUpdated: Date = new Date();
  isSaving: boolean = false;
  isSubmitting: boolean = false;

  // Form section getters for template
  get generalDetails(): FormGroup { 
    return this.form?.get('generalDetails') as FormGroup || this.fb.group({}); 
  }
  
  get applicantBeneficiary(): FormGroup { 
    return this.form?.get('applicantBeneficiary') as FormGroup || this.fb.group({}); 
  }
  
  get bankForm(): FormGroup { 
    return this.form?.get('bankForm') as FormGroup || this.fb.group({}); 
  }
  
  get undertakingDetails(): FormGroup { 
    return this.form?.get('undertakingDetails') as FormGroup || this.fb.group({}); 
  }
  
  get instructions(): FormGroup { 
    return this.form?.get('instructions') as FormGroup || this.fb.group({}); 
  }

  constructor(
    private sharedService: SharedService,
    private undertakingService: UndertakingIssuanceService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    console.log('Preview Component initialized');
    this.loadFormData();
  }

  private loadFormData() {
    console.log('=== LOAD FORM DATA ===');
    
    const savedData = this.sharedService.getFormData();
    
    console.log('Saved data from service:', savedData);
    
    if (!savedData) {
      console.log('No saved data found');
      this.snackBar.open('No form data found. Please complete the undertaking form first.', 'Close', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/undertaking-issuance/request-undertaking']);
      return;
    }

    let formData: any;

    if (savedData.generalDetails || savedData.applicantBeneficiary || savedData.bankForm) {
      console.log('Using method 1: Direct form values');
      formData = savedData;
    } else if (savedData.form && savedData.form.generalDetails) {
      console.log('Using method 2: Form inside savedData.form');
      formData = savedData.form;
    } else if (savedData.form && savedData.form instanceof FormGroup) {
      console.log('Using method 3: FormGroup object');
      this.form = savedData.form;
      this.lastUpdated = new Date();
      console.log('Form loaded directly as FormGroup:', this.form.value);
      return;
    } else {
      console.error('Could not determine data structure:', savedData);
      this.snackBar.open('Invalid form data format. Please fill the form again.', 'Close', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/undertaking-issuance/request-undertaking']);
      return;
    }

    console.log('Form data to build from:', formData);
    
    // Build the form structure
    this.form = this.fb.group({
      generalDetails: this.fb.group({
        productType: [formData.generalDetails?.productType || ''],
        modeOfTransmission: [formData.generalDetails?.modeOfTransmission || ''],
        formOfUndertaking: [formData.generalDetails?.formOfUndertaking || ''],
        purpose: [formData.generalDetails?.purpose || ''],
        preference: [formData.generalDetails?.preference || 'Standard']
      }),
      applicantBeneficiary: this.fb.group({
        applicantName: [formData.applicantBeneficiary?.applicantName || ''],
        applicantAddress1: [formData.applicantBeneficiary?.applicantAddress1 || ''],
        applicantAddress2: [formData.applicantBeneficiary?.applicantAddress2 || ''],
        applicantAddress3: [formData.applicantBeneficiary?.applicantAddress3 || ''],
        beneficiaryName: [formData.applicantBeneficiary?.beneficiaryName || ''],
        beneficiaryCountry: [formData.applicantBeneficiary?.beneficiaryCountry || ''],
        beneficiaryAddress1: [formData.applicantBeneficiary?.beneficiaryAddress1 || ''],
        beneficiaryAddress2: [formData.applicantBeneficiary?.beneficiaryAddress2 || ''],
        beneficiaryAddress3: [formData.applicantBeneficiary?.beneficiaryAddress3 || '']
      }),
      bankForm: this.fb.group({
        recipientBankName: [formData.bankForm?.recipientBankName || ''],
        issuerReference: [formData.bankForm?.issuerReference || ''],
        selectedTab: [formData.bankForm?.selectedTab || 'issuing'],
        issuanceType: [formData.bankForm?.issuanceType || ''],
        swift: [formData.bankForm?.swift || ''],
        bankName: [formData.bankForm?.bankName || ''],
        country: [formData.bankForm?.country || '']
      }),
      undertakingDetails: this.fb.group({
        typeOfUndertaking: [formData.undertakingDetails?.typeOfUndertaking || ''],
        currency: [formData.undertakingDetails?.currency || 'USD'],
        undertakingAmount: [formData.undertakingDetails?.undertakingAmount || 0],
        expiryDate: [formData.undertakingDetails?.expiryDate || ''],
        contractAmount: [formData.undertakingDetails?.contractAmount || 0],
        contractCurrency: [formData.undertakingDetails?.contractCurrency || 'USD'],
        applicableRules: [formData.undertakingDetails?.applicableRules || ''],
        governinglawsType: [formData.undertakingDetails?.governinglawsType || ''],
        languageType: [formData.undertakingDetails?.languageType || '']
      }),
      instructions: this.fb.group({
        deliveryType: [formData.instructions?.deliveryType || 'original'],
        deliveryMode: [formData.instructions?.deliveryMode || 'courier'],
        deliveryTo: [formData.instructions?.deliveryTo || 'ourselves'],
        principalAccount: [formData.instructions?.principalAccount || ''],
        feeAccount: [formData.instructions?.feeAccount || ''],
        otherInstructions: [formData.instructions?.otherInstructions || '']
      }),
      attachments: this.fb.group({
        files: this.fb.array(formData.attachments?.files || []),
        documents: this.fb.array(formData.attachments?.documents || [])
      })
    });

    console.log('Form built successfully:', this.form.value);
    this.lastUpdated = new Date();
  }

  // ================= FORM STATUS & COMPLETION =================
  getFormCompletion(): number {
    if (!this.form) return 0;
    
    const sections = ['generalDetails', 'applicantBeneficiary', 'bankForm', 'undertakingDetails', 'instructions'];
    let totalFields = 0;
    let filledFields = 0;
    
    sections.forEach(section => {
      const group = this.form.get(section) as FormGroup;
      if (group) {
        Object.keys(group.controls).forEach(key => {
          totalFields++;
          const control = group.get(key);
          const value = control?.value;
          
          // Check if field has a value
          if (value !== null && value !== undefined && value !== '' && value !== false) {
            // Special check for amount fields
            if (key.includes('Amount') || key.includes('amount')) {
              if (Number(value) > 0) filledFields++;
            } else {
              filledFields++;
            }
          }
        });
      }
    });
    
    return totalFields ? Math.round((filledFields / totalFields) * 100) : 0;
  }

  getFormStatus(): string {
    const completion = this.getFormCompletion();
    if (completion >= 100) return 'Complete';
    if (completion >= 80) return 'Ready to Submit';
    if (completion >= 50) return 'Partially Complete';
    return 'In Progress';
  }

  isFormComplete(): boolean { 
    return this.getFormCompletion() >= 80;
  }

  // ================= FORMAT HELPERS =================
  formatValue(value: any): string {
    if (value === null || value === undefined || value === '' || value === false) return 'Not specified';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.length ? value.join(', ') : 'None';
    if (typeof value === 'number') {
      // Format numbers with commas
      return value.toLocaleString('en-US');
    }
    return String(value).trim();
  }

  formatDate(dateValue: any): string {
    if (!dateValue) return 'Not specified';
    try {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? 'Invalid date' : 
        this.datePipe.transform(date, 'dd/MM/yyyy') || 'Invalid date';
    } catch { 
      return String(dateValue); 
    }
  }

  formatCurrency(amount: any, currency: string = 'USD'): string {
    if (amount === null || amount === undefined || amount === '') return 'Not specified';
    const num = Number(amount);
    if (isNaN(num) || num === 0) return 'Not specified';
    
    const formatted = new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(num);
    
    return currency ? `${currency} ${formatted}` : formatted;
  }

  formatBankTab(tab: string): string {
    const map: {[key: string]: string} = { 
      'issuing': 'Issuing Bank', 
      'advising': 'Advising Bank', 
      'adviseThrough': 'Advise Through Bank' 
    };
    return map[tab] || tab || 'Not specified';
  }

  formatDeliveryType(type: string): string {
    const map: {[key: string]: string} = {
      'original': 'Delivery of Original Undertaking',
      'copy': 'Copy',
      'electronic': 'Electronic Delivery'
    };
    return map[type] || type || 'Not specified';
  }

  formatDeliveryMode(mode: string): string {
    const map: {[key: string]: string} = {
      'courier': 'Courier',
      'pickup': 'Pick Up',
      'email': 'Email',
      'swift': 'SWIFT',
      'fax': 'Fax'
    };
    return map[mode] || mode || 'Not specified';
  }

  formatDeliveryTo(to: string): string {
    const map: {[key: string]: string} = {
      'ourselves': 'Ourselves',
      'beneficiary': 'Beneficiary',
      'representative': 'Representative',
      'agent': 'Agent',
      'other': 'Other'
    };
    return map[to] || to || 'Not specified';
  }

  // ================= ATTACHMENTS HANDLING =================
  getAttachments(): any[] {
    if (!this.form) return [];
    
    try {
      const attachmentsCtrl = this.form.get('attachments.files') as FormArray;
      const documentsCtrl = this.form.get('attachments.documents') as FormArray;
      
      const files = attachmentsCtrl ? attachmentsCtrl.value : [];
      const documents = documentsCtrl ? documentsCtrl.value : [];
      
      return [...files, ...documents];
    } catch (error) {
      console.error('Error getting attachments:', error);
      return [];
    }
  }

  getAttachmentsCount(): number { 
    return this.getAttachments().length;
  }

  getFileIcon(file: any): string {
    if (!file) return 'insert_drive_file';
    const name = (file.name || file.fileName || '').toLowerCase();
    const type = (file.type || '').toLowerCase();
    
    if (name.includes('.pdf') || type.includes('pdf')) return 'picture_as_pdf';
    if (name.match(/\.(jpg|jpeg|png|gif|bmp|svg)$/) || type.includes('image')) return 'image';
    if (name.match(/\.(doc|docx)$/) || type.includes('word')) return 'description';
    if (name.match(/\.(xls|xlsx|csv)$/) || type.includes('excel') || type.includes('csv')) return 'table_chart';
    if (name.match(/\.(txt|rtf)$/) || type.includes('text')) return 'text_snippet';
    if (name.match(/\.(zip|rar|7z)$/) || type.includes('zip')) return 'folder_zip';
    return 'insert_drive_file';
  }

  getFileType(file: any): string {
    if (!file) return 'Unknown';
    const name = file.name || file.fileName || '';
    const ext = name.split('.').pop()?.toLowerCase() || '';
    
    const types: {[key: string]: string} = { 
      'pdf': 'PDF', 
      'jpg': 'Image', 'jpeg': 'Image', 'png': 'Image', 'gif': 'Image', 'bmp': 'Image', 'svg': 'Image',
      'doc': 'Word', 'docx': 'Word',
      'xls': 'Excel', 'xlsx': 'Excel', 'csv': 'CSV',
      'txt': 'Text', 'rtf': 'Rich Text',
      'zip': 'ZIP', 'rar': 'RAR', '7z': '7-Zip'
    };
    
    return types[ext] || ext.toUpperCase() || 'File';
  }

  formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getTotalFileSize(): string {
    const total = this.getAttachments().reduce((sum, f) => sum + (f.size || 0), 0);
    return this.formatSize(total);
  }

  downloadFile(file: any, index: number) {
    if (!file) {
      this.snackBar.open('No file data available', 'Close', { 
        duration: 2000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    try {
      const a = document.createElement('a');
      let url: string;
      
      if (file.content && file.content.startsWith('data:')) {
        // Data URL
        url = file.content;
        a.download = file.name || file.fileName || 'file';
      } else if (file.file instanceof File) {
        // File object
        url = window.URL.createObjectURL(file.file);
        a.download = file.file.name;
      } else if (file.url) {
        // External URL
        window.open(file.url, '_blank');
        this.snackBar.open('Opening file...', 'Close', { 
          duration: 1500,
          panelClass: ['info-snackbar']
        });
        return;
      } else {
        // Create a blob from other data
        const blob = new Blob([JSON.stringify(file)], { type: 'application/json' });
        url = window.URL.createObjectURL(blob);
        a.download = (file.name || file.fileName || 'file') + '.json';
      }
      
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      if (url.startsWith('blob:')) {
        window.URL.revokeObjectURL(url);
      }
      
      this.snackBar.open('File downloaded successfully', 'Close', { 
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      this.snackBar.open('Error downloading file', 'Close', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  removeFile(index: number) {
    if (!confirm('Are you sure you want to remove this file?')) return;
    
    const attachmentsCtrl = this.form.get('attachments.files') as FormArray;
    const documentsCtrl = this.form.get('attachments.documents') as FormArray;
    
    // Try to remove from files first
    if (attachmentsCtrl && index < attachmentsCtrl.length) {
      attachmentsCtrl.removeAt(index);
    } 
    // If not in files, try documents
    else if (documentsCtrl) {
      const docIndex = index - (attachmentsCtrl?.length || 0);
      if (docIndex >= 0 && docIndex < documentsCtrl.length) {
        documentsCtrl.removeAt(docIndex);
      }
    }
    
    this.snackBar.open('File removed successfully', 'Close', { 
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  // ================= SAVE AS DRAFT =================
  saveAsDraft() {
    if (this.isSaving) return;
    
    this.isSaving = true;
    
    // Check form completion
    const completion = this.getFormCompletion();
    if (completion < 50) {
      this.snackBar.open('Please complete at least 50% of the form before saving as draft', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      this.isSaving = false;
      return;
    }

    try {
      // Prepare draft data
      const draftData = {
        ...this.form.value,
        status: 'Draft',
        draftSavedAt: new Date().toISOString(),
        formData: this.form.value, // Keep full form data for editing
        canEdit: true,
        canView: true
      };

      console.log('=== SAVING AS DRAFT ===');
      console.log('Draft data:', draftData);

      // Generate references
      const timestamp = Date.now();
      const channelRef = `UND-DRAFT-${timestamp.toString().slice(-6)}`;
      const customerRef = `CUST-${timestamp.toString().slice(-6)}`;

      // Prepare transaction object
      const transactionData: UndertakingTransaction = {
        id: this.generateTransactionId(),
        type: 'undertaking',
        channelReference: channelRef,
        customerReference: customerRef,
        bankReference: `BANK-${timestamp.toString().slice(-6)}`,
        issueDate: new Date(),
        status: 'Draft',
        beneficiary: draftData.applicantBeneficiary?.beneficiaryName || 'Not specified',
        beneficiaryCountry: draftData.applicantBeneficiary?.beneficiaryCountry || '',
        currency: draftData.undertakingDetails?.currency || 'USD',
        amount: Number(draftData.undertakingDetails?.undertakingAmount) || 0,
        outstandingAmount: Number(draftData.undertakingDetails?.undertakingAmount) || 0,
        expiryDate: draftData.undertakingDetails?.expiryDate ? 
          new Date(draftData.undertakingDetails.expiryDate) : 
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isNew: true,
        preference: draftData.generalDetails?.preference || 'Standard',
        productType: draftData.generalDetails?.productType || 'Performance Guarantee',
        applicantName: draftData.applicantBeneficiary?.applicantName || 'Not specified',
        formOfUndertaking: draftData.generalDetails?.formOfUndertaking || 'Standby LC',
        createdAt: new Date(),
        updatedAt: new Date(),
        canEdit: true,
        canView: true,
        formData: draftData.formData,
        draftSavedAt: new Date()
      };

      console.log('Transaction data to save:', transactionData);

      // Save draft using the service
      const savedTransaction = this.undertakingService.saveAsDraft(transactionData);
      
      if (!savedTransaction) {
        throw new Error('Failed to save draft transaction');
      }

      // Also update SharedService with the transaction data for editing
      this.sharedService.setFormData({
        ...draftData,
        transactionId: savedTransaction.id,
        channelReference: savedTransaction.channelReference,
        transactionType: 'undertaking'
      });

      // Show success message
      this.snackBar.open(
        `Draft saved successfully! Reference: ${savedTransaction.channelReference}`, 
        'Close', { 
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        }
      );
      
      // Navigate to dashboard after a delay
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1500);
      
    } catch (error) {
      console.error('Error saving draft:', error);
      this.snackBar.open(
        `Error saving draft: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        'Close', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        }
      );
    } finally {
      this.isSaving = false;
    }
  }

  // ================= SUBMIT FOR APPROVAL =================
  submit() {
    if (this.isSubmitting) return;
    
    this.isSubmitting = true;
    
    if (!this.isFormComplete()) {
      this.snackBar.open('Please complete all required fields before submitting (minimum 80%)', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.isSubmitting = false;
      return;
    }

    try {
      // Validate required fields
      const requiredFields = this.validateRequiredFields();
      if (requiredFields.length > 0) {
        this.snackBar.open(`Missing required fields: ${requiredFields.join(', ')}`, 'Close', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
        return;
      }

      // Prepare submission data
      const submissionData = {
        ...this.form.value,
        submittedAt: new Date().toISOString(),
        status: 'Pending Approval'
      };

      console.log('=== SUBMITTING FOR APPROVAL ===');
      console.log('Submission data:', submissionData);

      // Generate references
      const timestamp = Date.now();
      const channelRef = `UND-${timestamp.toString().slice(-6)}`;
      const customerRef = `CUST-${timestamp.toString().slice(-6)}`;

      // Prepare transaction object
      const transactionData: UndertakingTransaction = {
        id: this.generateTransactionId(),
        type: 'undertaking',
        channelReference: channelRef,
        customerReference: customerRef,
        bankReference: `BANK-${timestamp.toString().slice(-6)}`,
        issueDate: new Date(),
        status: 'Pending Approval',
        beneficiary: this.getBeneficiaryName(submissionData),
        beneficiaryCountry: this.getBeneficiaryCountry(submissionData),
        currency: this.getCurrency(submissionData),
        amount: this.getAmount(submissionData),
        outstandingAmount: this.getAmount(submissionData),
        expiryDate: this.getExpiryDate(submissionData),
        isNew: true,
        preference: this.getPreference(submissionData),
        productType: this.getProductType(submissionData),
        applicantName: this.getApplicantName(submissionData),
        formOfUndertaking: this.getFormOfUndertaking(submissionData),
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        canEdit: false,
        canView: true,
        formData: submissionData
      };

      console.log('Transaction data:', transactionData);

      // Submit for approval
      const transaction = this.undertakingService.submitForApproval(transactionData);
      
      if (!transaction) {
        throw new Error('Failed to submit transaction for approval');
      }

      // Clear form data from SharedService
      this.sharedService.clearFormData();
      
      // Show success message
      this.snackBar.open(
        `Undertaking submitted for approval! Reference: ${transaction.channelReference}`, 
        'Close', { 
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        }
      );

      // Navigate to dashboard
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting undertaking:', error);
      this.snackBar.open(
        `Error submitting undertaking: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        'Close', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        }
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  // ================= HELPER METHODS =================
  private generateTransactionId(): string {
    return `UND-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private validateRequiredFields(): string[] {
    const missingFields: string[] = [];
    
    // Check general details
    if (!this.generalDetails?.get('productType')?.value) missingFields.push('Product Type');
    if (!this.generalDetails?.get('formOfUndertaking')?.value) missingFields.push('Form of Undertaking');
    
    // Check applicant
    if (!this.applicantBeneficiary?.get('applicantName')?.value) missingFields.push('Applicant Name');
    
    // Check beneficiary
    if (!this.applicantBeneficiary?.get('beneficiaryName')?.value) missingFields.push('Beneficiary Name');
    
    // Check undertaking details
    if (!this.undertakingDetails?.get('undertakingAmount')?.value || 
        Number(this.undertakingDetails?.get('undertakingAmount')?.value) <= 0) {
      missingFields.push('Undertaking Amount');
    }
    if (!this.undertakingDetails?.get('expiryDate')?.value) missingFields.push('Expiry Date');
    
    return missingFields;
  }

  private getBeneficiaryName(data: any): string {
    return data?.applicantBeneficiary?.beneficiaryName || 
           data?.formData?.applicantBeneficiary?.beneficiaryName || 
           this.applicantBeneficiary?.get('beneficiaryName')?.value ||
           'Not specified';
  }

  private getBeneficiaryCountry(data: any): string {
    return data?.applicantBeneficiary?.beneficiaryCountry || 
           data?.formData?.applicantBeneficiary?.beneficiaryCountry || 
           this.applicantBeneficiary?.get('beneficiaryCountry')?.value ||
           '';
  }

  private getCurrency(data: any): string {
    return data?.undertakingDetails?.currency || 
           data?.formData?.undertakingDetails?.currency || 
           this.undertakingDetails?.get('currency')?.value ||
           'USD';
  }

  private getAmount(data: any): number {
    const amount = data?.undertakingDetails?.undertakingAmount || 
                   data?.formData?.undertakingDetails?.undertakingAmount || 
                   this.undertakingDetails?.get('undertakingAmount')?.value ||
                   0;
    return Number(amount) || 0;
  }

  private getExpiryDate(data: any): Date {
    const expiryDate = data?.undertakingDetails?.expiryDate || 
                       data?.formData?.undertakingDetails?.expiryDate ||
                       this.undertakingDetails?.get('expiryDate')?.value;
    
    if (expiryDate) {
      const date = new Date(expiryDate);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Default: 1 year from now
    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  }

  private getPreference(data: any): string {
    return data?.generalDetails?.preference || 
           data?.formData?.generalDetails?.preference || 
           this.generalDetails?.get('preference')?.value ||
           'Standard';
  }

  private getProductType(data: any): string {
    return data?.generalDetails?.productType || 
           data?.formData?.generalDetails?.productType || 
           this.generalDetails?.get('productType')?.value ||
           'Performance Guarantee';
  }

  private getApplicantName(data: any): string {
    return data?.applicantBeneficiary?.applicantName || 
           data?.formData?.applicantBeneficiary?.applicantName || 
           this.applicantBeneficiary?.get('applicantName')?.value ||
           'Not specified';
  }

  private getFormOfUndertaking(data: any): string {
    return data?.generalDetails?.formOfUndertaking || 
           data?.formData?.generalDetails?.formOfUndertaking || 
           this.generalDetails?.get('formOfUndertaking')?.value ||
           'Standby LC';
  }

  // ================= UI ACTIONS =================
  printPreview() { 
    window.print(); 
  }

  backToForm() { 
    this.router.navigate(['/undertaking-issuance/request-undertaking']); 
  }

  // ================= DEBUG METHODS =================
  debugFormState() {
    console.log('=== FORM DEBUG INFO ===');
    console.log('Form exists:', !!this.form);
    console.log('Form value:', this.form?.value);
    console.log('Form completion:', this.getFormCompletion());
    console.log('Form sections:');
    console.log('- generalDetails:', this.generalDetails?.value);
    console.log('- applicantBeneficiary:', this.applicantBeneficiary?.value);
    console.log('- bankForm:', this.bankForm?.value);
    console.log('- undertakingDetails:', this.undertakingDetails?.value);
    console.log('- instructions:', this.instructions?.value);
    console.log('- attachments:', this.getAttachments());
    
    // Check current transactions in service
    const transactions = this.undertakingService.getAllTransactions();
    console.log('Current undertaking transactions:', transactions.length);
    console.log('Draft transactions:', transactions.filter(t => t.status === 'Draft'));
    console.log('Pending Approval transactions:', transactions.filter(t => t.status === 'Pending Approval'));
    
    // Check shared service transactions
    const allTransactions = this.sharedService.getAllTransactions();
    console.log('All transactions in shared service:', allTransactions.length);
  }
}
