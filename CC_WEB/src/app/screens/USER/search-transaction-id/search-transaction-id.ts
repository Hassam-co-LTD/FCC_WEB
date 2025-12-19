import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SharedService, TransactionBase } from '../../../core/services/user-service/shared-form-service/shared-service';

@Component({
  selector: 'app-search-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './search-transaction-id.html',
  styleUrls: ['./search-transaction-id.scss']
})
export class SearchTransactionID implements OnInit {
  // Data
  allTransactions: TransactionBase[] = [];
  filteredTransactions: TransactionBase[] = [];
  pagedTransactions: TransactionBase[] = [];

  // Search & Filter
  searchQuery = '';
  showAdvancedSearch = false;
  hasActiveFilters = false;
  
  filters = {
    channelReference: '',
    customerReference: '',
    bankReference: '',
    status: '',
    type: '',
    fromDate: '',
    toDate: '',
    currency: '',
    minAmount: null as number | null,
    maxAmount: null as number | null
  };

  // Tabs
  activeTab: string = 'all';
  tabs = [
    { id: 'all', name: 'All Transactions' },
    { id: 'undertaking', name: 'Undertaking' },
    { id: 'export-collection', name: 'Export Collection' },
    { id: 'shipping-guarantee', name: 'Shipping Guarantee' },
    { id: 'draft', name: 'Drafts' },
    { id: 'pending', name: 'Pending Approval' },
    { id: 'live', name: 'Live' },
    { id: 'closed', name: 'Closed' }
  ];

  // Sort
  sortColumn: keyof TransactionBase | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  itemsPerPage = 10;
  currentPage = 1;
  totalPages = 1;

  // Status colors mapping
  statusColors: { [key: string]: string } = {
    'Draft': 'draft',
    'Pending Approval': 'pending',
    'Pending at Bank': 'warning',
    'Live': 'success',
    'Rejected': 'error',
    'Closed': 'closed',
    'Submitted': 'info'
  };

