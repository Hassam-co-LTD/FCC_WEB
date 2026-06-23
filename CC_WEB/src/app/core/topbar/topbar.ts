import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatDivider } from '@angular/material/divider';
@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, MatButtonModule,MatDivider,RouterLink],
  templateUrl: './topbar.html',
  styleUrls: ['./topbar.scss'],
})
export class TopbarComponent { 
  Name = 'User';
  menuOpen = false;
  menuVisible = false;


  constructor(private router:Router) { }
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

  goToChangePassword(): void {
  this.router.navigate(['/admin/user-change-password']);
}
  
}
