import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

// Angular Material Module Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

// Core Application Service Providers
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';

// Strongly typed view paths for the authentication finite state machine
export type AuthState = 'LOGIN' | 'FORGOT_PASSWORD' | 'EMAIL_SENT' | 'RESET_PASSWORD' | 'EXPIRED' | 'SUCCESS';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  // Centralized Finite State Machine Core
  public authState: AuthState = 'LOGIN';

  // =========================
  // LOGIN FORM STATE
  // =========================
  loginId = '';
  companyId = '';
  password = '';
  userStatus = 'A';
  hidePassword = true;
  isDummyLogin = false;

  // =========================
  // RESET PASSWORD - FORGOT FLOW STATE
  // =========================
  forgotLoginId = '';
  forgotCompanyId = '';
  maskedUser = '';
  token: string | null = null;
  newPassword = '';
  confirmPassword = '';
  hideNewPassword = true;
  hideConfirmPassword = true;

  // =========================
  // BACKGROUND UTILITY COUNTERS
  // =========================
  expirySeconds = 900; 
  expiryDisplay = '15:00';
  private expiryInterval: any;

  resendSeconds = 60;
  resendDisplay = '60';
  canResend = false;
  private resendInterval: any;

  // =========================
  // PASSWORD COMPLEXITY & REQUIREMENT TRACKERS
  // =========================
  passwordStrength = '';
  passwordStrengthColor = '';
  passwordStrengthProgress = 0;
  isPasswordInvalid = true;

  hasMinLength = false;
  hasUppercase = false;
  hasLowercase = false;
  hasNumber = false;
  hasSpecialChar = false;

  constructor(
    private auth: AuthService,
    protected router: Router,
    private api: ApiService,
    private route: ActivatedRoute
  ) {}

  /**
   * Safe Component Initialization Hook with Race-Condition Protection
   */
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const urlToken = params['token'];
      
      // Protection against secondary router stabilization events where token might be undefined
      if (!urlToken) {
        if (this.authState !== 'RESET_PASSWORD' && this.authState !== 'EXPIRED' && this.authState !== 'SUCCESS') {
          this.transitionTo('LOGIN');
        }
        return;
      }

      this.token = urlToken;

      // Proactively evaluate external query tokens via server backend
      this.api.validateResetToken(urlToken).subscribe({
        next: (response: any) => {
          const isValid = response && (response.valid === true || response.status === 'success' || response.isValid === true);
          if (isValid) {
            this.transitionTo('RESET_PASSWORD');
          } else {
            this.transitionTo('EXPIRED');
          }
        },
        error: (err) => {
          console.error('Token validation network exception:', err);
          this.transitionTo('EXPIRED');
        }
      });
    });
  }

  /**
   * Component destruction hook lifecycle interception
   */
  ngOnDestroy(): void {
    this.clearAllTimers();
  }

  /**
   * Central routing mechanism for View Layout Transitions
   */
  public transitionTo(targetState: AuthState): void {
    this.executeStateSideEffects(targetState);
    this.authState = targetState;
  }

  /**
   * State Management configuration engine to decouple running variables
   */
  private executeStateSideEffects(targetState: AuthState): void {
    if (targetState !== 'EMAIL_SENT') {
      this.clearAllTimers();
    }

    switch (targetState) {
      case 'LOGIN':
        this.password = '';
        break;
      case 'RESET_PASSWORD':
        this.newPassword = '';
        this.confirmPassword = '';
        this.resetPasswordChecklist();
        break;
      case 'FORGOT_PASSWORD':
      case 'EXPIRED':
      case 'SUCCESS':
        break;
    }
  }

  private clearAllTimers(): void {
    if (this.expiryInterval) clearInterval(this.expiryInterval);
    if (this.resendInterval) clearInterval(this.resendInterval);
  }

  // Password Display Visibility Switch Toggles
  togglePassword(): void { this.hidePassword = !this.hidePassword; }
  toggleNewPassword(): void { this.hideNewPassword = !this.hideNewPassword; }
  toggleConfirmPassword(): void { this.hideConfirmPassword = !this.hideConfirmPassword; }

  loginHandler(): void {
    if (this.isDummyLogin) {
      this.loginDummy();
    } else {
      this.loginApi();
    }
  }

  private loginDummy(): void {
    const DUMMY_LOGIN_ID = 'NBP01';
    const DUMMY_PASSWORD = 'NBP';

    if (this.loginId === DUMMY_LOGIN_ID && this.password === DUMMY_PASSWORD) {
      const dummyUser = { loginId: this.loginId, companyId: 'NBP', companyType: 'C', userCategory: 'U', userStatus: 'A' };
      sessionStorage.setItem('userData', JSON.stringify(dummyUser));
      this.router.navigate(['/dashboard']);
      Swal.fire({ icon: 'success', title: 'Welcome', text: 'Dummy login verified.', timer: 1500, showConfirmButton: false });
    } else {
      Swal.fire({ icon: 'error', title: 'Invalid Credentials', text: 'Use NBP01 / NBP for dummy configuration access.' });
    }
  }

  private loginApi(): void {
    this.api.userLogin({
      loginId: this.loginId,
      companyId: this.companyId,
      password: this.password,
      userStatus: this.userStatus
    }, 'clientUsers').subscribe({
      next: (res) => {
        sessionStorage.setItem('userData', JSON.stringify(res));
        const companyType = this.auth.getCompanyType();
        const customerType = this.auth.getUserCategory();

        if (companyType === 'B') {
          this.router.navigate(['/customer-user']);
        } else if (companyType === 'C' && customerType === 'A') {
          this.router.navigate(['/admin']);
        } else if (companyType === 'C' && customerType === 'U') {
          this.router.navigate(['/dashboard']);
        } else {
          Swal.fire({ icon: 'warning', title: 'Login Warning', text: 'Undefined user category. Contact system support hierarchy.' });
        }
      },
      error: (err) => {
        Swal.fire({ icon: 'error', title: 'Authentication Failed', text: err?.error?.message || 'Invalid enterprise access configurations.' });
      }
    });
  }

  sendResetLink(): void {
    if (!this.forgotLoginId || !this.forgotCompanyId) {
      Swal.fire({ icon: 'warning', title: 'Missing Identity Parameters', text: 'Login ID and Company ID are required.' });
      return;
    }

    this.api.forgotPassword({ loginId: this.forgotLoginId, companyId: this.forgotCompanyId }).subscribe({
      next: (response: any) => {
        const data = typeof response === 'string' ? JSON.parse(response) : response;
        this.maskedUser = this.maskEmail(data?.email || this.forgotLoginId);

        this.transitionTo('EMAIL_SENT');
        this.startExpiryTimer();
        this.startResendTimer();

        Swal.fire({ icon: 'success', title: 'Link Dispatched', text: data?.message || 'Secure access credentials routed.' });
      },
      error: (error) => {
        Swal.fire({ icon: 'error', title: 'Request Dispatch Failed', text: error?.error?.message || 'System verification error.' });
      }
    });
  }

  resendEmail(): void {
    if (!this.canResend) return;

    this.api.forgotPassword({ loginId: this.forgotLoginId, companyId: this.forgotCompanyId }).subscribe({
      next: (response: any) => {
        const data = typeof response === 'string' ? JSON.parse(response) : response;
        this.startExpiryTimer();
        this.startResendTimer();
        Swal.fire({ icon: 'success', title: 'Token Refreshed', text: data?.message || 'New validation token generated.' });
      },
      error: (error) => {
        Swal.fire({ icon: 'error', title: 'Resend Interrupted', text: error?.error?.message || 'Please try again later.' });
      }
    });
  }

  updatePassword(): void {
    if (this.isPasswordInvalid || this.newPassword !== this.confirmPassword) return;

    this.api.resetPassword({ token: this.token, newPassword: this.newPassword }).subscribe({
      next: () => {
        this.transitionTo('SUCCESS');
        Swal.fire({ icon: 'success', title: 'Success', text: 'Credentials updated successfully.' });
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Transaction Refused', text: 'Your authorization token sequence is stale or corrupted.' });
      }
    });
  }

  startExpiryTimer(): void {
    this.expirySeconds = 900; // Retaining 15 mins structural standard allocation
    if (this.expiryInterval) clearInterval(this.expiryInterval);
    this.updateExpiryDisplay();

    this.expiryInterval = setInterval(() => {
      this.expirySeconds--;
      this.updateExpiryDisplay();

      if (this.expirySeconds <= 0) {
        clearInterval(this.expiryInterval);
        this.transitionTo('EXPIRED');
      }
    }, 1000);
  }

  private updateExpiryDisplay(): void {
    const min = Math.floor(this.expirySeconds / 60);
    const sec = this.expirySeconds % 60;
    this.expiryDisplay = `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
  }

  startResendTimer(): void {
    this.resendSeconds = 60;
    this.canResend = false;
    if (this.resendInterval) clearInterval(this.resendInterval);

    this.resendInterval = setInterval(() => {
      this.resendSeconds--;
      if (this.resendSeconds <= 0) {
        clearInterval(this.resendInterval);
        this.canResend = true;
      }
    }, 1000);
  }

  requestNewLink(): void {
    this.forgotLoginId = '';
    this.forgotCompanyId = '';
    this.transitionTo('FORGOT_PASSWORD');
  }

  private maskEmail(email: string): string {
    if (!email || !email.includes('@')) return 'User Dashboard Account';
    const [name, domain] = email.split('@');
    const first = name.substring(0, 3);
    const last = name.substring(name.length - 2);
    const hidden = '*'.repeat(Math.max(name.length - 3, 3));
    return `${first}${hidden}${last}@${domain}`;
  }

  /**
   * Tracks and evaluates independent requirement targets on real-time matrix
   */
  checkPasswordStrength(password: string): void {
    if (!password) {
      this.resetPasswordChecklist();
      return;
    }

    // Individual standard rule assignment evaluations
    this.hasMinLength = password.length >= 8;
    this.hasUppercase = /[A-Z]/.test(password);
    this.hasLowercase = /[a-z]/.test(password);
    this.hasNumber = /\d/.test(password);
    this.hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    // Global variable toggle assignment check logic
    this.isPasswordInvalid = !(this.hasMinLength && this.hasUppercase && this.hasLowercase && this.hasNumber && this.hasSpecialChar);

    let passedRulesCount = 0;
    if (this.hasMinLength) passedRulesCount++;
    if (this.hasUppercase) passedRulesCount++;
    if (this.hasLowercase) passedRulesCount++;
    if (this.hasNumber) passedRulesCount++;
    if (this.hasSpecialChar) passedRulesCount++;

    this.passwordStrengthProgress = (passedRulesCount / 5) * 100;

    if (passedRulesCount <= 2) {
      this.passwordStrength = 'Weak Security Profile';
      this.passwordStrengthColor = '#ef4444';
    } else if (passedRulesCount <= 4) {
      this.passwordStrength = 'Medium Complexity Level';
      this.passwordStrengthColor = '#f97316';
    } else {
      this.passwordStrength = 'Strong Corporate Standard';
      this.passwordStrengthColor = '#22c55e';
    }
  }

  private resetPasswordChecklist(): void {
    this.passwordStrength = '';
    this.passwordStrengthColor = '';
    this.passwordStrengthProgress = 0;
    this.isPasswordInvalid = true;
    this.hasMinLength = false;
    this.hasUppercase = false;
    this.hasLowercase = false;
    this.hasNumber = false;
    this.hasSpecialChar = false;
  }
}