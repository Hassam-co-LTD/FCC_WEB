// import { Component, inject, Inject, PLATFORM_ID } from '@angular/core';
// import { CommonModule, isPlatformBrowser } from '@angular/common';
// import { MatIconModule } from '@angular/material/icon';
// import { FormsModule } from '@angular/forms';
// import { Router, ActivatedRoute } from '@angular/router';
// import { ExportCollectionTransaction } from '../../../../../../../core/models/export-collection';
// import { ApiService } from '../../../../../../../core/services/api.service';
// import { ExportCollectionFormTransactionService } from '../../../../../../../core/services/user-service/export-collection-form-transaction-service/export-collection-form-transaction';
// @Component({
//   selector: 'app-approved-inquiry-records',
//   imports: [CommonModule, MatIconModule, FormsModule],
//   templateUrl: './approved-inquiry-records.html',
//   styleUrls: ['./approved-inquiry-records.scss'],
// })
// export class ApprovedInquiryRecords {
//   currentPage = 1;
//   itemsPerPage = 10;
//   allTransactions: ExportCollectionTransaction[] = [];
//   filteredTransactions: ExportCollectionTransaction[] = [];
//   showAdvanced = false;
//   searchQuery = '';
//   currencyFilter = '';
//   activeTab = 'live';
//   tabs = [
//     { key: 'live', label: 'Live' },
//     { key: 'pending', label: 'Pending' },
//     { key: 'submitted', label: 'Submitted' },
//     { key: 'approved', label: 'Approved' },
//     { key: 'rejected', label: 'Rejected' },
//     // { key: 'response awaited', label: 'Response Awaited'}
//   ];
//   sortColumn: keyof ExportCollectionTransaction = 'createdOn';
//   sortDirection: 'asc' | 'desc' = 'desc';

//   private readonly platformId = inject(PLATFORM_ID);
//   private readonly isBrowser = isPlatformBrowser(this.platformId);

//   constructor(
//     private api: ApiService,
//     private transactionService: ExportCollectionFormTransactionService,
//     private router: Router,
//     private route: ActivatedRoute,
//   ) {}
//   /*
// ngOnInit(): void {
//   if (!this.isBrowser) return;

//   this.loadApprovedTransactions();

//   this.transactionService.transactionsStream$.subscribe(txList => {
//     this.allTransactions = txList;
//     this.applyFilters();
//   });
// }*/

//   ngOnInit(): void {
//     if (!this.isBrowser) return;

//     this.route.queryParamMap.subscribe((params) => {
//       const tab = params.get('tab');
//       if (tab && this.tabs.some((t) => t.key === tab)) {
//         this.activeTab = tab;
//       }
//       this.loadApprovedTransactions();
//     });

//     this.transactionService.transactionsStream$.subscribe((txList) => {
//       this.allTransactions = txList;
//       this.applyFilters();
//     });
//   }

//   private loadApprovedTransactions(): void {
//     if (this.activeTab === 'live') {
//       this.api.getApprovedMasterLcRecordsExportCollection().subscribe({
//         next: (txList) => {
//           this.allTransactions = txList;
//           this.applyFilters();
//           // this.filteredTransactions = [...txList];
//         },
//         error: () => {
//           this.allTransactions = [];
//           this.filteredTransactions = [];
//         },
//       });

//       return;
//     }
//     const backend = this.mapTabToBackendStatus(this.activeTab);
//     this.api
//       .getAmendRecordTransactionsByStatusExportCollection(backend)
//       .subscribe({
//         next: (txList) => {
//           this.allTransactions = txList;
//           // this.filteredTransactions = [...this.allTransactions];
//           // this.currentPage = 1;
//           this.applyFilters();
//         },
//         error: () => {
//           this.allTransactions = [];
//           this.filteredTransactions = [];
//         },
//       });
//   }

//   get pagedTransactions(): ExportCollectionTransaction[] {
//     const start = (this.currentPage - 1) * this.itemsPerPage;
//     return this.filteredTransactions.slice(start, start + this.itemsPerPage);
//   }

