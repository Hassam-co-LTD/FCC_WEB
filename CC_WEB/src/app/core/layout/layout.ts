import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from '../topbar/topbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router} from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TopbarComponent, MatIconModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class LayoutComponent {
  isCollapsed = signal(false);
  tradeMenuOpen = false;

  constructor(private router: Router,
    // private auth: AuthService
  ) { }

  toggleSidebar() {
    this.isCollapsed.set(!this.isCollapsed());
  }

  goToImportLC() {
    this.router.navigate(['/import-screen']);
  }
  goToexportLC() {
    this.router.navigate(['/export-screen']);
  }
}
