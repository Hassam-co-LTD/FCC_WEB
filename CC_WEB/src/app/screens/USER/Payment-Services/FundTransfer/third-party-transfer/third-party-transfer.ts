import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GeneralDetails } from './components/general-details/general-details';
import { Sidebar } from '../../../../../core/sidebar/sidebar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-third-party-transfer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GeneralDetails,
    Sidebar,
  ],
  templateUrl: './third-party-transfer.html',
  styleUrl: './third-party-transfer.scss',
})
//-------------WITH_IN_BANK--------------
export class ThirdPartyTransfer {

  currentStep = 0;
  withinBankForm!: FormGroup;

  withinBankSteps = [
    { label: "Payment Details" },
  ];



  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.buildForm();
  }

  // =======================
  // Step scroll tracking
  // =======================
  ngAfterViewInit() {
    setTimeout(() => {
      const sections = document.querySelectorAll('section');
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.currentStep = Array.from(sections).indexOf(entry.target as HTMLElement);
            }
          });
        },
        { threshold: 0.4, root: document.querySelector('.scroll-area') }
      );
      sections.forEach(section => observer.observe(section));
    }, 200);
  }


  private buildForm(): void {
    this.withinBankForm = this.fb.group({
      generalDetails: this.fb.group({
        producttype: [{ value: 'Third Party Transfer', disabled: true }],
        transferFrom: [''],
        tnxId: [{ value: '', disabled: true }],
        appDate: [{ value: new Date(), disabled: true }],
        beneficiaryname: [''],
        beneficiaryaccount: [''],
        amount: [''],
        currency: [{ value: 'PKR', disabled: true }],
        tranferDate: [null],
        tranferRemarks: ['']
      }),
    });
  }
  // =======================
  // Getters
  // =======================
  get generalDetailsForm(): FormGroup {
    return this.withinBankForm.get('generalDetails') as FormGroup;
  }


  back() {
    this.router.navigate(['/fund-transfer-welcome']);
  }

  save() {
    alert('Form saved successfully!');
  }

}