//   get totalPages(): number {
//     const count = Math.ceil(
//       this.filteredTransactions.length / this.itemsPerPage,
//     );
//     return count < 1 ? 1 : count;
//   }
//   applyFilters(): void {
//     const query = this.searchQuery.toLowerCase().trim();
//     const currency = this.currencyFilter.toLowerCase().trim();

//     const filtered = this.allTransactions.filter((tx) => {
//       const matchesSearch =
//         !query ||
//         tx.tnxId?.toLowerCase().includes(query) ||
//         tx.currency?.toLowerCase().includes(query);

//       const matchesCurrency =
//         !currency || tx.currency?.toLowerCase() === currency;

//       return matchesSearch && matchesCurrency;
//     });

//     this.applySorting(filtered);
//   }

//   private applySorting(
//     source: ExportCollectionTransaction[] = this.allTransactions,
//   ): void {
//     const sorted = [...source].sort((a, b) => {
//       let aVal = this.resolveColumn(a, this.sortColumn);
//       let bVal = this.resolveColumn(b, this.sortColumn);

//       // Handle null or undefined
//       if (aVal == null) return 1;
//       if (bVal == null) return -1;

//       // Handle Dates
//       if (aVal instanceof Date && bVal instanceof Date) {
//         return this.sortDirection === 'asc'
//           ? aVal.getTime() - bVal.getTime()
//           : bVal.getTime() - aVal.getTime();
//       }

//       // Handle numbers
//       if (typeof aVal === 'number' && typeof bVal === 'number') {
//         return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
//       }

//       // Everything else: convert to string and use localeCompare
//       const aStr = String(aVal);
//       const bStr = String(bVal);
//       return this.sortDirection === 'asc'
//         ? aStr.localeCompare(bStr)
//         : bStr.localeCompare(aStr);
//     });

//     this.filteredTransactions = sorted;
//     this.currentPage = 1;
//   }

//   private resolveColumn(tx: ExportCollectionTransaction, column: string): any {
//     switch (column) {
//       case 'tnxId':
//         return tx.tnxId;
//       case 'currency':
//         return tx.currency;
//       case 'amount':
//         return tx.amount;
//       case 'createdOn':
//         return tx.createdOn;
//       default:
//         return null;
//     }
//   }
//   clearSearch(): void {
//     this.searchQuery = '';
//     this.applyFilters();
//   }
//   setActiveTab(tab: string): void {
//     if (this.activeTab === tab) {
//       return;
//     }

//     this.activeTab = tab;
//     this.currentPage = 1;

//     this.loadApprovedTransactions();
//   }

//   // simple sorting helper
//   toggleSort(column: keyof ExportCollectionTransaction): void {
//     if (this.sortColumn === column) {
//       this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
//     } else {
//       this.sortColumn = column;
//       this.sortDirection = 'asc';
//     }
//     this.applySort();
//   }

//   private applySort(): void {
//     const dir = this.sortDirection === 'asc' ? 1 : -1;
//     this.filteredTransactions.sort((a, b) => {
//       const va: any = a[this.sortColumn] ?? '';
//       const vb: any = b[this.sortColumn] ?? '';
//       if (va < vb) return -1 * dir;
//       if (va > vb) return 1 * dir;
//       return 0;
//     });
//   }

//   trackByTnxId(_: number, tx: ExportCollectionTransaction): string {
//     return tx.tnxId!;
//   }

//   viewTransaction(tx: ExportCollectionTransaction): void {
//     const readOnly = ['A', 'R'].includes(tx.status!);

//     this.api.getAmendmentByTnxIdExportCollection(tx.tnxId!).subscribe({
//       next: (freshTx) => {
//         this.transactionService.setCurrentTransaction(freshTx, readOnly);
//         this.router.navigate([
//           'dashboard/Trade-Services/export-collection/amend/preview',
//         ]);
//       },
//       error: () => {
//         this.transactionService.setCurrentTransaction(tx, readOnly);
//         this.router.navigate([
//           'dashboard/Trade-Services/export-collection/amend/preview',
//         ]);
//       },
//     });
//   }

