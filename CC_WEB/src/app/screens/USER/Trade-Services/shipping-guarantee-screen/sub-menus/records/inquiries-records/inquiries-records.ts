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
import { ShippingGuaranteeTransaction } from '../../../../../../../core/models/shipping-guarantee';
import { ApiService } from '../../../../../../../core/services/api.service';
import { ShippingGuaranteeFormTransactionService } from '../../../../../../../core/services/user-service/shipping-guarantee-form-transaction-service/shipping-guarantee-form-transaction-service';

@Component({
  selector: 'app-inquiries-records',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    FormsModule,
    DatePipe,
    TitleCasePipe
  ],
  templateUrl: './inquiries-records.html',
  styleUrls: ['./inquiries-records.scss']
})
export class inquiriesRecords implements OnInit {

  // =========================================================
  // STATE
  // =========================================================

  allTransactions: ShippingGuaranteeTransaction[] = [];
  filteredTransactions: ShippingGuaranteeTransaction[] = [];

  searchQuery = '';
  currencyFilter = '';
  activeTab = 'pending';
  showAdvanced = false;

  // =========================================================
  // PERMISSIONS
  // =========================================================

  permissionNames: string[] = [];

  // =========================================================
  // TABS
  // =========================================================

  tabs = [
    {
      key: 'live',
      label: 'Live',
      permission: 'SG_InquiryLive'
    },
    {
      key: 'pending',
      label: 'Pending',
      permission: 'SG_InquiryPending'
    },
    {
      key: 'submitted',
      label: 'Submitted',
      permission: 'SG_InquirySubmit'
    },
    {
      key: 'approved',
      label: 'Approved',
      permission: 'SG_InquiryApprove'
    },
    {
      key: 'rejected',
      label: 'Rejected',
      permission: 'SG_InquiryReject'
    }
  ];

  // =========================================================
  // PAGINATION
  // =========================================================

  currentPage = 1;
  itemsPerPage = 10;

  // =========================================================
  // SORTING
  // =========================================================

  sortColumn:
    | keyof ShippingGuaranteeTransaction
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
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private api: ApiService,
    private transactionService:
      ShippingGuaranteeFormTransactionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // =========================================================
  // LOAD PERMISSIONS
  // =========================================================

  private loadPermissions(): void {

    const storedPermissions =
      sessionStorage.getItem('permissionNames');

    if (storedPermissions) {

      try {

        this.permissionNames =
          JSON.parse(storedPermissions);

        console.log(
          'Shipping Guarantee Permission Names:',
          this.permissionNames
        );

      } catch (error) {

        console.error(
          'Error parsing permissionNames:',
          error
        );

        this.permissionNames = [];
      }

    } else {

      console.warn(
        'permissionNames not found in sessionStorage'
      );

      this.permissionNames = [];
    }
  }

  // =========================================================
  // CHECK PERMISSION
  // =========================================================

  hasPermission(permission: string): boolean {

    return this.permissionNames.some(
      p =>
        p?.trim().toLowerCase() ===
        permission.trim().toLowerCase()
    );
  }

  // =========================================================
  // CHECK TAB PERMISSION
  // =========================================================

  canAccessTab(tab: string): boolean {

    const tabConfig =
      this.tabs.find(t => t.key === tab);

    if (!tabConfig) {
      return false;
    }

    return this.hasPermission(
      tabConfig.permission
    );
  }

  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {

    if (!this.isBrowser) {
      return;
    }

    // Load permissions FIRST
    this.loadPermissions();

    // -------------------------------------------------------
    // Check URL tab
    // -------------------------------------------------------

    this.route.queryParamMap.subscribe(params => {

      const requestedTab =
        params.get('tab');

      if (
        requestedTab &&
        this.canAccessTab(requestedTab)
      ) {

        this.activeTab = requestedTab;

      } else {

        // If requested tab is not allowed,
        // automatically select first permitted tab.

        const firstAllowedTab =
          this.tabs.find(tab =>
            this.hasPermission(tab.permission)
          );

        if (firstAllowedTab) {

          this.activeTab =
            firstAllowedTab.key;

        } else {

          console.warn(
            'User has no Shipping Guarantee inquiry permissions.'
          );

          this.activeTab = '';
        }
      }

      this.currentPage = 1;

      if (this.activeTab) {
        this.loadTransactions();
      }

    });

    // -------------------------------------------------------
    // Stream updates
    // -------------------------------------------------------

    this.transactionService
      .transactionsStream$
      .subscribe(txList => {

        this.allTransactions = txList;

        this.applyFilters();

      });
  }

