import { Component, OnInit } from '@angular/core';
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
export class LoginComponent implements OnInit {

  loginId = '';
  companyId = '';
  password = '';
  userStatus = 'A';
  hidePassword = true;
  isDummyLogin=true;

  constructor(
    private auth: AuthService,
    private router: Router,
    private api: ApiService
  ) {}

  // ✅ AUTO REDIRECT IF TOKEN EXISTS
  ngOnInit() {
    const token = sessionStorage.getItem('token');

    if (token) {
      const redirectUrl = this.auth.getRedirectUrl();
      this.router.navigate([redirectUrl]);
    }
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  // ✅ MAIN LOGIN HANDLER
  loginHandler() {
    this.loginn();
  }

  // ❌ OLD METHOD NOT NEEDED ANYMORE (can remove later if you want)
  login() {
    const redirectUrl = this.auth.getRedirectUrl();
    this.router.navigate([redirectUrl]);
  }

  // ✅ API LOGIN
loginn() {
  this.api.userLogin({
    loginId: this.loginId,
    companyId: this.companyId,
    password: this.password,
    userStatus: this.userStatus
  }, 'clientUsers').subscribe({
    next: (res: any) => {

      console.log("FULL RESPONSE:", res);

      // ✅ FIX: correct path for token
      sessionStorage.setItem("token", res.body.token);

      // ✅ FIX: store body instead of full response
      sessionStorage.setItem("userData", JSON.stringify(res.body));

      // ✅ existing logic unchanged
      const redirectUrl = this.auth.getRedirectUrl();
      this.router.navigate([redirectUrl]);
    },

    error: (err) => {
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
