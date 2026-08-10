import { Component, PLATFORM_ID, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser, DatePipe, TitleCasePipe } from '@angular/common';
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
    DatePipe,
    TitleCasePipe
  ],
  templateUrl: './inquiries-records.html',
  styleUrls: ['./inquiries-records.scss']
})
export class inquiriesRecords implements OnInit {
  currentPage = 1;
  itemsPerPage = 10;
  // State
  allTransactions: UndertakingGuarantee[] = [];
  filteredTransactions: UndertakingGuarantee[] = [];

  // Filters
  showAdvanced = false;
  searchQuery = '';
  currencyFilter = '';
  activeTab = 'pending';

  // Tabs Configuration
  tabs = [
    { key: 'live', label: 'Live' },
    { key: 'pending', label: 'Pending' },     // Drafts (Input)
    { key: 'submitted', label: 'Submitted' }, // Checker (Approve/Reject)
    { key: 'approved', label: 'Approved' },   // Final (View Only)
    { key: 'rejected', label: 'Rejected' }    // Correction (Edit)
  ];

  // Sorting
  sortColumn: keyof UndertakingGuarantee | 'currency' | 'amount' | 'expiryDate' | 'createdOn' = 'createdOn';
  sortDirection: 'asc' | 'desc' = 'desc';

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    private api: ApiService,
    private transactionService: UndertakingIssuanceService,
    private router: Router,
    private route: ActivatedRoute,

  ) { }

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
      this.loadTransactions();
    });

    this.transactionService.transactionsStream$.subscribe(txList => {
      this.allTransactions = txList;
      this.applyFilters();
    }
    );
  }

  private loadTransactions(): void {
    if (this.activeTab === 'live') {

      this.api.getUtgLiveEventHistory().subscribe({
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

    const backendStatus = this.mapTabToBackendStatus(this.activeTab);

    this.api.getUndertakingRecordTransactionsByStatus(backendStatus).subscribe({
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

  // --- FILTERING ---

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

  setActiveTab(tab: string): void {
    if (this.activeTab === tab) {
      return;
    }

    this.activeTab = tab;
    this.currentPage = 1;

    this.loadTransactions();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  sortBy(column: typeof this.sortColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
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


  get totalPages(): number {
    const count = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
    return count < 1 ? 1 : count;
  }

  get pagedTransactions(): UndertakingGuarantee[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTransactions.slice(start, start + this.itemsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  viewTransaction(tx: UndertakingGuarantee): void {
    const readOnly = ['A', 'R'].includes(tx.status!);

    this.api.getUndertakingByTnxId(tx.tnxId!).subscribe({
      next: (freshTx) => {
        this.transactionService.setCurrentTransaction(freshTx, readOnly);
        this.router.navigate(['/dashboard/Trade-Services/undertaking-issuance/preview']);
      },
      error: () => {
        this.transactionService.setCurrentTransaction(tx, readOnly);
        this.router.navigate(['/dashboard/Trade-Services/undertaking-issuance/preview']);
      }
    });
  }


  openUtg(tx: UndertakingGuarantee) {
    if (this.activeTab === 'live') {
      // Live tab rows are event records — navigate by eventRefNo
      this.router.navigate(
        ['/dashboard/Trade-Services/undertaking-issuance/amend', tx.tnxId],
        {
          queryParams: {
            mode: 'READ_ONLY',
            tab: 'live',
            eventRefNo: tx.eventRefNo ?? ''
          }
        }
      );
      return;
    }
    // Store transaction in service for import screen to pick up
    // this.transactionService.setCurrentTransaction(tx);
    const mode = this.resolveScreenMode(this.activeTab);
    // Navigate to import screen
    this.router.navigate(['/dashboard/Trade-Services/undertaking-issuance', tx.tnxId], {
      state: {
        transaction: tx,
        // showUpdateSubmit: true // flag to show buttons
        mode: mode
      }
    });
  }

  trackByTnxId(_: number, tx: UndertakingGuarantee): string {
    return tx.eventRefNo ?? tx.tnxId!;
  }

  private resolveScreenMode(tab: string): 'EDIT' | 'APPROVAL' | 'READ_ONLY' {
    switch (tab) {
      case 'pending':
        return 'EDIT';
      case 'submitted':
        return 'APPROVAL';
      default:
        return 'READ_ONLY';
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