  // =========================================================
  // LOAD TRANSACTIONS
  // =========================================================

  private loadTransactions(): void {

    // Security check before loading
    if (
      !this.activeTab ||
      !this.canAccessTab(this.activeTab)
    ) {

      console.warn(
        'No permission to load tab:',
        this.activeTab
      );

      this.allTransactions = [];
      this.filteredTransactions = [];

      return;
    }

    // -------------------------------------------------------
    // LIVE
    // -------------------------------------------------------

    if (this.activeTab === 'live') {

      this.api
        .getLiveEventHistorySg()
        .subscribe({

          next: txList => {

            this.allTransactions =
              txList;

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
    // PENDING / SUBMITTED / APPROVED / REJECTED
    // -------------------------------------------------------

    const backendStatus =
      this.mapTabToBackendStatus(
        this.activeTab
      );

    this.api
      .getRecordTransactionsByStatusSg(
        backendStatus
      )
      .subscribe({

        next: txList => {

          this.allTransactions =
            txList;

          this.applyFilters();

        },

        error: () => {

          this.allTransactions = [];
          this.filteredTransactions = [];

        }

      });
  }

  // =========================================================
  // CHANGE TAB
  // =========================================================

  setActiveTab(tab: string): void {

    // Permission check INSIDE the function
    if (!this.canAccessTab(tab)) {

      console.warn(
        'Permission denied for tab:',
        tab
      );

      return;
    }

    if (this.activeTab === tab) {
      return;
    }

    this.activeTab = tab;
    this.currentPage = 1;

    this.loadTransactions();
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
  // SORTING
  // =========================================================

  sortBy(
    column: typeof this.sortColumn
  ): void {

    if (
      this.sortColumn === column
    ) {

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
    source:
      ShippingGuaranteeTransaction[] =
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

        const aStr =
          String(aVal);

        const bStr =
          String(bVal);

        return this.sortDirection === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);

      });

    this.filteredTransactions =
      sorted;

    this.currentPage = 1;
  }

  private resolveColumn(
    tx: ShippingGuaranteeTransaction,
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

  get pagedTransactions():
    ShippingGuaranteeTransaction[] {

    const start =
      (this.currentPage - 1) *
      this.itemsPerPage;

    return this.filteredTransactions
      .slice(
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
  // Permission: View
  // =========================================================

  viewTransaction(
    tx: ShippingGuaranteeTransaction
  ): void {

    if (!this.hasPermission('SG_InquiryPreview')) {

      console.warn(
        'User does not have permission to view Shipping Guarantee.'
      );

      return;
    }

    const readOnly =
      ['A', 'R'].includes(
        tx.status!
      );

    this.api
      .getTransactionSgByTnxId(
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
            '/dashboard/Trade-Services/shipping-guarantee/preview'
          ]);

        },

        error: () => {

          this.transactionService
            .setCurrentTransaction(
              tx,
              readOnly
            );

          this.router.navigate([
            '/dashboard/Trade-Services/shipping-guarantee/preview'
          ]);

        }

      });
  }

  // =========================================================
  // OPEN SHIPPING GUARANTEE
  // Permission: View
  // =========================================================

  openShippingGuarantee(
    tx: ShippingGuaranteeTransaction
  ): void {

    if (!this.hasPermission('SG_InquiryPreview')) {

      console.warn(
        'User does not have permission to open Shipping Guarantee.'
      );

      return;
    }

    // -------------------------------------------------------
    // LIVE
    // -------------------------------------------------------

    if (this.activeTab === 'live') {

      if (!this.hasPermission('SG_InquiryLive')) {

        console.warn(
          'User does not have Live inquiry permission.'
        );

        return;
      }

      this.router.navigate(
        [
          '/dashboard/Trade-Services/shipping-guarantee/amend',
          tx.tnxId
        ],
        {
          queryParams: {
            mode: 'READ_ONLY',
            tab: 'live',
            eventRefNo:
              tx.eventRefNo ?? ''
          }
        }
      );

      return;
    }

    // -------------------------------------------------------
    // OTHER TABS
    // -------------------------------------------------------

    const mode =
      this.resolveScreenMode(
        this.activeTab
      );

    this.router.navigate(
      [
        '/dashboard/Trade-Services/shipping-guarantee',
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
    tx: ShippingGuaranteeTransaction
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