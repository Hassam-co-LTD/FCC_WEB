import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { SharedService } from '../../../../../core/services/shared-service';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
})
export class PreviewSectionComponent implements OnInit {
  @Input() form!: FormGroup;
  isOpen = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dataService: SharedService
  ) {}

  ngOnInit(): void {
    const formData = this.dataService.getFormData();

    if (!formData) {
      console.error('No form data found! Please navigate from Export Collection page.');
      return;
    }

    // Recreate form with correct structure
    this.form = this.fb.group({
      generalDetails: this.fb.group(formData.generalDetails || {}),
      DrawerDraweeDetails: this.fb.group(formData.DrawerDraweeDetails || {}),
      bankDetails: this.fb.group(formData.bankDetails || {}),
      paymentAmount: this.fb.group(formData.paymentAmount || {}),
      shippingDetails: this.fb.group(formData.shippingDetails || {}),
      collectionInstructions: this.fb.group(formData.collectionInstructions || {}),
      license: this.fb.group(formData.license || {}),
      attachments: this.fb.group({
        documents: this.fb.array(formData.attachments?.documents || [])
      })
    });
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  get attachmentsArray(): FormArray {
    return this.form.get('attachments.documents') as FormArray || new FormArray([]);
  }

  get documentsArray(): FormArray {
    return this.attachmentsArray;
  }

  previous(): void {
    this.router.navigate(['export-collection']);
  }

  submit(): void {
    console.log('Submitted Data:', this.form.value);
  }

  downloadFile(file: any): void {
    if (!file || !file.file) return;
    const url = URL.createObjectURL(file.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.fileName || 'download';
    a.click();
    URL.revokeObjectURL(url);
  }

  formatLabel(field: string): string {
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  formatValue(value: any): string {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    return value ?? '—';
  }
}
