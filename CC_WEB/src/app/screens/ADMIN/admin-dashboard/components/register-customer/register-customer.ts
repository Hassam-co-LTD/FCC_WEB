import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { finalize } from 'rxjs';

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
import { ApiService } from '../../../../../core/services/api.service';
import Swal from 'sweetalert2';

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
    MatIcon,
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
  accountVerificationMessage = '';
  accountVerificationError = false;

  showCustomerNotice = false;
  isResendingOtp = false;
  // Step 1: Customer registration details
  accountForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    cnic: ['', [Validators.required, Validators.pattern(/^[0-9]{13}$/)]],
    contactNumber: [
      '',
      [Validators.required, Validators.minLength(10), Validators.maxLength(15)],
    ],
    remarks: [''],
    email: ['', [Validators.required, Validators.email]],
  });

  // Step 2: OTP verification
  otpForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
  });

  // Verify customer account and registration details
  submitRegistration(): void {
    this.showCustomerNotice = true;

    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.accountVerificationError = false;
    this.accountVerificationMessage = '';

    const request = {
      name: this.accountForm.get('name')?.value?.trim(),
      cnic: this.accountForm.get('cnic')?.value?.trim(),
      contactNumber: this.accountForm.get('contactNumber')?.value?.trim(),
      email: this.accountForm.get('email')?.value?.trim(),
      remarks: this.accountForm.get('remarks')?.value?.trim() || '',
    };

    console.log('sending the customer payload ', request);

    this.api
      .submitCustomerRegistration(this.accountForm.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.currentStep = 2;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Registration request submitted successfully.',
          });
        },
        error: (error) => {
          const message =
            error?.error?.message ||
            'Unable to submit the registration request.';

          Swal.fire({
            icon: 'warning',
            title: 'Registration Failed',
            text: message,
          });
        },
      });
  }

  // Verify OTP
  verifyOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    const email = this.accountForm.get('email')?.value;
    const otp = String(this.otpForm.get('otp')?.value ?? '');

    if (!email) {
      alert('Email address is missing.');
      return;
    }

    this.isLoading = true;

    this.api.verifyOtp(email, otp).subscribe({
      next: (response) => {
        this.isLoading = false;

        console.log('OTP verified successfully:', response);

        this.currentStep = 3;
      },
      error: (error) => {
        this.isLoading = false;

        console.error('OTP verification failed:', error);

        alert(
          typeof error.error === 'string'
            ? error.error
            : 'Invalid or expired OTP. Please try again.',
        );
      },
    });
  }
  // Resend OTP
  resendOtp(): void {
    console.log('Resend OTP');

    // TODO: Integrate your resend OTP API here.
  }

  // Cancel registration
  cancelRegistration(): void {
    this.router.navigate(['/login']);
  }
}
