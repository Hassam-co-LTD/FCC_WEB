import { Component } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, MatButtonModule, RouterLink, RouterLinkActive],
  templateUrl: './topbar.html',
  styleUrls: ['./topbar.scss'],
})
export class TopbarComponent { 
  Name = 'Lovekumar';
  menuOpen = false;
  menuVisible = false;


  constructor() { }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }


  toggleNav() {
    this.menuVisible = !this.menuVisible;
  }

}
