import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-collection-instructions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './collection-instructions.html',
  styleUrls: ['./collection-instructions.scss']
})
export class CollectionInstructionsComponent implements OnInit {

  collectionForm!: FormGroup;
  activeSection: string | null = 'adviceCharges';

  advicePaymentOptions = [
    { value: 'bank', viewValue: 'Bank' },
    { value: 'customer', viewValue: 'Customer' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.collectionForm = this.fb.group({
      advicePaymentBy: ['', Validators.required],
      adviceAcceptanceDate: [''],
      openingCharges: ['drawee', Validators.required],
      outsideCountryCharges: ['drawee', Validators.required],
      waiveCharges: [false],
      protestNonPayment: [false],
      protestNonAcceptance: [false],
      adviceReasonRefusal: ['Swift', Validators.required],
      acceptanceDeferred: [false],
      warehouseInsurance: [false],
      referTo: ['']
    });
  }

  toggleSection(section: string) {
    this.activeSection = this.activeSection === section ? null : section;
  }

  onSubmit() {
    if (this.collectionForm.valid) {
      console.log(this.collectionForm.value);
    }
  }
}