//   openApprovedAmendTransaction(tx: ExportCollectionTransaction): void {
//     this.router.navigate(
//       ['dashboard/Trade-Services/export-collection/amend', tx.tnxId],
//       {
//         queryParams: {
//           mode: 'EDIT',
//           tab: this.activeTab,
//           eventType:
//             this.activeTab === 'live' ? 'AMD' : (tx.eventType ?? 'AMD'),
//           // Only pass eventRefNo for non-live tabs (for navigating to a specific event)
//           ...(this.activeTab !== 'live' && { eventRefNo: tx.eventRefNo ?? '' }),
//         },
//       },
//     );
//   }
//   previousPage(): void {
//     if (this.currentPage > 1) this.currentPage--;
//   }

//   nextPage(): void {
//     if (this.currentPage < this.totalPages) this.currentPage++;
//   }

//   private mapTabToBackendStatus(tab: string): string {
//     switch (tab) {
//       case 'pending':
//         return 'i';
//       case 'submitted':
//         return 's';
//       case 'approved':
//         return 'a';
//       case 'rejected':
//         return 'r';
//       default:
//         return 'i';
//     }
//   }
// }
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ExportCollectionTransaction } from '../../../../../../../core/models/export-collection';
import { ApiService } from '../../../../../../../core/services/api.service';
import { ExportCollectionFormTransactionService } from '../../../../../../../core/services/user-service/export-collection-form-transaction-service/export-collection-form-transaction';

@Component({
  selector: 'app-approved-inquiry-records',
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './approved-inquiry-records.html',
  styleUrls: ['./approved-inquiry-records.scss'],
})
export class ApprovedInquiryRecords {
  currentPage = 1;
  itemsPerPage = 10;

  allTransactions: ExportCollectionTransaction[] = [];
  filteredTransactions: ExportCollectionTransaction[] = [];

  showAdvanced = false;
  searchQuery = '';
  currencyFilter = '';

  activeTab = 'live';

  // =========================================================
  // PERMISSIONS
  // =========================================================

  permissionNames: string[] = [];

  tabs = [
    { key: 'live', label: 'Live', permission: 'Inquiry' },
    { key: 'pending', label: 'Pending', permission: 'Inquiry' },
    { key: 'submitted', label: 'Submitted', permission: 'Inquiry' },
    { key: 'approved', label: 'Approved', permission: 'Inquiry' },
    { key: 'rejected', label: 'Rejected', permission: 'Inquiry' },
  ];

  sortColumn: keyof ExportCollectionTransaction = 'createdOn';
  sortDirection: 'asc' | 'desc' = 'desc';

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    private api: ApiService,
    private transactionService: ExportCollectionFormTransactionService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.loadPermissions();

    this.route.queryParamMap.subscribe((params) => {
      const tab = params.get('tab');

      if (
        tab &&
        this.tabs.some((t) => t.key === tab && this.hasPermission(t.permission))
      ) {
        this.activeTab = tab;
      }

      this.loadApprovedTransactions();
    });

