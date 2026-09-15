import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-online-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register-customer.html',
  styleUrls: ['./register-customer.scss'],
})
export class RegisterCustomer {
  private fb = inject(FormBuilder);

  constructor(
    private router: Router,
    private api: ApiService,
  ) {}

  currentStep = 1;
  isLoading = false;

  accountForm: FormGroup = this.fb.group({
    accountNumber: ['', [Validators.required, Validators.minLength(10)]],
  });

  otpForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
  });

  verifyAccount(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const accountNumber = this.accountForm.value.accountNumber;

    this.api.verifyCustomerAccount(accountNumber, 'verify-account').subscribe({
      next: () => {
        this.isLoading = false;
        this.currentStep = 2;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  verifyOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const otp = this.otpForm.value.otp;

    console.log('OTP:', otp);

    // OTP API will be added here

    this.isLoading = false;
    this.currentStep = 3;
  }

  resendOtp(): void {
    console.log('Resend OTP');
  }

  cancelRegistration(): void {
    this.router.navigate(['/login']);
  }
}
