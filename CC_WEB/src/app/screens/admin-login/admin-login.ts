import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Angular Material modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterModule
  ],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.scss'],
})
export class AdminLogin {

  constructor(private router: Router) {}

  adminFormData = new FormGroup({
    id: new FormControl(),
    c_id: new FormControl(),
    passw: new FormControl()
  });

  data: any = [
    {
      adminId: 123,
      adminPassword: "ameen123",
      adminCompanyId: "info123"
    },
    {
      userId: 1234,
      userPassword: "ameen123",
      userCompanyId: "info123"
    }
  ];

  onSubmit() {
    const { id, c_id, passw } = this.adminFormData.value;

    // ADMIN LOGIN
    if (
      id == this.data[0].adminId &&
      c_id == this.data[0].adminCompanyId &&
      passw === this.data[0].adminPassword
    ) {
      this.router.navigate(['/admin']);
      return;
    }

    // USER LOGIN
    if (
      id == this.data[1].userId &&
      c_id == this.data[1].userCompanyId &&
      passw === this.data[1].userPassword
    ) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // INVALID LOGIN
    alert("Invalid Credentials!");
  }
}
