import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth.service';
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from '@angular/material/tooltip';
// import { AuthService } from '../../services/auth.service';

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
  companyId = '';
  password = '';
  hidePassword = true;

  constructor(private auth: AuthService, private router: Router) { }

  login() {
    const success = this.auth.login(this.userId, this.companyId, this.password);

    if (!success) {
      alert('Invalid User ID, Company ID, or Password');
      return;
    }
    
    const role = this.auth.getUserCategory();
    if (role === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePassword(){
    this.hidePassword = !this.hidePassword;
  }
}