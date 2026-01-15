import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser, DecimalPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// SERVICES
import { UndertakingIssuanceService, UndertakingTransaction } from '../../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';

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
  
  // State
  allTransactions: UndertakingTransaction[] = [];
  filteredTransactions: UndertakingTransaction[] = [];
  
  // Filters
  searchQuery = '';
  currencyFilter = '';
  activeTab = 'pending';
  showAdvanced = false;

  // Tabs Configuration
  tabs = [
    { key: 'pending', label: 'Pending' },     // Drafts (Input)
    { key: 'submitted', label: 'Submitted' }, // Checker (Approve/Reject)
    { key: 'approved', label: 'Approved' },   // Final (View Only)
    { key: 'rejected', label: 'Rejected' }    // Correction (Edit)
  ];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  // Sorting
  sortColumn: string = 'lastUpdated';
  sortDirection: 'desc' | 'asc' = 'desc';

  private isBrowser: boolean;

  constructor(
    private transactionService: UndertakingIssuanceService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    // 1. Check URL for tab preference
    this.route.queryParams.subscribe(params => {
        if(params['tab']) {
            this.activeTab = params['tab'];
        }
        // Initial Load (Backend Filtered)
        this.loadByStatus();
    });

    // 2. Subscribe to stream updates (Real-time updates)
    this.transactionService.transactionsStream$.subscribe(txList => {
      this.allTransactions = txList; 
      // Filter ONLY by search/sort locally (Status is done by backend)
      this.filterBySearchOnly(); 
    });
  }

  // --- DATA LOADING ---

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.currentPage = 1;
    // URL change triggers ngOnInit subscription -> loadByStatus()
    this.router.navigate([], { relativeTo: this.route, queryParams: { tab: tab }, queryParamsHandling: 'merge' });
  }

private loadByStatus(): void {
    this.transactionService.refreshTransactions(this.activeTab).subscribe(txList => {
        this.allTransactions = txList;
        this.filterBySearchOnly();
    });
}
  // --- FILTERING ---

  applyFilters(): void {
    this.currentPage = 1;
    this.filterBySearchOnly();
  }

  // UPDATED: Renamed and removed status filtering logic
  private filterBySearchOnly(): void {
    const query = this.searchQuery.toLowerCase().trim();
    const currency = this.currencyFilter.toLowerCase().trim();

    // 1. Start with all records (They are already filtered by status from backend)
    let temp = [...this.allTransactions];

    // 2. Filter by Search Query
    temp = temp.filter(tx => {
      const data = tx.formData || {}; 
      const benName = data.applicantBeneficiary?.beneficiaryName || '';
      const appName = data.applicantBeneficiary?.applicantName || '';
      const cur = data.undertakingDetails?.currency || '';
      const issuerRef = data.bankForm?.issuerReference || '';
      
      // Use channelReference for display ID search
      const displayId = tx.channelReference || ''; 

      const matchesSearch =
        !query ||
        displayId.toLowerCase().includes(query) ||
        issuerRef.toLowerCase().includes(query) ||
        benName.toLowerCase().includes(query) ||
        appName.toLowerCase().includes(query) ||
        cur.toLowerCase().includes(query);

      const matchesCurrency = !currency || cur.toLowerCase() === currency;

      return matchesSearch && matchesCurrency;
    });

    this.applySorting(temp);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  // --- SORTING ---

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  private applySorting(source: UndertakingTransaction[]): void {
    this.filteredTransactions = [...source].sort((a, b) => {
      const aVal = this.resolveColumn(a, this.sortColumn);
      const bVal = this.resolveColumn(b, this.sortColumn);

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (aVal instanceof Date && bVal instanceof Date) {
        return this.sortDirection === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      return this.sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }

  private resolveColumn(tx: UndertakingTransaction, column: string): any {
    const data = tx.formData || {};
    switch (column) {
      case 'channelReference': return tx.channelReference; 
      case 'lastUpdated': return new Date(tx.lastUpdated);
      case 'currency': return data.undertakingDetails?.currency;
      case 'amount': return data.undertakingDetails?.undertakingAmount;
      default: return null;
    }
  }

  // --- PAGINATION ---

  get totalPages(): number {
    return Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
  }

  get pagedTransactions(): UndertakingTransaction[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTransactions.slice(start, start + this.itemsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  // --- NAVIGATION ACTIONS ---

  isDraft(tx: UndertakingTransaction): boolean {
    return this.mapBackendStatusToChar(tx.status) === 'i';
  }

  openUndertaking(tx: UndertakingTransaction) {
    this.router.navigate(['/undertaking-issuance/request-undertaking'], {
        queryParams: { transactionId: tx.id }
    });
  }

  viewOnly(tx: UndertakingTransaction) {
      this.router.navigate(['/undertaking-issuance/preview'], {
          queryParams: { 
            transactionId: tx.id,
            mode: 'view' 
          }
      });
  }

  trackByTnxId(_: number, tx: UndertakingTransaction): string | number {
    return tx.id;
  }

  // --- STATUS MAPPERS ---
  // (Note: `mapTabToBackendStatus` is no longer used for filtering but kept if needed for reference, 
  // or you can safely remove it. `mapBackendStatusToChar` is still used by `isDraft`)

  private mapBackendStatusToChar(statusStr: string): string {
    const s = statusStr?.toLowerCase() || '';
    if (s.includes('draft') || s === 'i') return 'i';
    if (s.includes('submit') || s === 's') return 's';
    if (s.includes('approve') || s === 'a') return 'a';
    if (s.includes('reject') || s === 'r') return 'r';
    return 'i'; 
  }
}