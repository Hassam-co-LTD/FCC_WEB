import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AdminHeader } from './admin-header/admin-header';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule, MatCardModule, MatButtonModule,RouterOutlet,MatIconModule,AdminHeader,RouterModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
})
export class AdminComponent {

 private router = inject(Router)
customersMenuOpen = false;
  usersMenuOpen = false;

  toggleCustomersMenu() {
    this.customersMenuOpen = !this.customersMenuOpen;
    // Close Users menu if open
    if (this.customersMenuOpen) this.usersMenuOpen = false;
  }

  

  //  conditionaly rendering 

  toggleUsersMenu() {
  this.usersMenuOpen = !this.usersMenuOpen;

  if (!this.usersMenuOpen) {
    // Navigate away when menu is collapsed
    this.router.navigate(['/admin']); // just show dashboard / stats
  }
}

}


