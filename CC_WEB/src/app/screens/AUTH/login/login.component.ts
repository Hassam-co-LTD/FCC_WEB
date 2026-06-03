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
  isDummyLogin=true;

  constructor(private auth: AuthService, private router: Router, private api: ApiService) {}

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  // Unified login function that calls both internal login and API login
  loginHandler() {

    if (this.isDummyLogin) {
      this.loginn();
    }else{
    // Call the API login
     this.login();
    }
  }


  loginn() {
    // ✅ Dummy credentials
    const DUMMY_LOGIN_ID = 'NBP01';
    const DUMMY_PASSWORD = 'NBP';

    if (this.loginId === DUMMY_LOGIN_ID && this.password === DUMMY_PASSWORD) {

      // ✅ Mock user object (same structure as API response)
      const dummyUser = {
        loginId: this.loginId,
        companyId: 'NBP',
        companyType: 'C',   // C = Company
        userCategory: 'U',  // U = Normal User
        userStatus: 'A'
      };

      // ✅ Store user data so AuthService works
      sessionStorage.setItem('userData', JSON.stringify(dummyUser));

      // ✅ Navigate directly to dashboard
      this.router.navigate(['/dashboard']);

      Swal.fire({
        icon: 'success',
        title: 'Dummy Login Successful',
        text: 'Welcome to Dashboard',
        timer: 1500,
        showConfirmButton: false
      });

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Credentials',
        text: 'Use NBP / NBP for dummy login'
      });
    }
  }
  // API login
  login() {
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