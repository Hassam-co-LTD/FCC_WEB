import { Component, inject, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ImportLcTransaction } from '../../../../../../../core/models/import-lc';
import { ApiService } from "../../../../../../../core/services/api.service";
import { ImportlcFormTransactionService } from '../../../../../../../core/services/user-service/importlc-form-transaction-service/importlc-form-transaction-service';

@Component({
  selector: 'app-approved-inquiry-records',
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './approved-inquiry-records.html',
  styleUrls: ['./approved-inquiry-records.scss'],
})
export class ApprovedInquiryRecords {

  currentPage = 1;
  itemsPerPage = 10;

  allTransactions: ImportLcTransaction[] = [];
  filteredTransactions: ImportLcTransaction[] = [];

  showAdvanced = false;
  searchQuery = '';
  currencyFilter = '';
  activeTab = 'live';

  // =========================================================
  // PERMISSIONS
  // =========================================================

  permissionNames: string[] = [];

  hasPermission(permission: string): boolean {
    return this.permissionNames.some(
      p => p.trim().toLowerCase() === permission.toLowerCase()
    );
  }

  tabs = [
    { key: 'live', label: 'Live' },
    { key: 'pending', label: 'Pending' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  sortColumn: keyof ImportLcTransaction = 'createdOn';
  sortDirection: 'asc' | 'desc' = 'desc';

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    private api: ApiService,
    private transactionService: ImportlcFormTransactionService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {

    if (!this.isBrowser) return;

    // =========================================================
    // LOAD USER PERMISSIONS
    // =========================================================

    const storedPermissions = sessionStorage.getItem('permissionNames');

    if (storedPermissions) {
      try {
        this.permissionNames = JSON.parse(storedPermissions);
      } catch {
        this.permissionNames = [];
      }
    }

    console.log('Import LC Permissions:', this.permissionNames);

    // =========================================================
    // LOAD TRANSACTIONS
    // =========================================================

    this.route.queryParamMap.subscribe(params => {

      const tab = params.get('tab');

      if (
        tab &&
        this.tabs.some(t => t.key === tab)
      ) {
        this.activeTab = tab;
      }

      this.currentPage = 1;
      this.loadApprovedTransactions();
    });

    this.transactionService.transactionsStream$.subscribe(txList => {
      this.allTransactions = txList;
      this.applyFilters();
    });
  }

  // =========================================================
  // LOAD APPROVED / AMENDMENT TRANSACTIONS
  // =========================================================

  private loadApprovedTransactions(): void {

    if (this.activeTab === 'live') {

      this.api.getApprovedMasterLcRecords().subscribe({

        next: (txList) => {
          this.allTransactions = txList;
          this.applyFilters();
        },

        error: () => {
          this.allTransactions = [];
          this.filteredTransactions = [];
        }

      });

      return;
    }

    const backend = this.mapTabToBackendStatus(this.activeTab);

    this.api.getAmendRecordTransactionsByStatus(backend).subscribe({

      next: (txList) => {
        this.allTransactions = txList;
        this.applyFilters();
      },

      error: () => {
        this.allTransactions = [];
        this.filteredTransactions = [];
      }

    });
  }

  // =========================================================
  // PAGINATION
  // =========================================================

  get pagedTransactions(): ImportLcTransaction[] {

    const start =
      (this.currentPage - 1) * this.itemsPerPage;

    return this.filteredTransactions.slice(
      start,
      start + this.itemsPerPage
    );
  }

  get totalPages(): number {

    const count = Math.ceil(
      this.filteredTransactions.length / this.itemsPerPage
    );

    return count < 1 ? 1 : count;
  }

  // =========================================================
  // FILTER
  // =========================================================

  applyFilters(): void {

    const query = this.searchQuery.toLowerCase().trim();
    const currency = this.currencyFilter.toLowerCase().trim();

    const filtered = this.allTransactions.filter(tx => {

      const matchesSearch =
        !query ||
        tx.tnxId?.toLowerCase().includes(query) ||
        tx.beneficiaryName?.toLowerCase().includes(query) ||
        tx.issuingBankName?.toLowerCase().includes(query) ||
        tx.currency?.toLowerCase().includes(query);

      const matchesCurrency =
        !currency ||
        tx.currency?.toLowerCase() === currency;

      return matchesSearch && matchesCurrency;
    });

    this.applySorting(filtered);
  }

  // =========================================================
  // SORTING
  // =========================================================

  private applySorting(
    source: ImportLcTransaction[] = this.allTransactions
  ): void {

    const sorted = [...source].sort((a, b) => {

      let aVal = this.resolveColumn(a, this.sortColumn);
      let bVal = this.resolveColumn(b, this.sortColumn);

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (aVal instanceof Date && bVal instanceof Date) {

        return this.sortDirection === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      if (
        typeof aVal === 'number' &&
        typeof bVal === 'number'
      ) {

        return this.sortDirection === 'asc'
          ? aVal - bVal
          : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);

      return this.sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    this.filteredTransactions = sorted;
    this.currentPage = 1;
  }

  private resolveColumn(
    tx: ImportLcTransaction,
    column: string
  ): any {

    switch (column) {

      case 'tnxId':
        return tx.tnxId;

      case 'currency':
        return tx.currency;

      case 'amount':
        return tx.amount;

      case 'expiryDate':
        return tx.expiryDate;

      case 'createdOn':
        return tx.createdOn;

      default:
        return null;
    }
  }

  // =========================================================
  // SEARCH
  // =========================================================

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  // =========================================================
  // TAB
  // =========================================================

  setActiveTab(tab: string): void {

    if (this.activeTab === tab) {
      return;
    }

    this.activeTab = tab;
    this.currentPage = 1;

  this.loadApprovedTransactions();
}

  // =========================================================
  // SORT BUTTON
  // =========================================================

  toggleSort(column: keyof ImportLcTransaction): void {

    if (this.sortColumn === column) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applySort();
  }

  private applySort(): void {

    const dir =
      this.sortDirection === 'asc'
        ? 1
        : -1;

    this.filteredTransactions.sort((a, b) => {

      const va: any = a[this.sortColumn] ?? '';
      const vb: any = b[this.sortColumn] ?? '';

      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;

      return 0;
    });
  }

  // =========================================================
  // TRACK BY
  // =========================================================

  trackByTnxId(
    _: number,
    tx: ImportLcTransaction
  ): string {

    return tx.tnxId!;
  }

  // =========================================================
  // VIEW - INQUIRY PERMISSION
  // =========================================================

  viewTransaction(tx: ImportLcTransaction): void {

    // User must have Import LC Inquiry permission
    if (!this.hasPermission('ILC_Inquiry')) {
      return;
    }

    const readOnly =
      ['A', 'R'].includes(tx.status!);

    this.api.getAmendmentByTnxId(tx.tnxId!).subscribe({

      next: (freshTx) => {

        this.transactionService.setCurrentTransaction(
          freshTx,
          readOnly
        );

        this.router.navigate([
          '/dashboard/Trade-Services/import-screen/amend/preview'
        ]);
      },

      error: () => {

        this.transactionService.setCurrentTransaction(
          tx,
          readOnly
        );

        this.router.navigate([
          '/dashboard/Trade-Services/import-screen/amend/preview'
        ]);
      }

    });
  }

  // =========================================================
  // OPEN AMENDMENT - AMEND PERMISSION
  // =========================================================

  openApprovedAmendTransaction(
    tx: ImportLcTransaction
  ): void {

    // User must have Import LC Amend permission
    if (!this.hasPermission('ILC_Amend')) {
      return;
    }

    this.router.navigate(
      [
        '/dashboard/Trade-Services/import-screen/amend',
        tx.tnxId
      ],
      {
        queryParams: {

          mode: 'EDIT',

          tab: this.activeTab,

          eventType:
            this.activeTab === 'live'
              ? 'AMD'
              : (tx.eventType ?? 'AMD'),

          ...(this.activeTab !== 'live' && {
            eventRefNo: tx.eventRefNo ?? ''
          })
        }
      }
    );
  }

  // =========================================================
  // PAGINATION
  // =========================================================

  previousPage(): void {

    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {

    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // =========================================================
  // BACKEND STATUS
  // =========================================================

  private mapTabToBackendStatus(tab: string): string {

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
}