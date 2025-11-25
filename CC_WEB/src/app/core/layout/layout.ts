import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";
import { TopbarComponent } from "../topbar/topbar";
import { CommonModule } from '@angular/common';
import { MatMenuModule } from "@angular/material/menu";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
  imports: [
    CommonModule,
    RouterOutlet,
    TopbarComponent,
    MatIconModule,
    RouterLinkWithHref,
    MatMenuModule
  ],
})
export class LayoutComponent implements OnInit {

  currentMenu: 'DEFAULT' | 'SYSTEM' | 'MIDDLE' = 'DEFAULT';
  collapsed = false;
  menuItems: MenuItem[] = [];

  systemOverviewMenu: MenuItem[] = [
    { label: 'Change Profile', route: '/system-overview/profile' },
    {
      label: 'Jurisdiction Maintenance',
      open: false,
      children: [
        { label: 'Roles', route: '/system-overview/jurisdiction-maintenance/role' },
        { label: 'Authorization', route: '/system-overview/jurisdiction-maintenance/authorization' },
      ]
    },
    {
      label: 'Customer Maintenance',
      open: false,
      children: [
        { label: 'Profiles', route: '/system-overview/customer-maintenance/customer-profile' },
        { label: 'Customer Entities', route: '/system-overview/customer-maintenance/customer-entities' },
        { label: 'User Profile', route: '/system-overview/customer-maintenance/user-profile' },
        { label: 'User Accounts', route: '/system-overview/customer-maintenance/user-accounts' }
      ]
    },
    { 
      label: 'User Maintenance',
      open: false,
      children: [
        { label: 'Profiles', route: '/system-overview/customer-maintenance/customer-profile' },
        { label: 'Authentication', route: '/system-overview/customer-maintenance/authentication' },       
      ]
     },
  ];

  middleOfficeMenu: MenuItem[] = [
    {
      label: 'Pending Approvals',
      open: false,
      children: [
        { label: 'List of Records', route: '/middle-office/pending-approvals/list-of-records' },
        { label: 'Edit Transaction', route: '/middle-office/pending-approvals/edit-transaction' },
        { label: 'Retrieve Unsigned', route: '/middle-office/pending-approvals/retrieve-unsigned' },
        { label: 'Pending Loans', route: '/middle-office/pending-approvals/pending-loans' },
        { label: 'Approve / Reject', route: '/middle-office/pending-approvals/approve-reject' },
        { label: 'Transactions', route: '/middle-office/pending-approvals/transactions' },
      ]
    },
    {
      label: 'Existing Records',
      open: false,
      children: [
        { label: 'List of Records', route: '/middle-office/existing-records/list-of-records' },
        { label: 'Edit Transaction', route: '/middle-office/existing-records/edit-transaction' },
        { label: 'Retrieve Unsigned', route: '/middle-office/existing-records/retrieve-unsigned' },
      ]
    }
  ];
  importLcOpen = false;
shippingGuaranteeOpen = false;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
    const role = this.authService.getUserCategory();
    this.loadMenu(role);

    // 🔥 Detect route changes & automatically switch menu
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;

