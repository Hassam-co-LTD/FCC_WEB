import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../../../../../../../core/services/api.service';

import { UndertakingGuarantee } from '../../../../../../../core/models/undertaking-lc';

import { UndertakingIssuanceService } from '../../../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';

@Component({
  selector: 'app-approved-inquiry-records',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './approved-inquiry-records.html',
  styleUrls: ['./approved-inquiry-records.scss']
})
export class ApprovedInquiryRecords {

  // =========================================================
  // PAGINATION
  // =========================================================

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
  activeTab = 'live';

  // =========================================================
  // PERMISSIONS
  // =========================================================

  permissionNames: string[] = [];

  /**
   * Checks whether the logged-in user has the requested permission.
   *
   * Example:
   * hasPermission('UTG_Inquiry')
   * hasPermission('UTG_Amend')
   */
  hasPermission(permission: string): boolean {

    return this.permissionNames.some(
      p =>
        p.trim().toLowerCase() ===
        permission.trim().toLowerCase()
    );

  }

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

  sortColumn: keyof UndertakingGuarantee = 'createdOn';

  sortDirection: 'asc' | 'desc' = 'desc';

  // =========================================================
  // PLATFORM
  // =========================================================

  private readonly platformId = inject(PLATFORM_ID);

  private readonly isBrowser =
    isPlatformBrowser(this.platformId);

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private transactionService: UndertakingIssuanceService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {

    if (!this.isBrowser) {
      return;
    }

    // =======================================================
    // LOAD USER PERMISSIONS
    // =======================================================

    const storedPermissions =
      sessionStorage.getItem('permissionNames');

    if (storedPermissions) {

      try {

        this.permissionNames =
          JSON.parse(storedPermissions);

      } catch {

        this.permissionNames = [];

      }

    }

    console.log(
      'Undertaking Amendment Permissions:',
      this.permissionNames
    );

    // =======================================================
    // LOAD TAB FROM URL
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

      this.loadApprovedTransactions();

    });

  }

  // =========================================================
  // LOAD TRANSACTIONS
  // =========================================================

  private loadApprovedTransactions(): void {

    // -------------------------------------------------------
    // DO NOT LOAD ANY DATA IF USER DOES NOT HAVE INQUIRY
    // -------------------------------------------------------

    if (!this.hasPermission('UTG_Inquiry')) {

      this.allTransactions = [];

      this.filteredTransactions = [];

      return;

    }

    // -------------------------------------------------------
    // LIVE
    // -------------------------------------------------------

    if (this.activeTab === 'live') {

      this.api.getApprovedUtgMasterLcRecords().subscribe({

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

    // -------------------------------------------------------
    // STATUS RECORDS
    // -------------------------------------------------------

    const backend =
      this.mapTabToBackendStatus(
        this.activeTab
      );

    this.api.getUtgAmendRecordsByStatus(backend).subscribe({

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

  get pagedTransactions(): UndertakingGuarantee[] {

    const start =
      (this.currentPage - 1) *
      this.itemsPerPage;

    return this.filteredTransactions.slice(
      start,
      start + this.itemsPerPage
    );

  }

  get totalPages(): number {

    const count =
      Math.ceil(
        this.filteredTransactions.length /
        this.itemsPerPage
      );

    return count < 1
      ? 1
      : count;

  }

  // =========================================================
  // FILTERING
  // =========================================================

  applyFilters(): void {

    const query =
      this.searchQuery
        .toLowerCase()
        .trim();

    const currency =
      this.currencyFilter
        .toLowerCase()
        .trim();

    const filtered =
      this.allTransactions.filter(tx => {

        const matchesSearch =
          !query ||
          tx.tnxId
            ?.toLowerCase()
            .includes(query) ||
          tx.beneficiaryName
            ?.toLowerCase()
            .includes(query) ||
          tx.currency
            ?.toLowerCase()
            .includes(query);

        const matchesCurrency =
          !currency ||
          tx.currency
            ?.toLowerCase() === currency;

        return (
          matchesSearch &&
          matchesCurrency
        );

      });

    this.applySorting(filtered);

  }

  // =========================================================
  // CLEAR SEARCH
  // =========================================================

  clearSearch(): void {

    this.searchQuery = '';

    this.applyFilters();

  }

  // =========================================================
  // TAB SWITCHING
  // =========================================================

  setActiveTab(tab: string): void {

    // -------------------------------------------------------
    // INQUIRY PERMISSION CHECK
    // -------------------------------------------------------

    if (!this.hasPermission('UTG_Inquiry')) {
      return;
    }

    if (this.activeTab === tab) {
      return;
    }

    this.activeTab = tab;

    this.currentPage = 1;

    this.loadApprovedTransactions();

  }

  // =========================================================
  // SORTING
  // =========================================================

  toggleSort(
    column: keyof UndertakingGuarantee
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

    this.applySort();

  }

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
            ? aVal.getTime() -
              bVal.getTime()
            : bVal.getTime() -
              aVal.getTime();

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

  private applySort(): void {

    const dir =
      this.sortDirection === 'asc'
        ? 1
        : -1;

    this.filteredTransactions.sort(
      (a, b) => {

        const va: any =
          a[this.sortColumn] ?? '';

        const vb: any =
          b[this.sortColumn] ?? '';

        if (va < vb) {
          return -1 * dir;
        }

        if (va > vb) {
          return 1 * dir;
        }

        return 0;

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

    return tx.tnxId!;

  }

  // =========================================================
  // VIEW TRANSACTION
  // =========================================================

  viewTransaction(
    tx: UndertakingGuarantee
  ): void {

    // -------------------------------------------------------
    // INQUIRY PERMISSION
    // -------------------------------------------------------

    if (!this.hasPermission('UTG_Inquiry')) {
      return;
    }

    const readOnly =
      ['A', 'R'].includes(
        tx.status!
      );

    this.api
      .getUtgAmendmentByTnxId(
        tx.tnxId!
      )
      .subscribe({

        next: (freshTx) => {

          this.transactionService
            .setCurrentTransaction(
              freshTx,
              readOnly
            );

          this.router.navigate([
            '/dashboard/Trade-Services/undertaking-issuance/amend/preview'
          ]);

        },

        error: () => {

          this.transactionService
            .setCurrentTransaction(
              tx,
              readOnly
            );

          this.router.navigate([
            '/dashboard/Trade-Services/undertaking-issuance/amend/preview'
          ]);

        }

      });

  }

  // =========================================================
  // OPEN AMEND TRANSACTION
  // =========================================================

  openApprovedAmendTransaction(
    tx: UndertakingGuarantee
  ): void {

    // -------------------------------------------------------
    // AMEND PERMISSION
    // -------------------------------------------------------

    if (!this.hasPermission('UTG_Amend')) {
      return;
    }

    this.router.navigate(

      [
        '/dashboard/Trade-Services/undertaking-issuance/amend',
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
            eventRefNo:
              tx.eventRefNo ?? ''
          })

        }

      }

    );

  }

  // =========================================================
  // PAGINATION CONTROLS
  // =========================================================

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
  // BACKEND STATUS MAPPER
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