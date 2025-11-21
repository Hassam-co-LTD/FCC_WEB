import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AdminHeader } from './admin-header/admin-header';
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule,RouterOutlet,MatIconModule,AdminHeader],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
})
export class AdminComponent {
customersMenuOpen = false;
  usersMenuOpen = false;

  toggleCustomersMenu() {
    this.customersMenuOpen = !this.customersMenuOpen;
    // Close Users menu if open
    if (this.customersMenuOpen) this.usersMenuOpen = false;
  }

  toggleUsersMenu() {
    this.usersMenuOpen = !this.usersMenuOpen;
    // Close Customers menu if open
    if (this.usersMenuOpen) this.customersMenuOpen = false;
  }
}


