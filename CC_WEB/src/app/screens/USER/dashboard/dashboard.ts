import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { NavigationEnd, Router, RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { filter } from 'rxjs';

type CardFormat = 'number' | 'currency';

interface DashboardCard {
  id: number;
  type: string;
  icon: string;
  title: string;
  value: number;
  format: CardFormat;
  trend: number;
  link: string;
}

interface ServiceStats {
  pending: number;
  completed: number;
}

interface RecentActivity {
  id: number;
  type: string;
  title: string;
  status: string;
  reference: string;
  time: Date;
  amount: number;
  currency: string;
  link: string;
}

interface NewsItem {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  time: Date;
  link?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,

  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],

  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard implements OnInit {
  // =========================================================
  // HEADER
  // =========================================================

  userName = 'User';

  isHome = true;

  isSyncing = false;

  lastUpdated = new Date();

  // =========================================================
  // FILTER
  // =========================================================

  timeFilter: 'today' | 'week' | 'month' | 'quarter' = 'today';

  // =========================================================
  // OPERATIONS OVERVIEW
  // =========================================================

  cards: DashboardCard[] = [
    {
      id: 1,
      type: 'primary',
      icon: 'account_balance',
      title: 'Total Transactions',
      value: 1500,
      format: 'number',
      trend: 8,
      link: '/dashboard/search-by-id',
    },

    {
      id: 2,
      type: 'success',
      icon: 'check_circle',
      title: 'Completed',
      value: 800,
      format: 'number',
      trend: 5,
      link: '/dashboard/search-by-id',
    },

    {
      id: 3,
      type: 'warning',
      icon: 'hourglass_empty',
      title: 'Pending',
      value: 650,
      format: 'number',
      trend: -3,
      link: '/dashboard/search-by-id',
    },

    {
      id: 4,
      type: 'danger',
      icon: 'warning',
      title: 'Rejected',
      value: 50,
      format: 'number',
      trend: 12,
      link: '/dashboard/search-by-id',
    },
  ];

  // =========================================================
  // QUICK ACCESS
  // =========================================================

  importStats: ServiceStats = {
    pending: 4,
    completed: 18,
  };

  exportStats: ServiceStats = {
    pending: 2,
    completed: 11,
  };

  undertakingStats: ServiceStats = {
    pending: 3,
    completed: 9,
  };

  shippingStats: ServiceStats = {
    pending: 1,
    completed: 6,
  };

  // =========================================================
  // RECENT ACTIVITY
  // =========================================================

  recentActivities: RecentActivity[] = [
    {
      id: 1,
      type: 'undertaking',
      title: 'Undertaking Issued',
      status: 'Completed',
      reference: 'UND-2026-0098',
      time: new Date(),
      amount: 150000,
      currency: 'USD',
      link: '/dashboard/Trade-Services/undertaking-welcome',
    },

    {
      id: 2,
      type: 'import',
      title: 'Import LC Created',
      status: 'Pending',
      reference: 'ILC-2026-0041',
      time: new Date(),
      amount: 82000,
      currency: 'EUR',
      link: '/dashboard/Trade-Services/import-welcome',
    },

    {
      id: 3,
      type: 'shipping',
      title: 'Shipping Guarantee Created',
      status: 'Completed',
      reference: 'SG-2026-0018',
      time: new Date(),
      amount: 45000,
      currency: 'USD',
      link: '/dashboard/Trade-Services/shipping-welcome',
    },

    {
      id: 4,
      type: 'export',
      title: 'Export Collection Submitted',
      status: 'Pending',
      reference: 'EXP-2026-0029',
      time: new Date(),
      amount: 67000,
      currency: 'USD',
      link: '/dashboard/Trade-Services/export-collection-welcome',
    },
  ];

  // =========================================================
  // NEWS
  // =========================================================

  newsItems: NewsItem[] = [
    {
      id: 1,
      category: 'Trade Finance',
      title: 'Global Trade Growth Forecast Updated',
      excerpt:
        'International trade volumes are expected to grow steadily across major markets.',
      time: new Date(),
      link: 'https://infotechgroup.com/newsroom/',
    },

    {
      id: 2,
      category: 'System Update',
      title: 'Trade Services Platform',
      excerpt:
        'New trade service capabilities and workflow improvements are now available.',
      time: new Date(),
    },
  ];

  // =========================================================
  // SYSTEM
  // =========================================================

  systemStatus: 'online' | 'degraded' | 'offline' = 'online';

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(private router: Router) {}

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadDashboard();

    this.updateHomeState();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isHome = event.urlAfterRedirects === '/dashboard';
      });
  }

  // =========================================================
  // REFRESH
  // =========================================================

  refreshDashboard(): void {
    if (this.isSyncing) {
      return;
    }

    this.isSyncing = true;

    setTimeout(() => {
      this.lastUpdated = new Date();

      this.isSyncing = false;
    }, 1000);
  }

  // =========================================================
  // NEW TRANSACTION
  // =========================================================

  quickAction(): void {
    this.router.navigate(['/dashboard/Trade-Services']);
  }

  // =========================================================
  // FILTER
  // =========================================================

  setTimeFilter(filter: 'today' | 'week' | 'month' | 'quarter'): void {
    this.timeFilter = filter;

    // Later you can call your backend here.
    //
    // Example:
    //
    // this.dashboardService
    //   .getDashboardStats(filter)
    //   .subscribe(...);
  }

  // =========================================================
  // NEWS
  // =========================================================

  refreshNews(): void {
    this.lastUpdated = new Date();
  }

  // =========================================================
  // FORMAT VALUE
  // =========================================================

  formatValue(value: number, format: CardFormat): string {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }).format(value);
    }

    return value.toLocaleString();
  }

  // =========================================================
  // ACTIVITY ICON
  // =========================================================

  getActivityIcon(type: string): string {
    const map: Record<string, string> = {
      undertaking: 'description',

      import: 'import_export',

      export: 'upload_file',

      shipping: 'local_shipping',
    };

    return map[type] || 'info';
  }

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  private loadDashboard(): void {
    this.lastUpdated = new Date();
  }

  // =========================================================
  // HOME STATE
  // =========================================================

  private updateHomeState(): void {
    this.isHome = this.router.url === '/dashboard';
  }
}
