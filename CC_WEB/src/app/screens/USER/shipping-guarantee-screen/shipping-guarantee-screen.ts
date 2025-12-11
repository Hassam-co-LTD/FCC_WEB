import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { SharedService } from '../../../core/services/user-service/shared-form-service/shared-service';
import { Router } from '@angular/router';
import { AfterViewInit } from '@angular/core';
export class ShippingGuaranteeScreen implements AfterViewInit {
  shippingForm!: FormGroup;

  constructor(private fb: FormBuilder, private dataService: SharedService, private router: Router) {
    this.shippingForm = this.fb.group({
      generalDetails: this.fb.group({
        customerRef: [''],
        productType: ['', Validators.required]
      }),
      applicantBeneficiary: this.fb.group({
        applicantName: ['', Validators.required],
        beneficiaryName: ['', Validators.required]
      }),
      bankDetails: this.fb.group({
        issuingBank: ['', Validators.required],
        advisingBank: ['', Validators.required]
      }),
      instructions: this.fb.group({
        instructionsText: ['']
      }),
      attachments: this.fb.array([]),
    });
  }

  get attachmentsArray(): FormArray {
    return this.shippingForm.get('attachments') as FormArray;
  }

  updateAttachments(files: File[]) {
    this.attachmentsArray.clear();
    files.forEach(file => {
      this.attachmentsArray.push(this.fb.group({
        title: file.name.replace(/\.[^/.]+$/, ""),
        fileName: file.name,
        size: file.size,
        type: file.type,
        file: file
      }));
    });
  }

  preview() {
    if (this.shippingForm.invalid) {
      this.shippingForm.markAllAsTouched();
      alert("Please fill all required fields before preview.");
      return;
    }

    this.dataService.setFormData(this.shippingForm.value);
    this.router.navigate(['/shipping-guarantee/preview']);
  }
}
