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
    { key: 'pending', label: 'Pending' },     // Drafts
    { key: 'submitted', label: 'Submitted' }, // Pending Approval
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' }
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
        // Initial Load
        this.loadByStatus();
    });

    // 2. Subscribe to stream updates (Real-time updates)
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
    this.router.navigate([], { relativeTo: this.route, queryParams: { tab: tab }, queryParamsHandling: 'merge' });
  }

  private loadByStatus(): void {
    this.transactionService.refreshTransactions().subscribe(); 
  }

  // --- FILTERING ---

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
      const displayId = (tx.channelReference || tx.tnxId || '').toLowerCase();
      const benName = this.getBeneficiary(tx).toLowerCase();
      const appName = this.getApplicant(tx).toLowerCase();
      const cur = this.getCurrency(tx).toLowerCase();
      const issuerRef = this.getIssuerRef(tx).toLowerCase();
      const product = this.getProduct(tx).toLowerCase();

      const matchesSearch =
        !query ||
        displayId.includes(query) ||
        issuerRef.includes(query) ||
        benName.includes(query) ||
        appName.includes(query) ||
        product.includes(query) ||
        cur.includes(query);

      const matchesCurrency = !currency || cur === currency;

      return matchesSearch && matchesCurrency;
    });

    this.applySorting(temp);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currencyFilter = '';
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

      // Numeric Sort
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return this.sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }

  // --- DATA HELPERS (The Fix for "Missing Data") ---
  // These helpers check multiple locations for the data
  
  getApplicant(tx: UndertakingTransaction): string {
    return tx.formData?.applicantBeneficiary?.applicantName || (tx as any).applicantName || '';
  }

  getBeneficiary(tx: UndertakingTransaction): string {
    return tx.formData?.applicantBeneficiary?.beneficiaryName || (tx as any).beneficiaryName || '';
  }

  getProduct(tx: UndertakingTransaction): string {
    return tx.formData?.generalDetails?.productType || (tx as any).productType || 'Undertaking';
  }

  getIssuerRef(tx: UndertakingTransaction): string {
    return tx.formData?.bankForm?.issuerReference || (tx as any).issuerReference || '-';
  }

  getCurrency(tx: UndertakingTransaction): string {
    return tx.formData?.undertakingDetails?.currency || (tx as any).currency || 'USD';
  }

  getAmount(tx: UndertakingTransaction): number {
    // Priority: Nested Form Data -> Root 'undertakingAmount' -> Root 'amount'
    const nested = tx.formData?.undertakingDetails?.undertakingAmount;
    if (nested !== null && nested !== undefined) return nested;
    
    const rootUnd = (tx as any).undertakingAmount;
    if (rootUnd !== null && rootUnd !== undefined) return rootUnd;

    const rootAmt = (tx as any).amount; // Handles the mismatch in list API
    if (rootAmt !== null && rootAmt !== undefined) return rootAmt;

    return 0;
  }
  
  getExpiryDate(tx: UndertakingTransaction): any {
     return tx.formData?.undertakingDetails?.expiryDate || (tx as any).expiryDate || null;
  }

  private resolveColumn(tx: UndertakingTransaction, column: string): any {
    switch (column) {
      case 'channelReference': return tx.channelReference; 
      case 'lastUpdated': return new Date(tx.lastUpdated);
      case 'product': return this.getProduct(tx);
      case 'issuerRef': return this.getIssuerRef(tx);
      case 'expiryDate': return this.getExpiryDate(tx) ? new Date(this.getExpiryDate(tx)) : null;
      case 'currency': return this.getCurrency(tx);
      case 'amount': return this.getAmount(tx);
      case 'applicant': return this.getApplicant(tx);
      case 'beneficiary': return this.getBeneficiary(tx);
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
    const statusChar = this.mapBackendStatusToChar(tx.status);

    if (statusChar === 'i') {
        // Edit Mode
        this.router.navigate(['/undertaking-issuance/request-undertaking'], {
            queryParams: { transactionId: tx.id }
        });
    } else {
        // View Mode
        this.router.navigate(['/undertaking-issuance/preview'], {
            queryParams: { transactionId: tx.id }
        });
    }
  }

  viewOnly(tx: UndertakingTransaction) {
      this.router.navigate(['/undertaking-issuance/preview'], {
          queryParams: { transactionId: tx.id }
      });
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
    return 'i'; 
  }
}