    this.transactionService.transactionsStream$.subscribe((txList) => {
      this.allTransactions = txList;
      this.applyFilters();
    });
  }

  // =========================================================
  // PERMISSION HELPER
  // =========================================================

  private loadPermissions(): void {
    const stored = sessionStorage.getItem('permissionNames');

    if (!stored) {
      this.permissionNames = [];
      return;
    }

    try {
      this.permissionNames = JSON.parse(stored).map((p: string) =>
        p.trim().toLowerCase(),
      );
    } catch {
      this.permissionNames = [];
    }

    console.log('Export Collection Permissions:', this.permissionNames);
  }

  hasPermission(permission: string): boolean {
    return this.permissionNames.includes(permission.toLowerCase());
  }

  // =========================================================
  // LOAD RECORDS
  // =========================================================

  private loadApprovedTransactions(): void {
    if (this.activeTab === 'live') {
      this.api.getApprovedMasterLcRecordsExportCollection().subscribe({
        next: (txList) => {
          this.allTransactions = txList;
          this.applyFilters();
        },
        error: () => {
          this.allTransactions = [];
          this.filteredTransactions = [];
        },
      });

      return;
    }

    const backend = this.mapTabToBackendStatus(this.activeTab);

    this.api
      .getAmendRecordTransactionsByStatusExportCollection(backend)
      .subscribe({
        next: (txList) => {
          this.allTransactions = txList;
          this.applyFilters();
        },
        error: () => {
          this.allTransactions = [];
          this.filteredTransactions = [];
        },
      });
  }

  // =========================================================
  // PAGINATION
  // =========================================================

  get pagedTransactions(): ExportCollectionTransaction[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTransactions.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredTransactions.length / this.itemsPerPage),
    );
  }

  // =========================================================
  // FILTER
  // =========================================================

  applyFilters(): void {
    const query = this.searchQuery.toLowerCase().trim();
    const currency = this.currencyFilter.toLowerCase().trim();

    const filtered = this.allTransactions.filter((tx) => {
      const matchesSearch =
        !query ||
        tx.tnxId?.toLowerCase().includes(query) ||
        tx.currency?.toLowerCase().includes(query);

      const matchesCurrency =
        !currency || tx.currency?.toLowerCase() === currency;

      return matchesSearch && matchesCurrency;
    });

    this.applySorting(filtered);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  // =========================================================
  // SORT
  // =========================================================

  private applySorting(
    source: ExportCollectionTransaction[] = this.allTransactions,
  ): void {
    this.filteredTransactions = [...source].sort((a, b) => {
      const aVal = this.resolveColumn(a, this.sortColumn);
      const bVal = this.resolveColumn(b, this.sortColumn);

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const result = String(aVal).localeCompare(String(bVal));

      return this.sortDirection === 'asc' ? result : -result;
    });

    this.currentPage = 1;
  }

  private resolveColumn(tx: ExportCollectionTransaction, column: string): any {
    switch (column) {
      case 'tnxId':
        return tx.tnxId;
      case 'currency':
        return tx.currency;
      case 'amount':
        return tx.amount;
      case 'createdOn':
        return tx.createdOn;
      default:
        return null;
    }
  }

  toggleSort(column: keyof ExportCollectionTransaction): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applySorting(this.filteredTransactions);
  }

  // =========================================================
  // TABS
  // =========================================================

  setActiveTab(tab: string): void {
    const selectedTab = this.tabs.find((t) => t.key === tab);

    if (!selectedTab || !this.hasPermission(selectedTab.permission)) {
      console.warn('Permission denied for tab:', tab);
      return;
    }

    if (this.activeTab === tab) return;

    this.activeTab = tab;
    this.currentPage = 1;

    this.loadApprovedTransactions();
  }

  // =========================================================
  // TRANSACTION ACTIONS
  // =========================================================

  trackByTnxId(_: number, tx: ExportCollectionTransaction): string {
    return tx.tnxId!;
  }

  viewTransaction(tx: ExportCollectionTransaction): void {
    if (!this.hasPermission('EC_Inquiry')) {
      console.warn('Inquiry permission denied');
      return;
    }

    const readOnly = ['A', 'R'].includes(tx.status!);

    this.api.getAmendmentByTnxIdExportCollection(tx.tnxId!).subscribe({
      next: (freshTx) => {
        this.transactionService.setCurrentTransaction(freshTx, readOnly);

        this.router.navigate([
          'dashboard/Trade-Services/export-collection/amend/preview',
        ]);
      },

      error: () => {
        this.transactionService.setCurrentTransaction(tx, readOnly);

        this.router.navigate([
          'dashboard/Trade-Services/export-collection/amend/preview',
        ]);
      },
    });
  }

  openApprovedAmendTransaction(tx: ExportCollectionTransaction): void {
    if (!this.hasPermission('EC_Amend')) {
      console.warn('Amend permission denied');
      return;
    }

    this.router.navigate(
      ['dashboard/Trade-Services/export-collection/amend', tx.tnxId],
      {
        queryParams: {
          mode: 'EDIT',
          tab: this.activeTab,
          eventType:
            this.activeTab === 'live' ? 'AMD' : (tx.eventType ?? 'AMD'),

          ...(this.activeTab !== 'live' && {
            eventRefNo: tx.eventRefNo ?? '',
          }),
        },
      },
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