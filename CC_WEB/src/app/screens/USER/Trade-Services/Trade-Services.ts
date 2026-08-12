import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { filter } from 'rxjs';

@Component({
  selector: 'app-trade-services',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './Trade-Services.html',
  styleUrls: ['./Trade-Services.scss'],
})
export class TradeServices implements OnInit {
  // PAGE STATE
  isHome = true;

  isSyncing = false;
  lastUpdated = new Date();
  
  // OVERVIEW
  overview = {
    total: 1500,
    pending: 650,
    completed: 800,
    rejected: 50,
  };

  // SERVICES
  
  services = [
    {
      id: 1,
      title: 'Import LC',
      description: 'Manage import letters of credit',
      icon: 'import_export',
      cssClass: 'import',
      total: 650,
      pending: 280,
      completed: 340,
      rejected: 30,
      route: '/dashboard/Trade-Services/import-welcome',
    },

    {
      id: 2,
      title: 'Export Collection',
      description: 'Handle export collection transactions',
      icon: 'upload_file',
      cssClass: 'export',
      total: 320,
      pending: 120,
      completed: 185,
      rejected: 15,
      route: '/dashboard/Trade-Services/export-collection-welcome',
    },

    {
      id: 3,
      title: 'Undertaking Issuance',
      description: 'Issue and manage undertakings',
      icon: 'description',
      cssClass: 'undertaking',
      total: 280,
      pending: 100,
      completed: 165,
      rejected: 15,
      route: '/dashboard/Trade-Services/undertaking-welcome',
    },

    {
      id: 4,
      title: 'Shipping Guarantee',
      description: 'Manage shipping guarantees',
      icon: 'local_shipping',
      cssClass: 'shipping',
      total: 250,
      pending: 150,
      completed: 110,
      rejected: 10,
      route: '/dashboard/Trade-Services/shipping-welcome',
    },
  ];

  // PENDING ACTIONS
  
  pendingActions = [
    {
      id: 1,
      reference: 'ILC-2026-00421',
      service: 'Import LC',
      description: 'Import LC awaiting approval',
      status: 'Pending',
      date: new Date(),
      route: '/dashboard/Trade-Services/import-screen/inquiries',
    },

    {
      id: 2,
      reference: 'EXP-2026-00219',
      service: 'Export Collection',
      description: 'Export collection under review',
      status: 'Under Review',
      date: new Date(),
      route: '/dashboard/Trade-Services/export-collection-welcome',
    },

    {
      id: 3,
      reference: 'UND-2026-00091',
      service: 'Undertaking',
      description: 'Undertaking awaiting authorization',
      status: 'Pending',
      date: new Date(),
      route: '/dashboard/Trade-Services/undertaking-welcome',
    },

    {
      id: 4,
      reference: 'SG-2026-00182',
      service: 'Shipping Guarantee',
      description: 'Shipping guarantee awaiting approval',
      status: 'Pending',
      date: new Date(),
      route: '/dashboard/Trade-Services/shipping-welcome',
    },
  ];

  // RECENT ACTIVITY
  
  recentActivity = [
    {
      id: 1,
      type: 'import',
      title: 'Import LC Created',
      status: 'Pending',
      reference: 'ILC-2026-00421',
      date: new Date(),
      amount: 82000,
      currency: 'EUR',
      route: '/dashboard/Trade-Services/import-screen/inquiries',
    },

    {
      id: 2,
      type: 'undertaking',
      title: 'Undertaking Issued',
      status: 'Completed',
      reference: 'UND-2026-00091',
      date: new Date(),
      amount: 150000,
      currency: 'USD',
      route: '/dashboard/Trade-Services/undertaking-welcome',
    },

    {
      id: 3,
      type: 'shipping',
      title: 'Shipping Guarantee Created',
      status: 'Completed',
      reference: 'SG-2026-00182',
      date: new Date(),
      amount: 45000,
      currency: 'USD',
      route: '/dashboard/Trade-Services/shipping-welcome',
    },

    {
      id: 4,
      type: 'export',
      title: 'Export Collection Submitted',
      status: 'Under Review',
      reference: 'EXP-2026-00219',
      date: new Date(),
      amount: 67000,
      currency: 'USD',
      route: '/dashboard/Trade-Services/export-collection-welcome',
    },
  ];

  // CONSTRUCTOR
  
  constructor(private router: Router) {}

  // INIT
  
  ngOnInit(): void {
    this.updateHomeState();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateHomeState();
      });
  }

  // =====================================================
  // IMPORTANT
  // =====================================================

  private updateHomeState(): void {
    const url = this.router.url.split('?')[0];

    this.isHome =
      url === '/dashboard/Trade-Services' ||
      url === '/dashboard/Trade-Services/';
  }

  // ACTIONS
  
  refreshDashboard(): void {
    this.isSyncing = true;

    setTimeout(() => {
      this.lastUpdated = new Date();

      this.isSyncing = false;
    }, 1000);
  }

  openService(service: any): void {
    if (service.route) {
      this.router.navigateByUrl(service.route);
    }
  }

  getActivityIcon(type: string): string {
    const map: Record<string, string> = {
      import: 'import_export',

      export: 'upload_file',

      undertaking: 'description',

      shipping: 'local_shipping',
    };

    return map[type] || 'info';
  }
}
