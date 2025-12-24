import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SharedService } from '../../../core/services/user-service/shared-form-service/shared-service';
import { UndertakingIssuanceService, UndertakingTransaction } from '../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';

@Component({
  selector: 'app-undertaking-issuance',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule],
  templateUrl: './undertaking-issuance.html',
  styleUrls: ['./undertaking-issuance.scss']
})
export class UndertakingIssuance implements OnInit {
  // Data
  allUndertakings: UndertakingTransaction[] = [];
  filteredUndertakings: UndertakingTransaction[] = [];
  pagedUndertakings: UndertakingTransaction[] = [];

  // Search & Filter
  searchQuery = '';
  showAdvancedSearch = false;
  hasActiveFilters = false;
  
  filters = {
    channelReference: '',
    customerReference: '',
    bankReference: '',
    status: '',
    fromDate: '',
    toDate: '',
    currency: '',
    minAmount: null as number | null,
    maxAmount: null as number | null,
    productType: '',
    applicantName: '',
    beneficiary: ''
  };

  // Tabs
  tabs = [
    { id: 'all', name: 'All Transactions', status: 'all' },
    { id: 'live', name: 'Live', status: 'Live' },
    { id: 'draft', name: 'Drafts', status: 'Draft' },
    { id: 'actions', name: 'Actions', status: 'actions' },
    { id: 'pendingApproval', name: 'Pending Approval', status: 'Pending Approval' },
    { id: 'pendingBank', name: 'Pending at Bank', status: 'Pending at Bank' },
    { id: 'submitted', name: 'Submitted', status: 'Submitted' },
    { id: 'rejected', name: 'Rejected', status: 'Rejected' },
    { id: 'closed', name: 'Closed', status: 'Closed' }
  ];
  
  activeTab: string = 'all';

  // Sort
  sortColumn: keyof UndertakingTransaction | '' = '';
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
    'Submitted': 'info',
    'Live': 'success',
    'Rejected': 'error',
    'Closed': 'closed'
  };

  constructor(
    private sharedService: SharedService,
    private undertakingService: UndertakingIssuanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUndertakings();
    this.sharedService.transactions$.subscribe(transactions => {
      // Filter only undertaking transactions
      this.allUndertakings = transactions
        .filter(t => t.type === 'undertaking')
        .map(t => t as UndertakingTransaction);
      this.applyAll();
    });
  }

  loadUndertakings(): void {
    // Get from undertaking service
    const undertakingTransactions = this.undertakingService.getAllTransactions();
    
    // Also get from shared service
    const sharedTransactions = this.sharedService.getAllTransactions()
      .filter(t => t.type === 'undertaking')
      .map(t => t as UndertakingTransaction);
    
    // Combine and remove duplicates
    const allTransactions = [...undertakingTransactions, ...sharedTransactions];
    const uniqueTransactions = this.removeDuplicates(allTransactions, 'id');
    
    this.allUndertakings = uniqueTransactions;
    this.applyAll();
  }

  private removeDuplicates(array: any[], key: string): any[] {
    return array.filter((item, index, self) =>
      index === self.findIndex((t) => t[key] === item[key])
    );
  }

  // ================= VIEW TRANSACTION =================
