import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// SERVICES
import { UndertakingIssuanceService, UndertakingTransaction } from '../../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';

@Component({
  selector: 'app-inquiries-records',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './inquiries-records.html',
  styleUrls: ['./inquiries-records.scss'] // Assuming you share styles or have a similar scss
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
    { key: 'pending', label: 'Pending' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'response awaited', label: 'Response Awaited'}
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
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    // Load initial data based on default tab
    this.loadByStatus(this.activeTab);

    // Subscribe to stream updates
    this.transactionService.transactionsStream$.subscribe(txList => {
      this.allTransactions = txList; 
      
      // Re-apply local filters (Search/Tab logic)
      this.filterByStatusAndSearch(); 
    });
  }

  // --- DATA LOADING ---

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadByStatus(tab);
  }

  private loadByStatus(status: string): void {
    const backendStatus = this.mapTabToBackendStatus(status);
    
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

    let temp = this.allTransactions.filter(tx => {
        const txStatusChar = this.mapBackendStatusToChar(tx.status); 
        return txStatusChar === targetStatusChar;
    });

    // 2. Filter by Search Query
    temp = temp.filter(tx => {
      // access nested form data safely
      const data = tx.formData || {}; 
      const benName = data.applicantBeneficiary?.beneficiaryName || '';
      const appName = data.applicantBeneficiary?.applicantName || '';
      const cur = data.undertakingDetails?.currency || '';
      const ref = tx.channelReference || '';

      const matchesSearch =
        !query ||
        ref.toLowerCase().includes(query) ||
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
      case 'lastUpdated': return new Date(tx.lastUpdated); // Ensure date object
      case 'currency': return data.undertakingDetails?.currency;
      case 'amount': return data.undertakingDetails?.undertakingAmount;
      // Add more specific sorts if needed
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

  // --- ACTIONS ---

  viewTransaction(tx: UndertakingTransaction): void {
    // Navigate to a preview or read-only screen
    // this.transactionService.setCurrentTransaction(tx);
    this.router.navigate(['/undertaking-issuance/preview']);
  }

  openUndertaking(tx: UndertakingTransaction) {
    // 1. Store in service (optional, if your Form component reads from service state)
    // this.transactionService.setCurrentTransaction(tx);

    // 2. Navigate to the Request Form (using QueryParams as established in previous logic)
    this.router.navigate(['/undertaking-issuance/request'], {
      queryParams: { transactionId: tx.id }
    });
  }

  trackByTnxId(_: number, tx: UndertakingTransaction): string | number {
    return tx.id;
  }

  // --- STATUS MAPPERS ---

  private mapTabToBackendStatus(tab: string): string {
    switch (tab) {
      case 'pending': return 'i'; // or 'Draft'
      case 'submitted': return 's';
      case 'approved': return 'a';
      case 'rejected': return 'r';
      default: return 'i';
    }
  }

  private mapBackendStatusToChar(statusStr: string): string {
    // Helper to normalize backend status strings (e.g. "Draft" -> "i")
    // Adjust based on what your backend actually returns
    const s = statusStr?.toLowerCase() || '';
    if (s.includes('draft') || s === 'i') return 'i';
    if (s.includes('submit') || s === 's') return 's';
    if (s.includes('approve') || s === 'a') return 'a';
    if (s.includes('reject') || s === 'r') return 'r';
    return 'i';
  }
}