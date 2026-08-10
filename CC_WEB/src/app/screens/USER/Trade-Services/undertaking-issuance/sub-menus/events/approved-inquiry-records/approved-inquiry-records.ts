import { Component, inject, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportLcTransaction } from '../../../../../../../core/models/import-lc';
import { ApiService } from "../../../../../../../core/services/api.service";
import { ImportlcFormTransactionService } from '../../../../../../../core/services/user-service/importlc-form-transaction-service/importlc-form-transaction-service';
import { UndertakingGuarantee } from '../../../../../../../core/models/undertaking-lc';
import { UndertakingIssuanceService } from '../../../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';

@Component({
  selector: 'app-approved-inquiry-records',
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './approved-inquiry-records.html',
  styleUrls: ['./approved-inquiry-records.scss'],
})
export class ApprovedInquiryRecords {
  currentPage = 1;
  itemsPerPage = 10;
  allTransactions: UndertakingGuarantee[] = [];
  filteredTransactions: UndertakingGuarantee[] = [];
  showAdvanced = false;
  searchQuery = '';
  currencyFilter = '';
  activeTab = 'live';
  tabs = [
    { key: 'live', label: 'Live' },
    { key: 'pending', label: 'Pending' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    // { key: 'response awaited', label: 'Response Awaited'}
  ];
  sortColumn: keyof UndertakingGuarantee = 'createdOn';
  sortDirection: 'asc' | 'desc' = 'desc';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  constructor(
    private api: ApiService,
    private transactionService: UndertakingIssuanceService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}


  ngOnInit(): void {
    if (!this.isBrowser) return;
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
  private loadApprovedTransactions(): void {
    if (this.activeTab === 'live') {

      this.api.getApprovedUtgMasterLcRecords().subscribe({
        next: (txList) => {
          this.allTransactions = txList;
          this.applyFilters();
          // this.filteredTransactions = [...txList];
        },
        error: () => {
          this.allTransactions = [];
          this.filteredTransactions = [];
        }
      });

      return;
    }
    const backend =  this.mapTabToBackendStatus(this.activeTab)
    this.api.getUtgAmendRecordsByStatus(backend).subscribe({
      next: (txList) => {
        this.allTransactions = txList;
        // this.filteredTransactions = [...this.allTransactions];
        // this.currentPage = 1;
        this.applyFilters();
      },
      error: () => {
        this.allTransactions = [];
        this.filteredTransactions = [];
      }
    });
  }

  get pagedTransactions(): UndertakingGuarantee[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTransactions.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    const count = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
    return count < 1 ? 1 : count;
  }
  applyFilters(): void {
    const query = this.searchQuery.toLowerCase().trim();
    const currency = this.currencyFilter.toLowerCase().trim();

    const filtered = this.allTransactions.filter(tx => {

      const matchesSearch =
        !query ||
        tx.tnxId?.toLowerCase().includes(query) ||
        tx.beneficiaryName?.toLowerCase().includes(query) ||
        tx.currency?.toLowerCase().includes(query);

      const matchesCurrency =
        !currency || tx.currency?.toLowerCase() === currency;

      return matchesSearch && matchesCurrency;
    });

    this.applySorting(filtered);
  }

  private applySorting(source: UndertakingGuarantee[] = this.allTransactions): void {
    const sorted = [...source].sort((a, b) => {
      let aVal = this.resolveColumn(a, this.sortColumn);
      let bVal = this.resolveColumn(b, this.sortColumn);

      // Handle null or undefined
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Handle Dates
      if (aVal instanceof Date && bVal instanceof Date) {
        return this.sortDirection === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      // Handle numbers
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return this.sortDirection === 'asc'
          ? aVal - bVal
          : bVal - aVal;
      }

      // Everything else: convert to string and use localeCompare
      const aStr = String(aVal);
      const bStr = String(bVal);
      return this.sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    this.filteredTransactions = sorted;
    this.currentPage = 1;
  }

  private resolveColumn(tx: UndertakingGuarantee, column: string): any {
    switch (column) {
      case 'tnxId': return tx.tnxId;
      case 'currency': return tx.currency;
      case 'undertakingAmount': return tx.undertakingAmount;
      case 'expiryDate': return tx.expiryDate;
      case 'createdOn': return tx.createdOn;
      default: return null;
    }
  }
  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }
  setActiveTab(tab: string): void {
    if (this.activeTab === tab) {
      return;
    }

    this.activeTab = tab;
    this.currentPage = 1;

    this.loadApprovedTransactions();
  }

  // simple sorting helper
  toggleSort(column: keyof UndertakingGuarantee): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  private applySort(): void {
    const dir = this.sortDirection === 'asc' ? 1 : -1;
    this.filteredTransactions.sort((a, b) => {
      const va: any = a[this.sortColumn] ?? '';
      const vb: any = b[this.sortColumn] ?? '';
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }

  trackByTnxId(_: number, tx: UndertakingGuarantee): string {
    return tx.tnxId!;
  }


  viewTransaction(tx: UndertakingGuarantee): void {
    const readOnly = ['A', 'R'].includes(tx.status!);

    this.api.getUtgAmendmentByTnxId(tx.tnxId!).subscribe({
      next: (freshTx) => {
        this.transactionService.setCurrentTransaction(freshTx, readOnly);
        this.router.navigate(['/dashboard/Trade-Services/undertaking-issuance/amend/preview']);
      },
      error: () => {
        this.transactionService.setCurrentTransaction(tx, readOnly);
        this.router.navigate(['/dashboard/Trade-Services/undertaking-issuance/amend/preview']);
      }
    });
  }

  openApprovedAmendTransaction(tx: UndertakingGuarantee): void {
    // Navigate to import screen
    this.router.navigate(
      ['/dashboard/Trade-Services/undertaking-issuance/amend', tx.tnxId],
      {
        queryParams: {
          mode: 'EDIT',
          tab: this.activeTab,
          eventType: this.activeTab === 'live' ? 'AMD' : (tx.eventType ?? 'AMD'),
          // Only pass eventRefNo for non-live tabs (for navigating to a specific event)
          ...(this.activeTab !== 'live' && { eventRefNo: tx.eventRefNo ?? '' })
        }
      }
    );
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
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