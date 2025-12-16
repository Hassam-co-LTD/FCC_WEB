import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

/* ================= CARD TYPES ================= */
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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit, AfterViewInit {

  /* ================= HEADER ================= */
  userName = 'User';
  isSyncing = false;
  lastUpdated = new Date();

  /* ================= FILTER ================= */
  timeFilter: 'today' | 'week' | 'month' | 'quarter' = 'today';

  /* ================= METRICS ================= */
  cards: DashboardCard[] = [
    {
      id: 1,
      type: 'primary',
      icon: 'account_balance',
      title: 'Total Transactions',
      value: 1245,
      format: 'number',
      trend: 8,
      link: '/transactions'
    },
    {
      id: 2,
      type: 'success',
      icon: 'check_circle',
      title: 'Completed',
      value: 980,
      format: 'number',
      trend: 5,
      link: '/transactions/completed'
    },
    {
      id: 3,
      type: 'warning',
      icon: 'hourglass_empty',
      title: 'Pending',
      value: 265,
      format: 'number',
      trend: -3,
      link: '/transactions/pending'
    },
    {
      id: 4,
      type: 'info',
      icon: 'payments',
      title: 'Total Value',
      value: 25,
      format: 'currency',
      trend: 12,
      link: '/transactions/value'
    }
  ];

  /* ================= QUICK ACCESS STATS ================= */
  importStats = { pending: 4, completed: 18 };
  exportStats = { pending: 2, completed: 11 };
  undertakingStats = { pending: 3, completed: 9 };
  shippingStats = { pending: 1, completed: 6 };

  /* ================= ACTIVITY ================= */
  recentActivities = [
    {
      id: 1,
      type: 'undertaking',
      title: 'Undertaking Issued',
      status: 'Completed',
      reference: 'UND-2025-0098',
      time: new Date(),
      amount: 150000,
      currency: 'USD',
      link: '/undertaking-details/UND-2025-0098'
    },
    {
      id: 2,
      type: 'import',
      title: 'Import LC Created',
      status: 'Pending',
      reference: 'ILC-2025-0041',
      time: new Date(),
      amount: 82000,
      currency: 'EUR',
      link: '/import-details/ILC-2025-0041'
    }
  ];

  /* ================= CHART ================= */
  @ViewChild('volumeChart') volumeChart!: ElementRef<HTMLCanvasElement>;
  chartLoaded = false;

  /* ================= NEWS ================= */
  newsItems = [
    {
      id: 1,
      category: 'Trade Finance',
      title: 'Global Trade Growth Forecast Updated',
      excerpt: 'International trade volumes are expected to grow steadily...',
      time: new Date(),
      link: 'https://example.com'
    }
  ];

  /* ================= SYSTEM ================= */
  systemStatus: 'online' | 'degraded' | 'offline' = 'online';

  /* ================= LIFECYCLE ================= */
  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadChart();
    }, 800);
  }

  /* ================= ACTIONS ================= */
  refreshDashboard(): void {
    this.isSyncing = true;

    setTimeout(() => {
      this.lastUpdated = new Date();
      this.isSyncing = false;
    }, 1200);
  }

  quickAction(): void {
    console.log('New transaction triggered');
  }

  setTimeFilter(filter: 'today' | 'week' | 'month' | 'quarter'): void {
    this.timeFilter = filter;
  }

  refreshNews(): void {
    this.lastUpdated = new Date();
  }

  /* ================= HELPERS ================= */
  formatValue(value: number, format: CardFormat): string {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2
      }).format(value);
    }
    return value.toLocaleString();
  }

  getActivityIcon(type: string): string {
    const map: Record<string, string> = {
      undertaking: 'description',
      import: 'import_export',
      export: 'upload_file',
      shipping: 'local_shipping'
    };
    return map[type] || 'info';
  }

  /* ================= PRIVATE ================= */
  private loadDashboard(): void {
    this.lastUpdated = new Date();
  }

  private loadChart(): void {
    if (!this.volumeChart) return;

    const ctx = this.volumeChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chartLoaded = true;
  }
}
