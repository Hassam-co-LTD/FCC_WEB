import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.html',
  styleUrls: ['./admin-header.scss'],
  standalone: true,  // allows direct imports without a module
  imports: [CommonModule, MatIconModule]
})
export class AdminHeader {
  userName = 'Admin';  // displayed in the header
}