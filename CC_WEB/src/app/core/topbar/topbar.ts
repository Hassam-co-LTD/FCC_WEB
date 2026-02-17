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
  Name = 'User';
  menuOpen = false;
  menuVisible = false;


  constructor() { }
       userData = sessionStorage.getItem('userData')? JSON.parse(sessionStorage.getItem('userData')!) : null;
       userName = this.userData?.userName || 'User';
        lastGoodLogin = this.userData?.lastGoodLogin ? new Date(this.userData.lastGoodLogin).toLocaleString() : 'N/A';
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }


  // toggleNav() {
  //   this.menuVisible = !this.menuVisible;
  // }

}
