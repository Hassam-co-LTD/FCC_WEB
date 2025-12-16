import { Component, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { SharedService } from '../../../../../core/services/user-service/shared-form-service/shared-service';
import { Router } from '@angular/router';
import { MatCard } from "@angular/material/card";
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../../../../core/services/api.service';


@Component({
  selector: 'app-preview',
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
  imports: [CommonModule, MatIcon, DecimalPipe, MatCard, HttpClientModule],
  standalone: true,
})
export class Preview implements OnInit {
  form!: FormGroup;

  isOpen = true;

  viewerOpen = false;
  viewerContent: SafeResourceUrl | null = null;
  isImage = false;
  isPdf = false;
  constructor(private dataService: SharedService, private fb: FormBuilder, private router: Router, private snackBar: MatSnackBar, private imporLcService: ApiService) { }

  ngOnInit() {
    const formData = this.dataService.getFormData();

    // Recreate the form so your template can use form.get('step') like before
    this.form = this.fb.group({
      generalDetails: this.fb.group(formData.generalDetails),
      applicantForm: this.fb.group(formData.applicantForm),
      bankForm: this.fb.group(formData.bankForm),
      amountChargeForm: this.fb.group(formData.amountChargeForm),
      paymentDetailsForm: this.fb.group(formData.paymentDetailsForm),
      shipmentForm: this.fb.group(formData.shipmentForm),
      narrativeForm: this.fb.group(formData.narrativeForm),
      instructionForm: this.fb.group(formData.instructionForm),
      attachments: this.fb.array(formData.attachments || []),
    });
  }
  toggle() {
    this.isOpen = !this.isOpen;
  }

  get attachmentsArray(): FormArray {
    return (this.form.get('attachments') as FormArray)
  }

  previous() {
    this.router.navigate(['import-screen'])
  }
  // submit() {
  //   console.log("Submitted Data:", this.form.value);

  //   // Show success toast
  //   this.snackBar.open('Data successfully submitted!', 'Close', {
  //     duration: 3000, // 3 seconds
  //     horizontalPosition: 'right',
  //     verticalPosition: 'top',
  //     panelClass: ['success-snackbar']
  //   });
  //   console.log("Submitted Data:", this.form.value);
  // }
  submit() {
    // Prepare payload dynamically
    const payload = {
      ...this.form.get('generalDetails')?.value,
      ...this.form.get('applicantForm')?.value,
      ...this.form.get('bankForm')?.value,
      ...this.form.get('amountChargeForm')?.value,
      ...this.form.get('paymentDetailsForm')?.value,
      ...this.form.get('shipmentForm')?.value,
      ...this.form.get('narrativeForm')?.value,
      ...this.form.get('instructionForm')?.value,
      attachments: this.attachmentsArray?.value || [],
    };
    this.imporLcService.submitPreview(payload).subscribe((res) => {
      console.log("Backend Response:", res);
      this.snackBar.open('Data successfully submitted!', 'Close', {
        duration: 3000, horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
      this.router.navigate(['/import-screen/success'], { state: res });
    },
      (err) => {
        console.error("Submit Error:", err);
        this.snackBar.open('Error submitting data', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      })
  }



  downloadFile(index: number) {
    const data = this.attachmentsArray.at(index)?.value;
    if (!data) return;

    const { file, fileName } = data;

    if (file instanceof Blob) {
      const url = URL.createObjectURL(file);
      this.triggerDownload(url, fileName);
      URL.revokeObjectURL(url);
      return;
    }

    if (typeof file === 'string' && file.startsWith('data:')) {
      const arr = file.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] ?? '';
      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);
      for (let n = 0; n < bstr.length; n++) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const url = URL.createObjectURL(blob);
      this.triggerDownload(url, fileName);
      URL.revokeObjectURL(url);
      return;
    }

    console.error("Unsupported file format", file);
  }

  private triggerDownload(url: string, fileName: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  }
}