import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SharedService } from '../../../../../core/services/shared-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
})
export class PreviewSectionComponent {
  @Input() form!: FormGroup;
  isOpen = true;
currentStep: any;
 constructor(private dataService: SharedService, private fb: FormBuilder, private router: Router){}
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
        license: this.fb.group(data.license || {}),
        attachments: this.fb.group({
          documents: this.fb.array(data.attachments?.documents || [])
        })
      });
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;

  }

  get attachmentsArray(): FormArray {
    return (this.form.get('attachments')?.get('attachments') as FormArray) || new FormArray([]);
  }
  previous(){
    this.router.navigate(['export-collection'])
  }
  submit(){
    console.log("Submitted Data:", this.form.value);
  }
  get documentsArray(): FormArray {
    return (this.form.get('attachments')?.get('documents') as FormArray) || new FormArray([]);
  }

  downloadFile(file: any) {
    if (!file || !file.file) return;
    const url = URL.createObjectURL(file.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Format a field string like 'remittingBankName' => 'Remitting Bank Name' */
  formatLabel(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')   // add space before capital letters
      .replace(/^./, str => str.toUpperCase()); // capitalize first letter
  }

  /** Format boolean values as Yes/No */
  formatValue(value: any): string {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    return value ?? '—';
  }
  
}
