import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  UserDashboardResponse,
  UserDashboardTransaction,
} from '../../../core/models/user-dashboard-transaction-activities';
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

/* =========================================================
   USER DASHBOARD TRANSACTION ACTIVITIES
   CALENDAR INTERFACE - NEW CODE
   ========================================================= */

interface DashboardCalendarDay {
  day: number | null;
  dateKey: string;
  isToday: boolean;
  transactions: UserDashboardTransaction[];
}

/* =========================================================
   USER DASHBOARD TRANSACTION ACTIVITIES
   CALENDAR INTERFACE - END
   ========================================================= */

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

  /* =========================================================
     USER DASHBOARD TRANSACTION ACTIVITIES
     NEW CODE - PROPERTIES
     ========================================================= */

  dashboardData: UserDashboardResponse = {
    recentCreated: [],
    recentExpired: [],
    calendarTransactions: [],
  };

  calendarMonth: Date = new Date();

  calendarDays: DashboardCalendarDay[] = [];

  /* =========================================================
     USER DASHBOARD TRANSACTION ACTIVITIES
     NEW CODE - PROPERTIES END
     ========================================================= */

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

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
  ) {}

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadDashboard();
    this.updateHomeState();

    /* =======================================================
       USER DASHBOARD TRANSACTION ACTIVITIES
       NEW CODE
       ======================================================= */

    this.calendarMonth = new Date();

    this.buildCalendarDays();

    this.loadDashboardTransactions();

    /* =======================================================
       USER DASHBOARD TRANSACTION ACTIVITIES
       NEW CODE END
       ======================================================= */

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isHome = event.urlAfterRedirects === '/dashboard';
      });

    const store = this.getAllScreenStatusCount('R');
    console.log(store);
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

  /* =========================================================
     USER DASHBOARD TRANSACTION ACTIVITIES
     BACKEND DATA - NEW CODE
     ========================================================= */

  private loadDashboardTransactions(): void {
    const companyid = this.authService.getCompanyId();

    if (!companyid) {
      console.warn(
        'Company ID not found in session. Dashboard transaction data was not loaded.',
      );

      return;
    }

    const year = this.calendarMonth.getFullYear();

    const month = this.calendarMonth.getMonth() + 1;

    this.isSyncing = true;

    this.apiService.getDashboardData(year, month, companyid).subscribe({
      next: (response: UserDashboardResponse) => {
        this.dashboardData = response;
        console.log('dashboard calender transactions ', this.dashboardData);

        this.buildCalendarDays();

        this.lastUpdated = new Date();

        this.isSyncing = false;
      },

      error: (error) => {
        console.error('Failed to load dashboard transaction data:', error);

        this.isSyncing = false;
      },
    });
  }

  /* =========================================================
     USER DASHBOARD TRANSACTION ACTIVITIES
     CALENDAR NAVIGATION - NEW CODE
     ========================================================= */

  previousDashboardMonth(): void {
    this.calendarMonth = new Date(
      this.calendarMonth.getFullYear(),
      this.calendarMonth.getMonth() - 1,
      1,
    );

    this.buildCalendarDays();

    this.loadDashboardTransactions();
  }

  nextDashboardMonth(): void {
    this.calendarMonth = new Date(
      this.calendarMonth.getFullYear(),
      this.calendarMonth.getMonth() + 1,
      1,
    );

    this.buildCalendarDays();

    this.loadDashboardTransactions();
  }

  /* =========================================================
     USER DASHBOARD TRANSACTION ACTIVITIES
     CALENDAR BUILD - NEW CODE
     ========================================================= */

  private buildCalendarDays(): void {
    const year = this.calendarMonth.getFullYear();

    const month = this.calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);

    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();

    const firstDayOfWeek = firstDay.getDay();

    const days: DashboardCalendarDay[] = [];

    // Empty cells before first day
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({
        day: null,
        dateKey: '',
        isToday: false,
        transactions: [],
      });
    }

    // Actual month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);

      const dateKey = this.toDateKey(date);

      days.push({
        day,
        dateKey,
        isToday: this.isToday(date),
        transactions: this.getTransactionsForDate(dateKey),
      });
    }

    this.calendarDays = days;
  }

  /* =========================================================
     USER DASHBOARD TRANSACTION ACTIVITIES
     CALENDAR TRANSACTIONS - NEW CODE
     ========================================================= */

  private getTransactionsForDate(dateKey: string): UserDashboardTransaction[] {
    return this.dashboardData.calendarTransactions.filter(
      (transaction: UserDashboardTransaction) => {
        if (!transaction.createdOn) {
          return false;
        }

        const transactionDate = new Date(transaction.createdOn);

        if (isNaN(transactionDate.getTime())) {
          return false;
        }

        return this.toDateKey(transactionDate) === dateKey;
      },
    );
  }

  /* =========================================================
     USER DASHBOARD TRANSACTION ACTIVITIES
     DATE HELPERS - NEW CODE
     ========================================================= */

  private toDateKey(date: Date): string {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private isToday(date: Date): boolean {
    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  /* =========================================================
     USER DASHBOARD TRANSACTION ACTIVITIES
     ICON HELPER - NEW CODE
     ========================================================= */

  getDashboardTransactionIcon(type: string): string {
    const normalizedType = (type || '').toLowerCase().trim();

    if (normalizedType.includes('import') || normalizedType.includes('lc')) {
      return 'import_export';
    }

    if (
      normalizedType.includes('export') ||
      normalizedType.includes('collection')
    ) {
      return 'upload_file';
    }

    if (
      normalizedType.includes('shipping') ||
      normalizedType.includes('guarantee')
    ) {
      return 'local_shipping';
    }

    if (normalizedType.includes('undertaking')) {
      return 'description';
    }

    return 'receipt_long';
  }

  /* =========================================================
     USER DASHBOARD TRANSACTION ACTIVITIES
     CALENDAR MONTH TITLE - NEW CODE
     ========================================================= */

  getDashboardCalendarMonth(): string {
    return this.calendarMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  /* =========================================================
     USER DASHBOARD TRANSACTION ACTIVITIES
     NEW CODE - END
     ========================================================= */

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

  openExpiredTransaction(transaction: any): void {
    const tnxId = transaction?.tnxId;

    if (!tnxId) {
      console.error('Transaction ID not found');
      return;
    }

    const transactionType = transaction?.transactionType?.trim().toUpperCase();

    switch (transactionType) {
      case 'IMPORT LC':
      case 'IMPORT_LC':
      case 'IMPORTLC':
        this.router.navigate([
          '/dashboard/Trade-Services/import-screen',
          tnxId,
        ]);
        break;

      case 'EXPORT COLLECTION':
      case 'EXPORT_COLLECTION':
      case 'EXPORTCOLLECTION':
        this.router.navigate([
          '/dashboard/Trade-Services/export-collection',
          tnxId,
        ]);
        break;

      case 'UNDERTAKING':
      case 'UNDERTAKING ISSUANCE':
      case 'UNDERTAKING_ISSUANCE':
        this.router.navigate([
          '/dashboard/Trade-Services/undertaking-issuance',
          tnxId,
        ]);
        break;

      case 'SHIPPING GUARANTEE':
      case 'SHIPPING_GUARANTEE':
      case 'SHIPPINGGUARANTEE':
        this.router.navigate([
          '/dashboard/Trade-Services/shipping-guarantee',
          tnxId,
        ]);
        break;

      default:
        console.error(
          'Unknown transaction type:',
          transaction?.transactionType,
          'TNX ID:',
          tnxId,
        );
        break;
    }
  }

  getCalendarTransactionTooltip(day: any): string {
    if (!day?.transactions || day.transactions.length === 0) {
      return '';
    }

    return day.transactions
      .map(
        (transaction: any) =>
          `${transaction.transactionType} - ${transaction.tnxId}`,
      )
      .join('\n');
  }
  //  get all screens transaction status with I,R,S,A

  getAllStatus: any = null;
  getAllScreenStatusCount(status: string) {
    this.apiService.getCountAllStatus().subscribe({
      next: (res) => {
        console.log('count status data ', res);
        this.getAllStatus = res;
        console.log(
          'total R of exportCollection ',
          this.getAllStatus?.exportCollection?.R,
        );
      },
      error: (err) => {
        console.log('Error finding the count status', err);
      },
    });
  }

  // today,week,month,year data

  // =========================================================
  // TIME FILTER
  // =========================================================

  timeFilterr: 'today' | 'week' | 'month' | 'quarter' = 'today';

  setTimeFilterr(filter: 'today' | 'week' | 'month' | 'quarter'): void {
    this.timeFilterr = filter;
  }

  // =========================================================
  // FILTERED TRANSACTIONS
  // =========================================================

  getFilteredTransactions(): UserDashboardTransaction[] {
    const transactions = this.dashboardData?.calendarTransactions || [];

    switch (this.timeFilterr) {
      case 'today':
        return this.getTodayTransactions(transactions);

      case 'week':
        return this.getWeekTransactions(transactions);

      case 'month':
        return this.getMonthTransactions(transactions);

      case 'quarter':
        return this.getQuarterTransactions(transactions);

      default:
        return transactions;
    }
  }

  // =========================================================
  // NORMALIZE TRANSACTION TYPE
  // =========================================================

  private normalizeTransactionType(type: any): string {
    return String(type || '')
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
  }

  // =========================================================
  // TOTAL BY TRANSACTION TYPE
  // =========================================================

  getTransactionCountByType(transactionType: string): number {
    const expectedType = this.normalizeTransactionType(transactionType);

    return this.getFilteredTransactions().filter((transaction: any) => {
      return (
        this.normalizeTransactionType(transaction?.transactionType) ===
        expectedType
      );
    }).length;
  }

  // =========================================================
  // STATUS COUNT
  // =========================================================

  getStatusCount(
    transactionType: string,
    status: 'I' | 'R' | 'S' | 'A',
  ): number {
    const expectedType = this.normalizeTransactionType(transactionType);

    const expectedStatus = String(status || '')
      .trim()
      .toUpperCase();

    return this.getFilteredTransactions().filter((transaction: any) => {
      const actualType = this.normalizeTransactionType(
        transaction?.transactionType,
      );

      const actualStatus = String(transaction?.status || '')
        .trim()
        .toUpperCase();

      return actualType === expectedType && actualStatus === expectedStatus;
    }).length;
  }

  // =========================================================
  // TOTAL FILTERED TRANSACTIONS
  // =========================================================

  getTotalFilteredTransactions(): number {
    return this.getFilteredTransactions().length;
  }

  // =========================================================
  // TODAY
  // =========================================================

  private getTodayTransactions(
    transactions: UserDashboardTransaction[],
  ): UserDashboardTransaction[] {
    const today = new Date();

    return transactions.filter((transaction: any) => {
      if (!transaction?.createdOn) {
        return false;
      }

      const transactionDate = new Date(transaction.createdOn);

      return (
        transactionDate.getFullYear() === today.getFullYear() &&
        transactionDate.getMonth() === today.getMonth() &&
        transactionDate.getDate() === today.getDate()
      );
    });
  }

  // =========================================================
  // THIS WEEK
  // =========================================================

  private getWeekTransactions(
    transactions: UserDashboardTransaction[],
  ): UserDashboardTransaction[] {
    const today = new Date();

    const startOfWeek = new Date(today);

    const day = today.getDay();

    // Monday = first day of week
    const difference = day === 0 ? 6 : day - 1;

    startOfWeek.setDate(today.getDate() - difference);

    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);

    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return transactions.filter((transaction: any) => {
      if (!transaction?.createdOn) {
        return false;
      }

      const transactionDate = new Date(transaction.createdOn);

      return transactionDate >= startOfWeek && transactionDate < endOfWeek;
    });
  }

  // =========================================================
  // THIS MONTH
  // =========================================================

  private getMonthTransactions(
    transactions: UserDashboardTransaction[],
  ): UserDashboardTransaction[] {
    const today = new Date();

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const startOfNextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      1,
    );

    return transactions.filter((transaction: any) => {
      if (!transaction?.createdOn) {
        return false;
      }

      const transactionDate = new Date(transaction.createdOn);

      return (
        transactionDate >= startOfMonth && transactionDate < startOfNextMonth
      );
    });
  }

  // =========================================================
  // QUARTER
  // =========================================================

  private getQuarterTransactions(
    transactions: UserDashboardTransaction[],
  ): UserDashboardTransaction[] {
    const today = new Date();

    const currentMonth = today.getMonth();

    const quarterStartMonth = Math.floor(currentMonth / 3) * 3;

    const startOfQuarter = new Date(today.getFullYear(), quarterStartMonth, 1);

    const startOfNextQuarter = new Date(
      today.getFullYear(),
      quarterStartMonth + 3,
      1,
    );

    return transactions.filter((transaction: any) => {
      if (!transaction?.createdOn) {
        return false;
      }

      const transactionDate = new Date(transaction.createdOn);

      return (
        transactionDate >= startOfQuarter &&
        transactionDate < startOfNextQuarter
      );
    });
  }
}
