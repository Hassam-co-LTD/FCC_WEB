import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-preview',
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
  imports: [MatIconModule]
})
export class Preview implements OnInit {

  @Input() form!: FormGroup;
  @Input() attachmentsForm!: FormGroup;
  @Input() uploadedFiles: any[] = [];

  generalDetails: any;
  drawerDrawee: any;
  bankDetails: any;
  paymentAmount: any;
  shippingDetails: any;
  licenseDetails: any;
  collectionInstructions: any;
  attachments: any;

  ngOnInit(): void {

    if (!this.form) {
      console.error('PreviewComponent: form input is missing!');
      return;
    }

    // Extract each section safely
    this.generalDetails = this.form.get('generaldetails')?.value || {};
    this.drawerDrawee = this.form.get('drawerdrawee')?.value || {};
    this.bankDetails = this.form.get('bankdetails')?.value || {};
    this.paymentAmount = this.form.get('paymentamount')?.value || {};
    this.shippingDetails = this.form.get('shippingdetails')?.value || {};
    this.licenseDetails = this.form.get('license')?.value || {};
    this.collectionInstructions = this.form.get('collectioninstructions')?.value || {};

    this.attachments = this.attachmentsForm?.value ?? {};
  }

}
