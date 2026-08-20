import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import {
  CommonModule,
  isPlatformBrowser,
  DecimalPipe,
  DatePipe,
  TitleCasePipe
} from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

import {
  UndertakingIssuanceService,
  UndertakingTransaction
} from '../../../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';

@Component({
  selector: 'app-inquiries-records',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    FormsModule,
    DecimalPipe,
    DatePipe,
    TitleCasePipe
  ],
  templateUrl: './inquiries-records.html',
  styleUrls: ['./inquiries-records.scss']
})
export class inquiriesRecords implements OnInit {

  // =========================
  // STATE
  // =========================

  allTransactions: UndertakingTransaction[] = [];
  filteredTransactions: UndertakingTransaction[] = [];

  // =========================
  // FILTERS
  // =========================

  searchQuery = '';
  currencyFilter = '';
  activeTab = 'pending';
  showAdvanced = false;

  // =========================
  // TABS
  // =========================

  tabs = [
    { key: 'live', label: 'Live' },
    { key: 'pending', label: 'Pending' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' }
  ];

  // =========================
  // PAGINATION
  // =========================

  currentPage = 1;
  itemsPerPage = 10;

  // =========================
  // SORTING
  // =========================

  sortColumn: string = 'lastUpdated';
  sortDirection: 'desc' | 'asc' = 'desc';

  private isBrowser: boolean;

  constructor(
    private transactionService: UndertakingIssuanceService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // =========================
  // INITIALIZATION
  // =========================

  ngOnInit(): void {

    if (!this.isBrowser) {
      return;
    }

    // Load default Pending records
    this.loadByStatus();

    // Listen for transaction stream updates
    this.transactionService.transactionsStream$.subscribe(txList => {

      this.allTransactions = txList;

      this.filterBySearchOnly();

    });
  }

  // =========================
  // LOAD TRANSACTIONS
  // =========================

  private loadByStatus(): void {
  this.transactionService.refreshTransactions(this.activeTab).subscribe({
    next: (txList) => {
      this.allTransactions = txList;
      this.currentPage = 1;
      this.filterBySearchOnly();
    },
    error: () => {
      this.allTransactions = [];
      this.filteredTransactions = [];
    }
  });
}

  // =========================
  // TAB SWITCHING
  // =========================

  setActiveTab(tab: string): void {

    if (this.activeTab === tab) {
      return;
    }

    this.activeTab = tab;

    this.currentPage = 1;

    // Clear existing data while loading
    this.allTransactions = [];
    this.filteredTransactions = [];

    // Load new tab data
    this.loadByStatus();

  }

  // =========================
  // SEARCH + FILTER
  // =========================

  applyFilters(): void {

    this.currentPage = 1;

    this.filterBySearchOnly();

  }

  private filterBySearchOnly(): void {

    const query =
      this.searchQuery
        .toLowerCase()
        .trim();

    const currency =
      this.currencyFilter
        .toLowerCase()
        .trim();

    let temp =
      [...this.allTransactions];

    temp = temp.filter(tx => {

      const data =
        tx.formData || {};

      // Keep Undertaking-specific fields
      const benName =
        data.applicantBeneficiary?.beneficiaryName || '';

      const appName =
        data.applicantBeneficiary?.applicantName || '';

      const cur =
        data.undertakingDetails?.currency || '';

      const issuerRef =
        data.bankForm?.issuerReference || '';

      const displayId =
        tx.channelReference || '';

      const matchesSearch =
        !query ||
        displayId.toLowerCase().includes(query) ||
        issuerRef.toLowerCase().includes(query) ||
        benName.toLowerCase().includes(query) ||
        appName.toLowerCase().includes(query) ||
        cur.toLowerCase().includes(query);

      const matchesCurrency =
        !currency ||
        cur.toLowerCase() === currency;

      return matchesSearch && matchesCurrency;

    });

    this.applySorting(temp);

  }

  // =========================
  // CLEAR SEARCH
  // =========================

  clearSearch(): void {

    this.searchQuery = '';

    this.applyFilters();

  }

  // =========================
  // SORTING
  // =========================

  sortBy(column: string): void {

    if (this.sortColumn === column) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortColumn = column;

      this.sortDirection = 'asc';

    }

    this.applyFilters();

  }

  private applySorting(
    source: UndertakingTransaction[]
  ): void {

    this.filteredTransactions =
      [...source].sort((a, b) => {

        const aVal =
          this.resolveColumn(a, this.sortColumn);

        const bVal =
          this.resolveColumn(b, this.sortColumn);

        if (aVal == null) {
          return 1;
        }

        if (bVal == null) {
          return -1;
        }

        if (
          aVal instanceof Date &&
          bVal instanceof Date
        ) {

          return this.sortDirection === 'asc'
            ? aVal.getTime() - bVal.getTime()
            : bVal.getTime() - aVal.getTime();

        }

        return this.sortDirection === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));

      });

  }

  private resolveColumn(
    tx: UndertakingTransaction,
    column: string
  ): any {

    const data =
      tx.formData || {};

    switch (column) {

      case 'channelReference':
        return tx.channelReference;

      case 'lastUpdated':
        return new Date(tx.lastUpdated);

      case 'currency':
        return data.undertakingDetails?.currency;

      case 'amount':
        return data.undertakingDetails?.undertakingAmount;

      default:
        return null;

    }

  }

  // =========================
  // PAGINATION
  // =========================

  get totalPages(): number {

    const count =
      Math.ceil(
        this.filteredTransactions.length /
        this.itemsPerPage
      );

    return count < 1 ? 1 : count;

  }

  get pagedTransactions(): UndertakingTransaction[] {

    const start =
      (this.currentPage - 1) *
      this.itemsPerPage;

    return this.filteredTransactions.slice(
      start,
      start + this.itemsPerPage
    );

  }

  previousPage(): void {

    if (this.currentPage > 1) {

      this.currentPage--;

    }

  }

  nextPage(): void {

    if (
      this.currentPage <
      this.totalPages
    ) {

      this.currentPage++;

    }

  }

  // =========================
  // OPEN UNDERTAKING
  // =========================

  openUndertaking(
    tx: UndertakingTransaction
  ): void {

    const identifier =
      tx.tnxId || tx.id;

    // LIVE EVENT
    if (this.activeTab === 'live') {

      this.router.navigate(
        [
          '/undertaking-issuance/request-undertaking'
        ],
        {
          queryParams: {
            transactionId: identifier,
            mode: 'READ_ONLY',
            tab: 'live',
            eventRefNo:
              tx ?? ''
          }
        }
      );

      return;
    }

    // NORMAL STATUS RECORD
    this.router.navigate(
      [
        '/undertaking-issuance/request-undertaking'
      ],
      {
        queryParams: {
          transactionId: identifier
        }
      }
    );

  }

  // =========================
  // VIEW ONLY
  // =========================

  viewOnly(
    tx: UndertakingTransaction
  ): void {

    const identifier =
      tx.tnxId || tx.id;

    this.router.navigate(
      [
        '/undertaking-issuance/preview'
      ],
      {
        queryParams: {

          transactionId:
            identifier,

          mode: 'view'

        }
      }
    );

  }

  // =========================
  // TRACK BY
  // =========================

  trackByTnxId(
    _: number,
    tx: UndertakingTransaction
  ): string | number {

    return tx.tnxId ||
       tx.id;

  }

  // =========================
  // DRAFT CHECK
  // =========================

  isDraft(
    tx: UndertakingTransaction
  ): boolean {

    return this.mapBackendStatusToChar(
      tx.status
    ) === 'i';

  }

  // =========================
  // STATUS MAPPER
  // =========================

  private mapTabToBackendStatus(
    tab: string
  ): string {

    switch (tab) {

      case 'pending':
        return 'i';

      case 'submitted':
        return 's';

      case 'approved':
        return 'a';

      case 'rejected':
        return 'r';

      default:
        return 'i';

    }

  }

  private mapBackendStatusToChar(
    statusStr: string
  ): string {

    const s =
      statusStr?.toLowerCase() || '';

    if (
      s.includes('draft') ||
      s === 'i'
    ) {
      return 'i';
    }

    if (
      s.includes('submit') ||
      s === 's'
    ) {
      return 's';
    }

    if (
      s.includes('approve') ||
      s === 'a'
    ) {
      return 'a';
    }

    if (
      s.includes('reject') ||
      s === 'r'
    ) {
      return 'r';
    }

    return 'i';

  }

}