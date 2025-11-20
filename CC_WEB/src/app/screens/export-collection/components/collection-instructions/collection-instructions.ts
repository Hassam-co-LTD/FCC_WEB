import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-collection-instructions',
  standalone: true,   // <-- make sure this is set
  imports: [CommonModule, ReactiveFormsModule],  // <-- import CommonModule for *ngFor
  templateUrl: './collection-instructions.html',
  styleUrls: ['./collection-instructions.scss']
})
export class CollectionInstructionsComponent {
  collectionForm: FormGroup;
  activeSection: string = '';

  advicePaymentOptions = [
    { value: 'drawer', viewValue: 'Drawer' },
    { value: 'drawee', viewValue: 'Drawee' }
  ];

  adviceRefusalReasons = [
    { value: 'reason1', viewValue: 'Reason 1' },
    { value: 'reason2', viewValue: 'Reason 2' }
  ];

  constructor(private fb: FormBuilder) {
    this.collectionForm = this.fb.group({
      advicePaymentBy: [''],
      adviceAcceptanceDate: [''],
      openingCharges: [''],
      outsideCountryCharges: [''],
      waiveCharges: [false],
      protestNonPayment: [false],
      protestNonAcceptance: [false],
      adviceReasonRefusal: [''],
      acceptanceDeferred: [false],
      warehouseInsurance: [false],
      referTo: ['']
    });
  }

  toggleSection(section: string) {
    this.activeSection = this.activeSection === section ? '' : section;
  }

  onSubmit() {
    console.log('Collection Instructions Form Value:', this.collectionForm.value);
  }
}
