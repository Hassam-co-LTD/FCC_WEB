import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shipping-submit',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="submit-page">
    <h2>Shipping Guarantee Submission</h2>
    <ul>
      <li>General Details</li>
      <li>Applicant & Beneficiary</li>
      <li>Bank Details</li>
      <li>Instructions</li>
      <li>Attachments</li>
    </ul>
    <button (click)="return()">Return</button>
  </div>
  `,
  styleUrls: ['./submit-preview.scss']
})
export class ShippingSubmit {
  constructor(private router: Router) {}
  return() {
    this.router.navigate(['/shipping-guarantee']);
  }
}