  constructor(private sharedService: SharedService) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.sharedService.transactions$.subscribe(transactions => {
      this.allTransactions = transactions;
      this.applyAll();
    });
  }

  loadTransactions(): void {
    this.allTransactions = this.sharedService.getAllTransactions();
    this.applyAll();
  }

  // Search and Filter Methods
  onSearch(): void {
    this.applyAll();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.resetFilters();
    this.applyAll();
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  applyAdvancedFilters(): void {
    this.hasActiveFilters = true;
    this.applyAll();
  }

  resetFilters(): void {
    this.filters = {
      channelReference: '',
      customerReference: '',
      bankReference: '',
      status: '',
      type: '',
      fromDate: '',
      toDate: '',
      currency: '',
      minAmount: null,
      maxAmount: null
    };
    this.hasActiveFilters = false;
  }

  // Main filtering pipeline
  applyAll(): void {
    let data = [...this.allTransactions];

    // Tab filtering
    if (this.activeTab !== 'all') {
      data = data.filter(t => this.matchTab(t, this.activeTab));
    }

    // Text search
    if (this.searchQuery.trim()) {
      const term = this.searchQuery.toLowerCase();
      data = data.filter(t =>
        t.channelReference?.toLowerCase().includes(term) ||
        t.customerReference?.toLowerCase().includes(term) ||
        t.bankReference?.toLowerCase().includes(term) ||
        t.beneficiary?.toLowerCase().includes(term) ||
        t.id?.toLowerCase().includes(term)
      );
    }

    // Advanced filters
    data = data.filter(t => {
      if (this.filters.channelReference && !t.channelReference?.includes(this.filters.channelReference)) return false;
      if (this.filters.customerReference && !t.customerReference?.includes(this.filters.customerReference)) return false;
      if (this.filters.bankReference && !t.bankReference?.includes(this.filters.bankReference)) return false;
      if (this.filters.status && t.status !== this.filters.status) return false;
      if (this.filters.type && t.type !== this.filters.type) return false;
      if (this.filters.currency && t.currency !== this.filters.currency) return false;

      if (this.filters.fromDate) {
        const fromDate = new Date(this.filters.fromDate);
        const issueDate = new Date(t.issueDate);
        if (issueDate < fromDate) return false;
      }

      if (this.filters.toDate) {
        const toDate = new Date(this.filters.toDate);
        const issueDate = new Date(t.issueDate);
        if (issueDate > toDate) return false;
      }

      if (this.filters.minAmount !== null && t.amount < this.filters.minAmount) return false;
      if (this.filters.maxAmount !== null && t.amount > this.filters.maxAmount) return false;

      return true;
    });

    // Sorting
    if (this.sortColumn) {
      data.sort((a, b) => {
        const aVal = a[this.sortColumn as keyof TransactionBase];
        const bVal = b[this.sortColumn as keyof TransactionBase];
        
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return this.sortDirection === 'asc' ? -1 : 1;
        if (bVal == null) return this.sortDirection === 'asc' ? 1 : -1;
        
        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.filteredTransactions = data;
    this.applyPagination();
  }

  // Tab matching logic
  matchTab(transaction: TransactionBase, tab: string): boolean {
    switch (tab) {
      case 'undertaking':
        return transaction.type === 'undertaking';
      case 'export-collection':
        return transaction.type === 'export-collection';
      case 'shipping-guarantee':
        return transaction.type === 'shipping-guarantee';
      case 'draft':
        return transaction.status === 'Draft';
      case 'pending':
        return transaction.status === 'Pending Approval' || transaction.status === 'Pending at Bank';
      case 'live':
        return transaction.status === 'Live';
      case 'closed':
        return transaction.status === 'Closed' || transaction.status === 'Rejected';
      default:
        return true;
    }
  }

  // Tab count
  getTabCount(tabId: string): number {
    if (tabId === 'all') return this.allTransactions.length;
    return this.allTransactions.filter(t => this.matchTab(t, tabId)).length;
  }

  // Sorting
  sortBy(column: keyof TransactionBase): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyAll();
  }

  // Pagination
  applyPagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredTransactions.length / this.itemsPerPage));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    this.pagedTransactions = this.filteredTransactions.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyPagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
    }
  }

  // Status helpers
  getStatusClass(status: string): string {
    return this.statusColors[status] || 'default';
  }

  getTransactionTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'undertaking': 'description',
      'export-collection': 'import_export',
      'shipping-guarantee': 'local_shipping'
    };
    return icons[type] || 'receipt';
  }

  // Action methods
  canOpenTransaction(t: TransactionBase): boolean {
    return !!(t.canEdit || t.canView);
  }

  getTransactionButtonText(t: TransactionBase): string {
    return t.canEdit ? 'Edit' : 'View';
  }

  canAcceptTransaction(t: TransactionBase): boolean {
    return t.status === 'Pending Approval' || t.status === 'Pending at Bank';
  }

  canRejectTransaction(t: TransactionBase): boolean {
    return this.canAcceptTransaction(t);
  }

  viewTransaction(t: TransactionBase): void {
    console.log('Opening transaction:', t);
    // Navigate to appropriate view/edit page based on type
    // Example: this.router.navigate([`/${t.type}`, t.id]);
  }

  acceptTransaction(t: TransactionBase): void {
    if (confirm(`Accept transaction ${t.channelReference}?`)) {
      this.sharedService.updateTransaction(t.id, { 
        status: 'Live',
        canEdit: false,
        canView: true 
      });
    }
  }

  rejectTransaction(t: TransactionBase): void {
    if (confirm(`Reject transaction ${t.channelReference}?`)) {
      this.sharedService.updateTransaction(t.id, { 
        status: 'Rejected',
        canEdit: false,
        canView: true 
      });
    }
  }

  deleteTransaction(t: TransactionBase): void {
    if (confirm(`Delete transaction ${t.channelReference}?`)) {
      this.sharedService.deleteTransaction(t.id);
    }
  }

  // Utility methods
  formatDate(date: Date): string {
    return date ? new Date(date).toLocaleDateString('en-GB') : 'N/A';
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  }
}