import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginId = '';
  companyId = '';
  password = '';
  userStatus = 'A';
  hidePassword = true;

  constructor(private auth: AuthService, private router: Router, private api: ApiService) {}

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  // Unified login function that calls both internal login and API login
  loginHandler() {
    // Call the old login() if needed
    this.login();

    // Call the API login
    this.loginn();
  }

  // Optional old login function (for local checks)
  login() {
    const companyType = this.auth.getCompanyType();
    const customerType = this.auth.getUserCategory();

    if (companyType === 'B') {
      this.router.navigate(['/customer-user']);
    } else if (companyType === 'C' && customerType === 'A') {
      this.router.navigate(['/admin']);
    } else if (companyType === 'C' && customerType === 'U') {
      this.router.navigate(['/dashboard']);
    }
  }

  // API login
  loginn() {
    this.api.userLogin({
      loginId: this.loginId,
      companyId: this.companyId,
      password: this.password,
      userStatus: this.userStatus
    }, 'clientUsers').subscribe({
      next: (res) => {
        sessionStorage.setItem("userData", JSON.stringify(res));

        const companyType = this.auth.getCompanyType();
        const customerType = this.auth.getUserCategory();

        console.log("CompanyType:", companyType, "CustomerType:", customerType);

        if (companyType === 'B') {
          this.router.navigate(['/customer-user']);
        } else if (companyType === 'C' && customerType === 'A') {
          this.router.navigate(['/admin']);
        } else if (companyType === 'C' && customerType === 'U') {
          this.router.navigate(['/dashboard']);
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Login Warning',
            text: 'Unable to determine user type. Please contact support.'
          });
        }
      },
      error: (err) => {
        console.error('Login failed:', err);
        const errorMessage = err?.error?.message || err?.error || 'Something went wrong!';
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: errorMessage,
        });
      }
    });
  }
}