import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../../../../../core/services/user-service/shared-form-service/shared-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
  providers: [DatePipe]
})
export class Preview implements OnInit {
  form!: FormGroup;
  lastUpdated: Date = new Date();

  constructor(
    private sharedService: SharedService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.loadFormData();
  }

  private loadFormData() {
    const savedData = this.sharedService.getFormData();

    if (!savedData || !savedData.form) {
      this.snackBar.open('No form data found. Please complete the form first.', 'Close', { duration: 3000 });
      this.router.navigate(['/undertaking-issuance/request']);
      return;
    }

    this.form = savedData.form;
    this.lastUpdated = new Date();
  }

  // ================= FORM GETTERS =================
  get generalDetails(): FormGroup { return this.form.get('generalDetails') as FormGroup; }
  get applicantBeneficiary(): FormGroup { return this.form.get('applicantBeneficiary') as FormGroup; }
  get bankForm(): FormGroup { return this.form.get('bankForm') as FormGroup; }
  get undertakingDetails(): FormGroup { return this.form.get('undertakingDetails') as FormGroup; }
  get instructions(): FormGroup { return this.form.get('instructions') as FormGroup; }

  // ================= FORM STATUS =================
  getFormCompletion(): number {
    if (!this.form) return 0;
    const sections = ['generalDetails','applicantBeneficiary','bankForm','undertakingDetails','instructions'];
    let totalFields = 0, filledFields = 0;
    sections.forEach(section => {
      const group = this.form.get(section) as FormGroup;
      if (group) {
        Object.keys(group.controls).forEach(key => {
          totalFields++;
          const val = group.get(key)?.value;
          if (val !== null && val !== undefined && val !== '') filledFields++;
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

  isFormComplete(): boolean { return this.getFormCompletion() >= 80; }

  // ================= FORMAT HELPERS =================
  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') return 'Not specified';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.length ? value.join(', ') : 'None';
    return String(value);
  }

  formatDate(dateValue: any): string {
    if (!dateValue) return 'Not specified';
    try {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? 'Invalid date' : this.datePipe.transform(date, 'MMMM d, yyyy') || 'Invalid date';
    } catch { return String(dateValue); }
  }

  formatCurrency(amount: any, currency: string = ''): string {
    if (amount === null || amount === undefined || amount === '') return 'Not specified';
    const num = Number(amount);
    if (isNaN(num)) return String(amount);
    const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
    return currency ? `${formatted} ${currency}` : formatted;
  }

  formatBankTab(tab: string): string {
    const map: {[key:string]:string} = { issuing:'Issuing Bank', advising:'Advising Bank', adviseThrough:'Advise Through Bank' };
    return map[tab] || tab || 'Not specified';
  }

  formatDeliveryType(type: string): string {
    const options = [{ value:'original', label:'Delivery of Original Undertaking'},{ value:'copy', label:'Copy'}];
    return options.find(o=>o.value===type)?.label || type || 'Not specified';
  }

  formatDeliveryMode(mode: string): string {
    const options = [
      { value:'courier', label:'Courier' }, { value:'pickup', label:'Pick Up' }, 
      { value:'email', label:'Email' }, { value:'swift', label:'SWIFT' }
    ];
    return options.find(o=>o.value===mode)?.label || mode || 'Not specified';
  }

  formatDeliveryTo(to: string): string {
    const options = [
      { value:'ourselves', label:'Ourselves' }, { value:'beneficiary', label:'Beneficiary' },
      { value:'representative', label:'Representative' }, { value:'agent', label:'Agent' },
      { value:'other', label:'Other' }
    ];
    return options.find(o=>o.value===to)?.label || to || 'Not specified';
  }

  // ================= FILE HANDLING =================
  getAttachments(): any[] {
    if (!this.form) return [];
    const paths = ['attachments.files','attachments.attachments','files'];
    for (const path of paths) {
      const ctrl = this.form.get(path);
      if (ctrl instanceof FormArray) return ctrl.value || [];
    }
    return [];
  }

  getAttachmentsCount(): number { return this.getAttachments().length; }

  getFileIcon(file: any): string {
    if (!file) return 'insert_drive_file';
    const name = (file.name || file.fileName || '').toLowerCase();
    const type = (file.type || '').toLowerCase();
    if (name.includes('.pdf') || type.includes('pdf')) return 'picture_as_pdf';
    if (name.match(/\.(jpg|jpeg|png|gif)$/) || type.includes('image')) return 'image';
    if (name.match(/\.(doc|docx)$/) || type.includes('word')) return 'description';
    if (name.match(/\.(xls|xlsx)$/) || type.includes('excel')) return 'table_chart';
    if (name.match(/\.(txt)$/) || type.includes('text')) return 'text_snippet';
    return 'insert_drive_file';
  }

  getFileType(file: any): string {
    if (!file) return 'Unknown';
    const ext = (file.name || file.fileName || '').split('.').pop()?.toLowerCase();
    const types: {[key:string]:string} = { pdf:'PDF', jpg:'Image', jpeg:'Image', png:'Image', gif:'Image', doc:'Word', docx:'Word', xls:'Excel', xlsx:'Excel', txt:'Text', rtf:'Rich Text', csv:'CSV' };
    return ext ? types[ext] || ext.toUpperCase() : 'Unknown';
  }

  formatSize(bytes: number): string {
    if (!bytes || bytes===0) return '0 Bytes';
    const k=1024; const sizes=['Bytes','KB','MB','GB']; const i=Math.floor(Math.log(bytes)/Math.log(k));
    return (bytes/Math.pow(k,i)).toFixed(2)+' '+sizes[i];
  }

  getTotalFileSize(): string {
    return this.formatSize(this.getAttachments().reduce((sum,f)=>sum+(f.size||0),0));
  }

  downloadFile(file: any, index: number) {
    if (!file) return;
    try {
      let a = document.createElement('a');
      if (file.content && file.content.startsWith('data:')) { a.href=file.content; a.download=file.name||file.fileName||'file'; }
      else if (file.file instanceof File) { const url=window.URL.createObjectURL(file.file); a.href=url; a.download=file.file.name; window.URL.revokeObjectURL(url); }
      a.click();
      this.snackBar.open('File downloaded successfully','Close',{duration:2000});
    } catch { this.snackBar.open('Error downloading file','Close',{duration:3000}); }
  }

  removeFile(index: number) {
    if (!confirm('Are you sure you want to remove this file?')) return;
    const paths = ['attachments.files','attachments.attachments','files'];
    for (const path of paths) {
      const ctrl = this.form.get(path);
      if (ctrl instanceof FormArray) { ctrl.removeAt(index); break; }
    }
    this.snackBar.open('File removed successfully','Close',{duration:2000});
  }

  // ================== ACTIONS ==================
  printPreview() { window.print(); }

  backToForm() { this.router.navigate(['/undertaking-issuance/request']); }

  submit() {
    if (!this.isFormComplete()) {
      this.snackBar.open('Please complete all required fields before submitting','Close',{duration:3000,panelClass:['error-snackbar']});
      return;
    }

    const transaction = this.sharedService.addTransaction(this.form);
    const submissionData = { ...this.form.value, submittedAt: new Date().toISOString(), status:'Submitted', transactionReference:transaction.channelReference };

    this.snackBar.open(`Undertaking request submitted successfully! Reference: ${transaction.channelReference}`, 'Close', { duration:5000, horizontalPosition:'right', verticalPosition:'top', panelClass:['success-snackbar'] });

    this.sharedService.clearFormData();
    setTimeout(()=>this.router.navigate(['/undertaking-issuance']),2000);
  }
}
