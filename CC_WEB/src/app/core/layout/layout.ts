import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { TopbarComponent } from "../topbar/topbar";
import { CommonModule } from '@angular/common';
import { MatMenuModule } from "@angular/material/menu";

interface MenuItem {
  label: string;
  icon?: string;
  route?: string;
  children?: MenuItem[];
  open?: boolean; // track collapsible state
}

@Component({
  selector: 'app-layout',
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
  imports: [CommonModule, RouterOutlet, TopbarComponent, MatIconModule, RouterLinkWithHref, MatMenuModule],
})
export class LayoutComponent implements OnInit {
  collapsed = false;
  menuItems: MenuItem[] = [];

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
    const role = this.authService.getUserCategory();
    this.loadMenu(role);
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  isCollapsed(): boolean {
    return this.collapsed;
  }

  loadMenu(role: 'ADMIN' | 'USER' | null) {
    if (role === 'ADMIN') {
      this.menuItems = [
        { label: 'Dashboard', icon: 'dashboard', route: '/admin-dashboard' },
        { label: 'Manage Users', icon: 'group', route: '/admin-users' },
        { label: 'Reports', icon: 'bar_chart', route: '/admin-reports' },
        { label: 'Settings', icon: 'settings', route: '/settings' },
      ];
    } else {
      this.menuItems = [
        { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
        {
          label: 'Trade Services',
          icon: 'article',
          open: false,
          children: [
            {
              label: 'Import LC', route: '/import-welcome',
              open: false,
              children: [
                { label: 'Create', route: '/import-screen' },
                { label: 'Amend', route: '/import-screen/amend' },
              ],
            },
            { label: 'Export LC', route: '/export-screen' },
            {
              label: 'Undertaking Issuance', route: '/undertaking-welcome',
              open: false,
              children: [
                { label: 'Create', route: '/undertaking-issuance' },
                { label: 'Amend', route: '/undertaking-issuance/amend' },
              ],
            },
          ],
        },
        { label: 'Settings', icon: 'settings', route: '/settings' },
      ];
    }
  }

  // Toggle collapsible menus
  toggleMenu(item: MenuItem) {
    item.open = !item.open;
  }
}



// import { Component } from '@angular/core';
// import { Router, RouterOutlet, RouterLinkWithHref } from '@angular/router';
// import { MatIcon, MatIconModule } from "@angular/material/icon";
// import { TopbarComponent } from "../topbar/topbar";
// import { CommonModule } from '@angular/common';
// import { MatMenuModule } from "@angular/material/menu";

// @Component({
//   selector: 'app-layout',
//   templateUrl: './layout.html',
//   styleUrls: ['./layout.scss'],
//   imports: [CommonModule, RouterOutlet, TopbarComponent, MatIconModule, RouterLinkWithHref, MatMenuModule],
// })
// export class LayoutComponent {
//   collapsed = false;
//   tradeMenuOpen = false;
//   undertakingOpen = false;
//   importLcOpen = false;

//   constructor(private router: Router) { }

//   toggleSidebar() {
//     this.collapsed = !this.collapsed;
//   }

//   isCollapsed(): boolean {
//     return this.collapsed;
//   }

//   toggleTradeMenu() {
//     this.tradeMenuOpen = !this.tradeMenuOpen;
//   }
//   toggleUndertakingMenu() {
//     this.undertakingOpen = !this.undertakingOpen;
//   }
//   toggleImportLcMenu() {
//     this.importLcOpen = !this.importLcOpen;
//   }
// }
