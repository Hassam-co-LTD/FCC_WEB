import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser, DecimalPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
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
    { key: 'pending', label: 'Pending' }, // Drafts
    { key: 'submitted', label: 'Submitted' }, // Pending Approval
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' }
  ];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  // Sorting
  sortColumn: keyof UndertakingTransaction | string = 'lastUpdated';
  sortDirection: 'asc' | 'desc' = 'desc';

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

    // 1. Check URL for tab preference (e.g. coming back from Save)
    this.route.queryParams.subscribe(params => {
        if(params['tab']) {
            this.activeTab = params['tab'];
        }
        // Initial Load
        this.loadByStatus();
    });

    // 2. Subscribe to stream updates (Real-time update on Save/Approve)
    this.transactionService.transactionsStream$.subscribe(txList => {
      this.allTransactions = txList; 
      this.filterByStatusAndSearch(); 
    });
  }

  // --- DATA LOADING ---

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadByStatus();
    
    // Update URL without reloading to reflect current tab
    this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: tab },
        queryParamsHandling: 'merge'
    });
  }

  private loadByStatus(): void {
    // Calling refresh triggers the API and updates the stream
    this.transactionService.refreshTransactions().subscribe(); 
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.filterByStatusAndSearch();
  }

  private filterByStatusAndSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    const currency = this.currencyFilter.toLowerCase().trim();
    const targetStatusChar = this.mapTabToBackendStatus(this.activeTab);

    // 1. Filter by Status
    let temp = this.allTransactions.filter(tx => {
        const txStatusChar = this.mapBackendStatusToChar(tx.status); 
        return txStatusChar === targetStatusChar;
    });

    // 2. Filter by Search Query
    temp = temp.filter(tx => {
      const data = tx.formData || {}; 
      const benName = data.applicantBeneficiary?.beneficiaryName || '';
      const appName = data.applicantBeneficiary?.applicantName || '';
      const cur = data.undertakingDetails?.currency || '';
      const ref = tx.channelReference || '';
      const issuerRef = data.bankForm?.issuerReference || '';

      const matchesSearch =
        !query ||
        ref.toLowerCase().includes(query) ||
        issuerRef.toLowerCase().includes(query) ||
        benName.toLowerCase().includes(query) ||
        appName.toLowerCase().includes(query) ||
        cur.toLowerCase().includes(query);

      const matchesCurrency =
        !currency || cur.toLowerCase() === currency;

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
    const sorted = [...source].sort((a, b) => {
      const aVal = this.resolveColumn(a, this.sortColumn as string);
      const bVal = this.resolveColumn(b, this.sortColumn as string);

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

    this.filteredTransactions = sorted;
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

  // --- NAVIGATION ACTION ---

  isDraft(tx: UndertakingTransaction): boolean {
    return this.mapBackendStatusToChar(tx.status) === 'i';
  }

  openUndertaking(tx: UndertakingTransaction) {
    const statusChar = this.mapBackendStatusToChar(tx.status);

    if (statusChar === 'i') {
        // CASE 1: DRAFT ('i') -> Go to Edit Form
        this.router.navigate(['/undertaking-issuance/request-undertaking'], {
            queryParams: { transactionId: tx.id }
        });
    } else {
        // CASE 2: SUBMITTED/APPROVED/REJECTED -> Go to Preview (View/Approve/Reject)
        this.router.navigate(['/undertaking-issuance/preview'], {
            queryParams: { transactionId: tx.id }
        });
    }
  }
  
  // HTML alias for backward compatibility if needed
  viewTransaction(tx: UndertakingTransaction) {
      this.openUndertaking(tx);
  }

  trackByTnxId(_: number, tx: UndertakingTransaction): string | number {
    return tx.id;
  }

  // --- STATUS MAPPERS ---

  private mapTabToBackendStatus(tab: string): string {
    switch (tab) {
      case 'pending': return 'i'; 
      case 'submitted': return 's';
      case 'approved': return 'a';
      case 'rejected': return 'r';
      default: return 'i';
    }
  }

  private mapBackendStatusToChar(statusStr: string): string {
    const s = statusStr?.toLowerCase() || '';
    if (s.includes('draft') || s === 'i') return 'i';
    if (s.includes('submit') || s === 's') return 's';
    if (s.includes('approve') || s === 'a') return 'a';
    if (s.includes('reject') || s === 'r') return 'r';
    return 'i'; // Fallback to draft if unknown
  }
}