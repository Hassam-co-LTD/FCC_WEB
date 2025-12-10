import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SharedService } from '../../../../../../../../core/services/user-service/shared-form-service/shared-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
})
export class PreviewSection {

  @Input() form!: FormGroup;
  isOpen = true;
  currentStep: any;

  constructor(
    private dataService: SharedService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    const data = this.dataService.getFormData();

    if (data) {
      this.form = this.fb.group({
        generaldetails: this.fb.group(data.generaldetails || {}),
        DrawerDraweeDetails: this.fb.group(data.DrawerDraweeDetails || {}),
        bankdetails: this.fb.group(data.bankdetails || {}),
        paymentamount: this.fb.group(data.paymentamount || {}),
        shippingdetails: this.fb.group(data.shippingdetails || {}),
        collectioninstructions: this.fb.group(data.collectioninstructions || {}),
        license: this.fb.group({ attachments: this.fb.array(data.attachments?.attachments || []) }),
        attachments: this.fb.group({
          attachments: this.fb.array(data.attachments?.attachments || []),
          documents: this.fb.array(data.attachments?.documents || [])
        })
      });
    }
  }

  // Toggle Collapse
  toggle() {
    this.isOpen = !this.isOpen;
  }

  // ✅ Correct Attachments Getter
  get attachmentsArray(): FormArray {
    return (this.form.get('attachments.attachments') as FormArray) || new FormArray([]);
  }

  // ✅ Correct Documents Getter
  get documentsArray(): FormArray {
    return (this.form.get('attachments.documents') as FormArray) || new FormArray([]);
  }

  // Back Button
  previous() {
    this.router.navigate(['export-collection']);
  }

  // Submit Button
submit() {
  console.log('Submitted Data:', this.form.value);

  // Navigate to success page
//  this.router.navigate(['/preview/app-success']);
}

  // File Download
  downloadFile(file: any) {
    if (!file || !file.file) return;

    const url = URL.createObjectURL(file.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Helper: Format Labels
  formatLabel(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  // Helper: Format Values
  formatValue(value: any): string {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    return value ?? '—';
  }

}
