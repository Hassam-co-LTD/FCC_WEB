  import { Component } from '@angular/core';
  import { FormsModule, ReactiveFormsModule } from '@angular/forms';
  import { Router, RouterLink, RouterModule } from '@angular/router';
 import Swal from 'sweetalert2';

  import { MatFormFieldModule } from '@angular/material/form-field';
  import { MatInputModule } from '@angular/material/input';
  import { MatButtonModule } from '@angular/material/button';
  import { MatCardModule } from '@angular/material/card';
  import { AuthService } from '../../../core/services/auth.service';
  import { MatIconModule } from "@angular/material/icon";
  import { MatTooltipModule } from '@angular/material/tooltip';

  // import { AuthService } from '../../services/auth.service';
  import { ApiService } from '../../../core/services/api.service';

  @Component({
    selector: 'app-login',
    standalone: true,
    imports: [
      FormsModule,
      RouterLink,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatCardModule,
      ReactiveFormsModule,
      RouterModule,
      MatIconModule,
      MatTooltipModule
  ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
  })
  export class LoginComponent {
    userId = '';
    userStatus = 'A';
    loginId = '';
    companyId = '';
    password = '';
    hidePassword = true;


    constructor(private auth: AuthService, private router: Router,private api: ApiService) { }

    login() {
     
      const success = this.auth.login(this.userId, this.companyId, this.password);

      if (!success) {
        alert('Invalid User ID, Company ID, or Password');
        return;
      }
    const  companyType = this.auth.getCompanyType();
  
      const CustomerType = this.auth.getUserCategory();
  
      if ( companyType == 'B') {
        this.router.navigate(['/admin']);
      } else if(companyType == "C" && CustomerType == "A"){ {
          this.router.navigate(['/customer-user']);
      }
       
      }
      else if(companyType == "C" && CustomerType == "U"){
        this.router.navigate(['/dashboard']);
      }
    }

    togglePassword(){
      this.hidePassword = !this.hidePassword;
    }


  loginn() {
    this.api.userLogin({
      loginId: this.loginId,
      companyId: this.companyId,
      password: this.password,
      userStatus: this.userStatus
    }, 'clientUsers').subscribe({

      next: (res) => {

         sessionStorage.setItem("userData", JSON.stringify(res));
         console.log("CustomerType:", this.auth.getUserCategory());
         console.log("CompanyType:", this.auth.getCompanyType());
         console.log('Login successful, userData stored in sessionStorage:', sessionStorage.getItem('userData'));
        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: 'Welcome back!',
          timer: 1500,
          showConfirmButton: false
        });

        
          this.router.navigate(['/dashboard']);
        
      },

      error: (err) => {
        console.error('Login failed:', err);

        // Extract message safely
        const errorMessage =
          err?.error?.message ||
          err?.error ||
          'Something went wrong!';

        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: errorMessage,
        });
      }
    });
  }


  }