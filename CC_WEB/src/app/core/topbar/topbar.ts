import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatDivider } from '@angular/material/divider';
import { readSessionJson } from '../utils/browser-storage';
import { ThemeService } from '../services/theme.service';
@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, MatButtonModule,MatDivider,RouterLink],
  templateUrl: './topbar.html',
  styleUrls: ['./topbar.scss'],
})
export class TopbarComponent { 
  readonly theme = inject(ThemeService);
  Name = 'User';
  menuOpen = false;
  menuVisible = false;


  constructor(private router:Router) { }
       userData = readSessionJson<any>('userData', null);
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
