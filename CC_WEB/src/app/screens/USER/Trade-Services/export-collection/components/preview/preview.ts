import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SharedService } from '../../../../../../core/services/user-service/shared-form-service/shared-service'

@Component({
  selector: 'app-export-preview',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss']
})
export class PreviewSectionComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private router: Router
  ) {}

  ngOnInit() {
    const data = this.sharedService.getFormData();
    if (!data) {
      this.router.navigate(['/export-form']);
      return;
    }

    // Reconstruct form structure to match your HTML paths
    this.form = this.fb.group({
      generaldetails: this.fb.group(data.generaldetails || {}),
      DrawerDraweeDetails: this.fb.group(data.DrawerDraweeDetails || {}),
      bankdetails: this.fb.group(data.bankdetails || {}),
      paymentamount: this.fb.group(data.paymentamount || {}),
      shippingdetails: this.fb.group(data.shippingdetails || {}),
      adviceCharges: this.fb.group(data.adviceCharges || {}),
      license: this.fb.group({ file: [data.license?.file] }),
      attachments: this.fb.group({
        uploadedFiles: [data.attachments?.uploadedFiles || []],
        documents: [data.attachments?.documents || []]
      })
    });
  }

  getVal(path: string): any {
    const val = this.form.get(path)?.value;
    return (val === null || val === undefined || val === '') ? '—' : val;
  }

  formatCurrency(val: any) {
    if (val === '—') return val;
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(val);
  }

  getLicenseFile() {
    return this.form.get('license.file')?.value;
  }

  getUploadedFiles() {
    // Merges the raw drag-drop files and the structured document rows
    const rawFiles = this.form.get('attachments.uploadedFiles')?.value || [];
    const docRows = this.form.get('attachments.documents')?.value || [];
    return [...rawFiles, ...docRows];
  }

  backToForm() {
    this.router.navigate(['/export-form']);
  }

  submit() {
    console.log("Final Submission:", this.form.value);
    alert("Collection Submitted Successfully!");
  }
}