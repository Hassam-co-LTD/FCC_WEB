import { Component, inject } from '@angular/core';
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

  private router = inject(Router); // <-- use inject instead of constructor

  adminFormData = new FormGroup({
    id: new FormControl(),
    c_id: new FormControl(),
    passw: new FormControl()
  });

  data: any = {
    adminId: 123,
    adminPassword: "ameen123",
    adminCompanyId: "info123"
  };

  onSubmit() {
    const { id, c_id, passw } = this.adminFormData.value;

    if (id == this.data.adminId && c_id == this.data.adminCompanyId && passw === this.data.adminPassword) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
