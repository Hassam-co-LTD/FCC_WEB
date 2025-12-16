import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../../../../core/services/user-service/shared-form-service/shared-service';

@Component({
  selector: 'app-submit-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="submit-page">
      <h2 class="page-title">Shipping Guarantee Submission</h2>

      <div class="submit-container">

        <!-- Display submitted sections -->
        <ul class="submit-list">
          <li>General Details</li>
          <li>Applicant & Beneficiary</li>
          <li>Bank Details</li>
          <li>Instructions</li>
          <li>Attachments</li>
        </ul>

        <!-- Optional: display uploaded attachments -->
        <div *ngIf="attachments?.length" class="submit-attachments">
          <h3>Attachments</h3>
          <ul>
            <li *ngFor="let file of attachments">
              {{ file.name }} ({{ file.size }})
            </li>
          </ul>
        </div>

      </div>

      <div class="actions">
        <button (click)="return()" class="btn-primary">Return to Form</button>
      </div>
    </div>
  `,
  styleUrls: ['./submit-preview.scss']
})
export class SubmitPreview {
  attachments: any[] = [];

  constructor(private router: Router, private sharedService: SharedService) {
    const data = this.sharedService.getFormData();
    if (data?.attachments?.preview?.length) {
      this.attachments = data.attachments.preview;
    }
  }
 submit() {
    // Optional: handle final submission logic here
    console.log('Form submitted:', this.sharedService.getFormData());

    // Navigate to submit-preview page
    this.router.navigate(['/shipping-guarantee/submit-preview']);
  }
  return() {
    this.router.navigate(['/shipping-guarantee']);
  }
}