        if (url.includes('/system-overview')) {
          this.currentMenu = 'SYSTEM';
        } else if (url.includes('/middle-office')) {
          this.currentMenu = 'MIDDLE';
        } else {
          this.currentMenu = 'DEFAULT';
        }
      });
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  isCollapsed(): boolean {
    return this.collapsed;
  }

  toggleMenu(item: MenuItem) {
    item.open = !item.open;
  }

  loadMenu(role: 'ADMIN' | 'USER' | null) {
    if (role === 'ADMIN') {
      this.menuItems = [
        { label: 'System Features', icon: 'insights', route: '/system-overview' },
        { label: 'Middle-Office', icon: 'group', route: '/middle-office' }
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
              label: 'Import LC',
              open: false,
              children: [
                { label: 'Create', route: '/import-screen' },
                { label: 'Amend', route: '/import-screen/amend' },
              ]
            },
            { label: 'Export LC', route: '/export-screen' },
            {
              label: 'Undertaking Issuance',
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
}



// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';
// import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
// import { MatIcon, MatIconModule } from "@angular/material/icon";
// import { TopbarComponent } from "../topbar/topbar";
// import { CommonModule } from '@angular/common';
// import { MatMenuModule } from "@angular/material/menu";

// interface MenuItem {
//   label: string;
//   icon?: string;
//   route?: string;
//   children?: MenuItem[];
//   open?: boolean; // track collapsible state
// }

// @Component({
//   selector: 'app-layout',
//   templateUrl: './layout.html',
//   styleUrls: ['./layout.scss'],
//   imports: [CommonModule, RouterOutlet, TopbarComponent, MatIconModule, RouterLinkWithHref, MatMenuModule],
// })
// export class LayoutComponent implements OnInit {
//   collapsed = false;
//   menuItems: MenuItem[] = [];

//   constructor(private router: Router, private authService: AuthService) { }

//   ngOnInit() {
//     const role = this.authService.getUserCategory();
//     this.loadMenu(role);
//   }

//   toggleSidebar() {
//     this.collapsed = !this.collapsed;
//   }

//   isCollapsed(): boolean {
//     return this.collapsed;
//   }

//   loadMenu(role: 'ADMIN' | 'USER' | null) {
//     if (role === 'ADMIN') {
//       this.menuItems = [
//         {
//           label: 'System Overview', icon: 'insights', open: false, 
//           children: [
//             { label: 'Jurisdiction Maintenance', route: '/system-overview/jurisdiction-maintenance',  open: false, children: [
//               { label: 'Roles', route: '/system-overview/jurisdiction-maintenance/role' },
//               { label: 'Authorization', route: '/system-overview/jurisdiction-maintenance/authorization' },
//             ] },
//             { label: 'Customer Maintenance', route: '/system-overview/customer-maintenance',  open: false, children: [
//               { label: 'Profiles', route: '/system-overview/customer-maintenance/customer-profile' },
//               { label: 'Customer Entities', route: '/system-overview/customer-maintenance/customer-entities' },
//               {
//                 label: 'User Profile', route: '/system-overview/customer-maintenance/user-profile', 
//               },
//               { label: 'User Accounts', route: '/system-overview/customer-maintenance/user-accounts' },
              
//             ] },
//             { label: 'User Maintenance', route: '/system-overview/user-maintenance' },
//             { label: 'Change Profile', route: '/system-overview/profile' },
//           ]
//         },
//         {
//           label: 'Middle-Office', icon: 'group', open: false,
//           children: [
//             {
//               label: 'Pending Approvals', route: '/middle-office/pending-approvals', open: false,
//               children: [
//                 { label: 'List of Records', route: '/middle-office/pending-approvals/list-of-records' },
//                 { label: 'Edit Transaction', route: '/middle-office/pending-approvals/edit-transaction' },
//                 { label: 'Retrieve Unsigned', route: '/middle-office/pending-approvals/retrieve-unsigned' },
//                 { label: 'Pending Loans', route: '/middle-office/pending-approvals/pending-loans' },
//                 { label: 'Approve / Reject', route: '/middle-office/pending-approvals/approve-reject' },
//                 { label: 'Transactions', route: '/middle-office/pending-approvals/transactions' },
//               ]
//             },
//             {
//               label: 'Existing Records', route: '/middle-office/existing-records', open: false,
//               children: [
//                 { label: 'List of Records', route: '/middle-office/existing-records/list-of-records' },
//                 { label: 'Edit Transaction', route: '/middle-office/existing-records/edit-transaction' },
//                 { label: 'Retrieve Unsigned', route: '/middle-office/existing-records/retrieve-unsigned' },
//               ]
//             },
//           ]
//         },
//         { label: 'Dashboard', icon: 'dashboard', route: '/admin-dashboard' },
//         { label: 'Manage Users', icon: 'group', route: '/admin-users' },
//         { label: 'Reports', icon: 'bar_chart', route: '/admin-reports' },
//         { label: 'Settings', icon: 'settings', route: '/settings' },
//       ];
//     } else {
//       this.menuItems = [
//         { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
//         {
//           label: 'Trade Services',
//           icon: 'article',
//           open: false,
//           children: [
//             {
//               label: 'Import LC', route: '/import-welcome',
//               open: false,
//               children: [
//                 { label: 'Create', route: '/import-screen' },
//                 { label: 'Amend', route: '/import-screen/amend' },
//               ],
//             },
//             { label: 'Export LC', route: '/export-screen' },
//             {
//               label: 'Undertaking Issuance', route: '/undertaking-welcome',
//               open: false,
//               children: [
//                 { label: 'Create', route: '/undertaking-issuance' },
//                 { label: 'Amend', route: '/undertaking-issuance/amend' },
//               ],
//             },
//           ],
//         },
//         { label: 'Settings', icon: 'settings', route: '/settings' },
//       ];
//     }
//   }

//   // Toggle collapsible menus
//   toggleMenu(item: MenuItem) {
//     item.open = !item.open;
//   }
// }



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
// 
  toggleImportLcMenu() {
    this.importLcOpen = !this.importLcOpen;
  }

  toggleShippingGuaranteeMenu() {
    this.shippingGuaranteeOpen = !this.shippingGuaranteeOpen;
  }
}
  