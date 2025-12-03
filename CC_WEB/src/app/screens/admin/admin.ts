import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AdminHeader } from './admin-header/admin-header';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    RouterOutlet,
    MatIconModule,
    AdminHeader,
    RouterModule
  ],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
})
export class AdminComponent {

  private router = inject(Router);

  customersMenuOpen = false;
  usersMenuOpen = false;

  toggleCustomersMenu() {
    this.customersMenuOpen = !this.customersMenuOpen;

    // Close users menu
    if (this.customersMenuOpen) {
      this.usersMenuOpen = false;
    }
  }

  toggleUsersMenu() {
    this.usersMenuOpen = !this.usersMenuOpen;

    // Close customers menu
    if (this.usersMenuOpen) {
      this.customersMenuOpen = false;
    }

    // Collapse → navigate back to dashboard
    if (!this.usersMenuOpen) {
      this.router.navigate(['/admin']);
    }
  }
}