viewTransaction(t: UndertakingTransaction): void {
  // Determine mode based on transaction status
  const editableStatuses = ['Draft', 'Pending Approval', 'Pending at Bank'];
  const mode = editableStatuses.includes(t.status) ? 'edit' : 'view';
  const canUpdate = editableStatuses.includes(t.status);
  
  // Store transaction data with mode - use a consistent structure
  this.sharedService.setFormData({
    transaction: t,
    mode: mode,
    canUpdate: canUpdate,
    formData: t.formData || {},
    transactionId: t.id // Ensure this is included
  });
  
  console.log('View transaction:', t.id, 'Mode:', mode, 'Can update:', canUpdate);
  
  // Navigate with transaction ID - ensure this matches your route configuration
  this.router.navigate(['/undertaking-issuance/preview', t.id]);
}
  // ================= EXISTING METHODS (keep as is) =================
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
      fromDate: '',
      toDate: '',
      currency: '',
      minAmount: null,
      maxAmount: null,
      productType: '',
      applicantName: '',
      beneficiary: ''
    };
    this.hasActiveFilters = false;
  }

  // Main filtering pipeline
  applyAll(): void {
    let data = [...this.allUndertakings];

    // Tab filtering
    if (this.activeTab !== 'all') {
      data = data.filter(t => this.matchTab(t, this.activeTab));
    }

    // Text search
    if (this.searchQuery.trim()) {
      const term = this.searchQuery.toLowerCase();
      data = data.filter(t =>
        (t.channelReference?.toLowerCase().includes(term) || false) ||
        (t.customerReference?.toLowerCase().includes(term) || false) ||
        (t.bankReference?.toLowerCase().includes(term) || false) ||
        (t.beneficiary?.toLowerCase().includes(term) || false) ||
        (t.applicantName?.toLowerCase().includes(term) || false) ||
        (t.productType?.toLowerCase().includes(term) || false) ||
        (t.id?.toLowerCase().includes(term) || false)
      );
    }

    // Advanced filters
    data = data.filter(t => {
      if (this.filters.channelReference && !t.channelReference?.includes(this.filters.channelReference)) return false;
      if (this.filters.customerReference && !t.customerReference?.includes(this.filters.customerReference)) return false;
      if (this.filters.bankReference && !t.bankReference?.includes(this.filters.bankReference)) return false;
      if (this.filters.status && t.status !== this.filters.status) return false;
      if (this.filters.currency && t.currency !== this.filters.currency) return false;
      if (this.filters.productType && t.productType !== this.filters.productType) return false;
      if (this.filters.applicantName && !t.applicantName?.toLowerCase().includes(this.filters.applicantName.toLowerCase())) return false;
      if (this.filters.beneficiary && !t.beneficiary?.toLowerCase().includes(this.filters.beneficiary.toLowerCase())) return false;

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
        const aVal = a[this.sortColumn as keyof UndertakingTransaction];
        const bVal = b[this.sortColumn as keyof UndertakingTransaction];
        
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return this.sortDirection === 'asc' ? -1 : 1;
        if (bVal == null) return this.sortDirection === 'asc' ? 1 : -1;
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return this.sortDirection === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.filteredUndertakings = data;
    this.applyPagination();
  }

  // Tab matching logic
  matchTab(transaction: UndertakingTransaction, tab: string): boolean {
    switch (tab) {
      case 'live':
        return transaction.status === 'Live';
      case 'draft':
        return transaction.status === 'Draft';
      case 'pendingApproval':
        return transaction.status === 'Pending Approval';
      case 'pendingBank':
        return transaction.status === 'Pending at Bank';
      case 'submitted':
        return transaction.status === 'Submitted';
      case 'rejected':
        return transaction.status === 'Rejected';
      case 'closed':
        return transaction.status === 'Closed';
      case 'actions':
        return transaction.status === 'Pending Approval' || transaction.status === 'Pending at Bank';
      default:
        return true;
    }
  }

  // Tab count
  getTabCount(tabId: string): number {
    if (tabId === 'all') return this.allUndertakings.length;
    if (tabId === 'actions') {
      return this.allUndertakings.filter(t => 
        t.status === 'Pending Approval' || t.status === 'Pending at Bank'
      ).length;
    }
    const tab = this.tabs.find(t => t.id === tabId);
    return tab ? this.allUndertakings.filter(t => t.status === tab.status).length : 0;
  }

  // Sorting
  sortBy(column: keyof UndertakingTransaction): void {
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
    this.totalPages = Math.max(1, Math.ceil(this.filteredUndertakings.length / this.itemsPerPage));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    this.pagedUndertakings = this.filteredUndertakings.slice(start, end);
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

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
    this.currentPage = 1;
    this.applyAll();
  }

  // Status helpers
  getStatusClass(status: string): string {
    return this.statusColors[status] || 'default';
  }

  // Action methods
  canAcceptTransaction(t: UndertakingTransaction): boolean {
    return t.status === 'Pending Approval' || t.status === 'Pending at Bank';
  }

  canRejectTransaction(t: UndertakingTransaction): boolean {
    return this.canAcceptTransaction(t);
  }

  acceptTransaction(t: UndertakingTransaction): void {
    if (confirm(`Accept undertaking ${t.channelReference}?`)) {
      try {
        // Update in both services
        this.undertakingService.updateStatus(t.id, 'Live');
        this.sharedService.updateTransaction(t.id, { 
          status: 'Live',
          canEdit: false,
          canView: true 
        });
        
        this.loadUndertakings();
        
      } catch (error) {
        console.error('Error accepting undertaking:', error);
      }
    }
  }

  rejectTransaction(t: UndertakingTransaction): void {
    if (confirm(`Reject undertaking ${t.channelReference}?`)) {
      try {
        // Update in both services
        this.undertakingService.updateStatus(t.id, 'Rejected');
        this.sharedService.updateTransaction(t.id, { 
          status: 'Rejected',
          canEdit: false,
          canView: true 
        });
        
        this.loadUndertakings();
        
      } catch (error) {
        console.error('Error rejecting undertaking:', error);
      }
    }
  }

  deleteTransaction(t: UndertakingTransaction): void {
    if (confirm(`Delete undertaking ${t.channelReference}?`)) {
      try {
        this.undertakingService.deleteTransaction(t.id);
        this.sharedService.deleteTransaction(t.id);
        this.loadUndertakings();
        
      } catch (error) {
        console.error('Error deleting undertaking:', error);
      }
    }
  }

  // Utility methods
  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB');
  }

  formatCurrency(amount: number | undefined, currency: string = 'USD'): string {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatNumber(num: number | undefined): string {
    if (!num) return '0';
    return num.toLocaleString('en-US');
  }

  // Get unique values for filter dropdowns
  getUniqueProductTypes(): string[] {
    const types = this.allUndertakings
      .map(t => t.productType)
      .filter((t): t is string => !!t);
    return [...new Set(types)];
  }

  getUniqueCurrencies(): string[] {
    const currencies = this.allUndertakings
      .map(t => t.currency)
      .filter((t): t is string => !!t);
    return [...new Set(currencies)];
  }

  // Add these missing methods for the template
  getTotalAmount(): number {
    return this.allUndertakings.reduce((sum, t) => sum + (t.amount || 0), 0);
  }

  getPendingCount(): number {
    return this.allUndertakings.filter(t => 
      t.status === 'Pending Approval' || t.status === 'Pending at Bank'
    ).length;
  }

  getLiveCount(): number {
    return this.allUndertakings.filter(t => t.status === 'Live').length;
  }

  getSubmittedCount(): number {
    return this.allUndertakings.filter(t => t.status === 'Submitted').length;
  }

  getDraftCount(): number {
    return this.allUndertakings.filter(t => t.status === 'Draft').length;
  }

  getRejectedCount(): number {
    return this.allUndertakings.filter(t => t.status === 'Rejected').length;
  }

  getClosedCount(): number {
    return this.allUndertakings.filter(t => t.status === 'Closed').length;
  }
}