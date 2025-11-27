import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";
import { TopbarComponent } from "../topbar/topbar";
import { CommonModule } from '@angular/common';
import { MatMenuModule } from "@angular/material/menu";
import { filter } from 'rxjs/operators';

interface MenuItem {
  label: string;
  icon?: string;
  route?: string;
  children?: MenuItem[];
  open?: boolean;
}

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
  shippingGuaranteeOpen = false;
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

            // -------------------------
            // IMPORT LC
            // -------------------------
            {
              label: 'Import LC', route: '/import-welcome',
              open: false,
              children: [
                { label: 'Create', route: '/import-screen' },
                { label: 'Amend', route: '/import-screen/amend' },
              ]
            },

            // -------------------------
            // EXPORT LC
            // -------------------------
            { label: 'Export LC', route: '/export-screen' },

            // -------------------------
            // SHIPPING GUARANTEE
            // -------------------------
            {
              label: 'Shipping Guarantee',
              open: false,
              children: [
                { label: 'Create', route: '/shipping-guarantee' },
                { label: 'Amend', route: '/shipping-guarantee/amend' },
              ]
            },

            // -------------------------
            // EXPORT COLLECTION
            // -------------------------
            {
              label: 'Export Collection',
              open: false,
              children: [
                { label: 'Create', route: '/export-collection' },
                // If you add amend later, uncomment this:
                // { label: 'Amend', route: '/export-collection/amend' },
              ]
            },

            // -------------------------
            // UNDERTAKING ISSUANCE
            // -------------------------
            {
              label: 'Undertaking Issuance',
              open: false,
              children: [
                { label: 'Create', route: '/undertaking-issuance' },
                { label: 'Amend', route: '/undertaking-issuance/amend' },
              ]
            },

          ],
        },

        { label: 'Settings', icon: 'settings', route: '/settings' },
      ];
    }
  }



  toggleShippingGuaranteeMenu() {
    this.shippingGuaranteeOpen = !this.shippingGuaranteeOpen;
  }
}
