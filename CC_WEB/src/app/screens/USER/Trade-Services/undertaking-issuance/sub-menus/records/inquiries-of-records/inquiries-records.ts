import {
  Component,
  PLATFORM_ID,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser,
  DatePipe,
  TitleCasePipe
} from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

// SERVICES
import { UndertakingIssuanceService } from '../../../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';

import { UndertakingGuarantee } from '../../../../../../../core/models/undertaking-lc';

import { ApiService } from '../../../../../../../core/services/api.service';

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

  currentPage = 1;
  itemsPerPage = 10;

  // =========================================================
  // TRANSACTIONS
  // =========================================================

  allTransactions: UndertakingGuarantee[] = [];
  filteredTransactions: UndertakingGuarantee[] = [];

  // =========================================================
  // FILTERS
  // =========================================================

  showAdvanced = false;
  searchQuery = '';
  currencyFilter = '';

  activeTab = 'pending';
  showAdvanced = false;

  // =========================
  // TABS
  // =========================

  // =========================================================
  // TABS
  // =========================================================

  tabs = [
    { key: 'live', label: 'Live' },
    { key: 'pending', label: 'Pending' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' }
  ];

  // =========================================================
  // SORTING
  // =========================================================

  sortColumn:
    | keyof UndertakingGuarantee
    | 'currency'
    | 'amount'
    | 'expiryDate'
    | 'createdOn' = 'createdOn';

  sortDirection: 'asc' | 'desc' = 'desc';

  // =========================================================
  // PLATFORM
  // =========================================================

  private readonly platformId = inject(PLATFORM_ID);

  private readonly isBrowser =
    isPlatformBrowser(this.platformId);

  // =========================================================
  // PERMISSIONS
  // =========================================================

  permissionNames: string[] = [];

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private transactionService: UndertakingIssuanceService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    if (!this.isBrowser) {
      return;
    }

    // =======================================================
    // LOAD PERMISSIONS
    // =======================================================

    const sessionData = JSON.parse(
      sessionStorage.getItem('userData') || '{}'
    );

    this.permissionNames =
      sessionData.permissionNames || [];

    console.log(
      'UTG Inquiry Permission Names:',
      this.permissionNames
    );

    // =======================================================
    // ROUTE / TAB
    // =======================================================

    this.route.queryParamMap.subscribe(params => {

      const tab = params.get('tab');

      if (
        tab &&
        this.tabs.some(t => t.key === tab)
      ) {
        this.activeTab = tab;
      }

      this.currentPage = 1;

      this.loadTransactions();
    });

    // =======================================================
    // TRANSACTION STREAM
    // =======================================================

    this.transactionService.transactionsStream$
      .subscribe(txList => {

        this.allTransactions = txList;

        this.applyFilters();

      });
  }

  // =========================================================
  // PERMISSION CHECK
  // =========================================================

  hasPermission(permission: string): boolean {

    return this.permissionNames.some(
      p =>
        p?.trim().toLowerCase() ===
        permission.trim().toLowerCase()
    );
  }

  // =========================================================
  // TAB PERMISSION
  // =========================================================

  canAccessTab(tab: string): boolean {

    switch (tab) {

      case 'live':
        return this.hasPermission('UTG_Inquiry');

      case 'pending':
        return this.hasPermission('UTG_Amend');

      case 'submitted':
        return this.hasPermission('UTG_Approve');

      case 'approved':
        return this.hasPermission('UTG_Inquiry');

      case 'rejected':
        return this.hasPermission('UTG_Amend');

      default:
        return false;
    }
  }

  // =========================================================
  // LOAD TRANSACTIONS
  // =========================================================

  private loadTransactions(): void {

    // =======================================================
    // LIVE
    // =======================================================

    if (this.activeTab === 'live') {

      if (!this.hasPermission('UTG_Inquiry')) {

        console.warn(
          'User does not have UTG_Inquiry permission'
        );

        this.allTransactions = [];
        this.filteredTransactions = [];

        return;
      }

      this.api.getUtgLiveEventHistory().subscribe({

        next: txList => {

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

    // =======================================================
    // OTHER TABS
    // =======================================================

    if (!this.canAccessTab(this.activeTab)) {

      console.warn(
        `User does not have permission for ${this.activeTab} tab`
      );

      this.allTransactions = [];
      this.filteredTransactions = [];

      return;
    }

    const backendStatus =
      this.mapTabToBackendStatus(this.activeTab);

    this.api
      .getUndertakingRecordTransactionsByStatus(
        backendStatus
      )
      .subscribe({

        next: txList => {

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
  // FILTERING
  // =========================================================

  applyFilters(): void {

    const query =
      this.searchQuery.toLowerCase().trim();

    const currency =
      this.currencyFilter.toLowerCase().trim();

    const filtered =
      this.allTransactions.filter(tx => {

        const matchesSearch =
          !query ||
          tx.tnxId?.toLowerCase().includes(query) ||
          tx.beneficiaryName?.toLowerCase().includes(query) ||
          tx.currency?.toLowerCase().includes(query);

        const matchesCurrency =
          !currency ||
          tx.currency?.toLowerCase() === currency;

        return (
          matchesSearch &&
          matchesCurrency
        );
      });

    this.applySorting(filtered);
  }

  // =========================================================
  // CHANGE TAB
  // =========================================================

  setActiveTab(tab: string): void {

    // Permission check
    if (!this.canAccessTab(tab)) {

      console.warn(
        `User does not have permission to access ${tab}`
      );

      return;
    }

    if (this.activeTab === tab) {
      return;
    }

    this.activeTab = tab;

    this.currentPage = 1;

    this.loadTransactions();

    // Keep URL synchronized with tab
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        tab: tab
      },
      queryParamsHandling: 'merge'
    });
  }

  // =========================================================
  // CLEAR SEARCH
  // =========================================================

  clearSearch(): void {

    this.searchQuery = '';

    this.applyFilters();

  }

  // =========================
  // SORTING
  // =========================

  // =========================================================
  // SORT
  // =========================================================

  sortBy(
    column: typeof this.sortColumn
  ): void {

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

  // =========================================================
  // APPLY SORTING
  // =========================================================

  private applySorting(
    source: UndertakingGuarantee[] =
      this.allTransactions
  ): void {

    const sorted =
      [...source].sort((a, b) => {

        const aVal =
          this.resolveColumn(
            a,
            this.sortColumn
          );

        const bVal =
          this.resolveColumn(
            b,
            this.sortColumn
          );

        // Null / undefined
        if (aVal == null) {
          return 1;
        }

        if (bVal == null) {
          return -1;
        }

        // Dates
        if (
          aVal instanceof Date &&
          bVal instanceof Date
        ) {

          return this.sortDirection === 'asc'
            ? aVal.getTime() -
                bVal.getTime()
            : bVal.getTime() -
                aVal.getTime();
        }

        // Numbers
        if (
          typeof aVal === 'number' &&
          typeof bVal === 'number'
        ) {

          return this.sortDirection === 'asc'
            ? aVal - bVal
            : bVal - aVal;
        }

        // Strings
        const aStr = String(aVal);
        const bStr = String(bVal);

        return this.sortDirection === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });

    this.filteredTransactions = sorted;

    this.currentPage = 1;
  }

  // =========================================================
  // RESOLVE SORT COLUMN
  // =========================================================

  private resolveColumn(
    tx: UndertakingGuarantee,
    column: string
  ): any {

    switch (column) {

      case 'tnxId':
        return tx.tnxId;

      case 'currency':
        return tx.currency;

      case 'undertakingAmount':
        return tx.undertakingAmount;

      case 'expiryDate':
        return tx.expiryDate;

      case 'createdOn':
        return tx.createdOn;

      default:
        return null;
    }
  }

  // =========================================================
  // PAGINATION
  // =========================================================

  get totalPages(): number {

    const count =
      Math.ceil(
        this.filteredTransactions.length /
        this.itemsPerPage
      );

    return count < 1 ? 1 : count;

  }

  get pagedTransactions(): UndertakingGuarantee[] {

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

  // =========================================================
  // VIEW TRANSACTION
  // =========================================================

  viewTransaction(
    tx: UndertakingGuarantee
  ): void {

    // =======================================================
    // VIEW PERMISSION
    // =======================================================

    if (!this.hasPermission('UTG_Inquiry')) {

      console.warn(
        'User does not have UTG_Inquiry permission'
      );

      return;
    }

    const readOnly =
      ['A', 'R'].includes(
        tx.status!
      );

    this.api
      .getUndertakingByTnxId(
        tx.tnxId!
      )
      .subscribe({

        next: freshTx => {

          this.transactionService
            .setCurrentTransaction(
              freshTx,
              readOnly
            );

          this.router.navigate([
            '/dashboard/Trade-Services/undertaking-issuance/preview'
          ]);
        },

        error: () => {

          this.transactionService
            .setCurrentTransaction(
              tx,
              readOnly
            );

          this.router.navigate([
            '/dashboard/Trade-Services/undertaking-issuance/preview'
          ]);
        }
      });
  }

  // =========================================================
  // OPEN UTG
  // =========================================================

  openUtg(
    tx: UndertakingGuarantee
  ): void {

    // =======================================================
    // LIVE
    // =======================================================

    if (this.activeTab === 'live') {

      if (!this.hasPermission('UTG_Inquiry')) {

        console.warn(
          'User does not have UTG_Inquiry permission'
        );

        return;
      }

      this.router.navigate(
        [
          '/dashboard/Trade-Services/undertaking-issuance/amend',
          tx.tnxId
        ],
        {
          queryParams: {
            transactionId: identifier,
            mode: 'READ_ONLY',
            tab: 'live',
            eventRefNo:
              tx.eventRefNo ?? ''
          }
        }
      );

      return;
    }

    // =======================================================
    // PENDING
    // =======================================================

    if (this.activeTab === 'pending') {

      if (!this.hasPermission('UTG_Amend')) {

        console.warn(
          'User does not have UTG_Amend permission'
        );

        return;
      }
    }

    // =======================================================
    // SUBMITTED
    // =======================================================

    if (this.activeTab === 'submitted') {

      if (!this.hasPermission('UTG_Approve')) {

        console.warn(
          'User does not have UTG_Approve permission'
        );

        return;
      }
    }

    // =======================================================
    // REJECTED
    // =======================================================

    if (this.activeTab === 'rejected') {

      if (!this.hasPermission('UTG_Amend')) {

        console.warn(
          'User does not have UTG_Amend permission'
        );

        return;
      }
    }

    // =======================================================
    // APPROVED
    // =======================================================

    if (this.activeTab === 'approved') {

      if (!this.hasPermission('UTG_Inquiry')) {

        console.warn(
          'User does not have UTG_Inquiry permission'
        );

        return;
      }
    }

    // =======================================================
    // SCREEN MODE
    // =======================================================

    const mode =
      this.resolveScreenMode(
        this.activeTab
      );

    this.router.navigate(
      [
        '/dashboard/Trade-Services/undertaking-issuance',
        tx.tnxId
      ],
      {
        state: {
          transaction: tx,
          mode: mode
        }
      }
    );
  }

  // =========================================================
  // TRACK BY
  // =========================================================

  trackByTnxId(
    _: number,
    tx: UndertakingGuarantee
  ): string {

    return (
      tx.eventRefNo ??
      tx.tnxId!
    );
  }

  // =========================================================
  // SCREEN MODE
  // =========================================================

  private resolveScreenMode(
    tab: string
  ): 'EDIT' | 'APPROVAL' | 'READ_ONLY' {

    switch (tab) {

      case 'pending':
        return 'EDIT';

      case 'submitted':
        return 'APPROVAL';

      case 'rejected':
        return 'EDIT';

      default:
        return 'READ_ONLY';
    }
  }

  // =========================================================
  // BACKEND STATUS
  // =========================================================

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
}