// import { Component, Inject, PLATFORM_ID } from '@angular/core';
// import { SharedService, Transaction } from '../../../../../../core/services/user-service/shared-form-service/shared-service';
// import { CommonModule, isPlatformBrowser } from '@angular/common';
// import { MatIconModule } from '@angular/material/icon';

// @Component({
//   selector: 'app-approved-records',
//   standalone:true,
//   imports: [MatIconModule, CommonModule],
//   templateUrl: './approved-records.html',
//   styleUrl: './approved-records.scss',
// })
// export class ApprovedRecords {
//   searchQuery: string = '';
//   showAdvancedSearch: boolean = false;
//   activeTab: string = 'live';
//   sortColumn: string = '';
//   sortDirection: 'asc' | 'desc' = 'asc';
//   currentPage: number = 1;
//   itemsPerPage: number = 10;
//   debugVisible: boolean = false;
//   private isBrowser: boolean;

//   filters = {
//     channelReference: '',
//     customerReference: '',
//     bankReference: '',
//     status: '',
//     fromDate: '',
//     toDate: '',
//     currency: '',
//     minAmount: null as number | null,
//     maxAmount: null as number | null
//   };

//   allTransactions: Transaction[] = [];
//   filteredTransactions: Transaction[] = [];

//   constructor(
//     private sharedService: SharedService,
//     @Inject(PLATFORM_ID) platformId: Object
//   ) {
//     this.isBrowser = isPlatformBrowser(platformId);
//     console.log('SearchTransactionID initialized - isBrowser:', this.isBrowser);
//     console.log('SharedService instance:', sharedService);
//     console.log('Initial transactions from service:', sharedService.getAllTransactions().length);
//   }

//   ngOnInit() {
//     console.log('SearchTransactionID ngOnInit');

//     // Only run in browser
//     if (this.isBrowser) {
//       this.loadTransactions();

//       // Subscribe to transaction updates
//       this.sharedService.transactions$.subscribe(transactions => {
//         console.log('Transactions subscription updated:', transactions.length);
//         this.allTransactions = transactions;
//         this.applyFilters();
//       });
//     } else {
//       console.log('Running in SSR mode - skipping data loading');
//     }
//   }

//   // ==================== DATA LOADING ====================

//   loadTransactions() {
//     console.log('Loading transactions...');

//     // Get all transactions from shared service
//     this.allTransactions = this.sharedService.getAllTransactions();
//     console.log('Loaded transactions from service:', this.allTransactions.length);
//     console.log('Transactions:', this.allTransactions);

//     // If no transactions and in browser, load some mock data
//     if (this.allTransactions.length === 0 && this.isBrowser) {
//       console.log('No transactions found, loading mock data');
//       this.loadMockTransactions();
//     }

//     this.applyFilters();
//   }

//   loadMockTransactions() {
//     console.log('Loading mock transactions...');

//     // Add some mock transactions to shared service
//     const mockTransactions: Transaction[] = [
//       {
//         id: 1,
//         channelReference: 'CH001234',
//         customerReference: 'CUST001',
//         bankReference: 'BNK001',
//         issueDate: new Date('2024-01-15'),
//         status: 'Live',
//         beneficiary: 'ABC Corporation',
//         currency: 'USD',
//         amount: 50000,
//         outstandingAmount: 25000,
//         expiryDate: new Date('2024-12-31')
//       },
//       {
//         id: 2,
//         channelReference: 'CH001235',
//         customerReference: 'CUST002',
//         bankReference: 'BNK002',
//         issueDate: new Date('2024-01-10'),
//         status: 'Draft',
//         beneficiary: 'XYZ Ltd',
//         currency: 'EUR',
//         amount: 75000,
//         outstandingAmount: 75000,
//         expiryDate: new Date('2024-11-30')
//       },
//       {
//         id: 3,
//         channelReference: 'CH001236',
//         customerReference: 'CUST003',
//         bankReference: 'BNK003',
//         issueDate: new Date('2024-01-20'),
//         status: 'Pending Approval',
//         beneficiary: 'Global Industries',
//         currency: 'USD',
//         amount: 100000,
//         outstandingAmount: 100000,
//         expiryDate: new Date('2024-10-31')
//       }
//     ];

//     console.log('Mock transactions to add:', mockTransactions);

//     // Add mock transactions directly to shared service
//     const current = this.sharedService.getAllTransactions();
//     const updated = [...current, ...mockTransactions];

//     // Update shared service
//     if (this.sharedService['transactions']) {
//       this.sharedService['transactions'].next(updated);
//     }

//     // Save to localStorage (will be skipped if not in browser)
//     if (typeof this.sharedService['saveTransactions'] === 'function') {
//       this.sharedService['saveTransactions'](updated);
//     }

//     console.log('Mock transactions added, total:', updated.length);
//   }

//   // ==================== SEARCH & FILTER METHODS ====================

//   onSearch() {
//     console.log('Search triggered:', this.searchQuery);
//     this.currentPage = 1;
//     this.applyFilters();
//   }

//   clearSearch() {
//     console.log('Clearing search');
//     this.searchQuery = '';
//     this.filters = {
//       channelReference: '',
//       customerReference: '',
//       bankReference: '',
//       status: '',
//       fromDate: '',
//       toDate: '',
//       currency: '',
//       minAmount: null,
//       maxAmount: null
//     };
//     this.onSearch();
//   }

//   toggleAdvancedSearch() {
//     this.showAdvancedSearch = !this.showAdvancedSearch;
//     console.log('Advanced search toggled:', this.showAdvancedSearch);
//   }

//   applyAdvancedFilters() {
//     console.log('Applying advanced filters:', this.filters);
//     this.currentPage = 1;
//     this.applyFilters();
//     this.showAdvancedSearch = false;
//   }

//   resetFilters() {
//     console.log('Resetting all filters');
//     this.clearSearch();
//   }

//   applyFilters() {
//     console.log('Applying filters...');
//     console.log('Search query:', this.searchQuery);
//     console.log('Active filters:', this.filters);

//     // Use shared service to search
//     this.filteredTransactions = this.sharedService.searchTransactions(
//       this.searchQuery,
//       this.filters
//     );

//     console.log('Filtered transactions before tab filter:', this.filteredTransactions.length);

//     // Apply tab filter
//     this.filteredTransactions = this.filterByTab(this.filteredTransactions);

//     console.log('Filtered transactions after tab filter:', this.filteredTransactions.length);

//     // Apply sorting
//     this.applySorting();

//     console.log('Final filtered transactions:', this.filteredTransactions.length);
//   }

//   filterByTab(transactions: Transaction[]): Transaction[] {
//     console.log('Filtering by tab:', this.activeTab);

//     switch (this.activeTab) {
//       case 'live':
//         return transactions.filter(t => t.status === 'Live');
//       case 'draft':
//         return transactions.filter(t => t.status === 'Draft');
//       case 'pendingApproval':
//         return transactions.filter(t => t.status === 'Pending Approval');
//       case 'pendingBank':
//         return transactions.filter(t => t.status === 'Pending at Bank');
//       case 'rejected':
//         return transactions.filter(t => t.status === 'Rejected');
//       case 'closed':
//         return transactions.filter(t => t.status === 'Closed');
//       case 'actions':
//         return transactions.filter(t => ['Pending Approval', 'Draft'].includes(t.status));
//       default:
//         return transactions;
//     }
//   }

//   applySorting() {
//     if (this.sortColumn) {
//       console.log('Applying sorting by:', this.sortColumn, 'direction:', this.sortDirection);

//       this.filteredTransactions.sort((a, b) => {
//         const aValue = (a as any)[this.sortColumn];
//         const bValue = (b as any)[this.sortColumn];

//         if (typeof aValue === 'string' && typeof bValue === 'string') {
//           return this.sortDirection === 'asc'
//             ? aValue.localeCompare(bValue)
//             : bValue.localeCompare(aValue);
//         } else {
//           return this.sortDirection === 'asc'
//             ? (aValue > bValue ? 1 : -1)
//             : (bValue > aValue ? 1 : -1);
//         }
//       });
//     }
//   }

//   // ==================== TAB METHODS ====================

//   getTabCount(tabName: string): number {
//     const tabTransactions = this.filterByTab(this.allTransactions);
//     const count = tabTransactions.length;
//     console.log(`Tab count for ${tabName}:`, count);
//     return count;
//   }

//   setActiveTab(tab: string) {
//     console.log('Setting active tab:', tab);
//     this.activeTab = tab;
//     this.currentPage = 1;
//     this.applyFilters();
//   }

//   // ==================== SORTING METHODS ====================

//   sortBy(column: string) {
//     console.log('Sorting by column:', column);

//     if (this.sortColumn === column) {
//       this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
//     } else {
//       this.sortColumn = column;
//       this.sortDirection = 'asc';
//     }

//     console.log('Sort column:', this.sortColumn, 'Direction:', this.sortDirection);
//     this.applyFilters();
//   }

//   // ==================== PAGINATION METHODS ====================

//   get totalPages(): number {
//     const pages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
//     console.log('Total pages:', pages);
//     return pages;
//   }

//   get pagedTransactions(): Transaction[] {
//     const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//     const endIndex = startIndex + this.itemsPerPage;
//     const paged = this.filteredTransactions.slice(startIndex, endIndex);
//     console.log(`Paged transactions (${startIndex} to ${endIndex}):`, paged.length);
//     return paged;
//   }

//   previousPage() {
//     console.log('Previous page clicked');
//     if (this.currentPage > 1) {
//       this.currentPage--;
//       console.log('New page:', this.currentPage);
//     }
//   }

//   nextPage() {
//     console.log('Next page clicked');
//     if (this.currentPage < this.totalPages) {
//       this.currentPage++;
//       console.log('New page:', this.currentPage);
//     }
//   }

//   // ==================== VIEW & HELPER METHODS ====================

//   viewTransaction(transaction: Transaction) {
//     console.log('View transaction:', transaction);

//     alert(`Transaction Details:
//       Reference: ${transaction.channelReference}
//       Status: ${transaction.status}
//       Beneficiary: ${transaction.beneficiary}
//       Amount: ${transaction.currency} ${transaction.amount.toLocaleString()}
//       Expiry: ${transaction.expiryDate.toLocaleDateString()}
//     `);
//   }

//   get hasActiveFilters(): boolean {
//     const hasFilters = !!this.searchQuery ||
//       Object.values(this.filters).some(value =>
//         value !== '' && value !== null && value !== undefined
//       );

//     console.log('Has active filters:', hasFilters);
//     return hasFilters;
//   }

//   // ==================== DEBUG METHODS ====================

//   // ADD THIS MISSING METHOD:
//   debugTransactions() {
//     this.debugVisible = !this.debugVisible;
//     console.log('=== DEBUG INFO ===');
//     console.log('All transactions:', this.allTransactions);
//     console.log('Filtered transactions:', this.filteredTransactions);
//     console.log('Paged transactions:', this.pagedTransactions);
//     console.log('Current page:', this.currentPage);
//     console.log('Total pages:', this.totalPages);
//     console.log('Active tab:', this.activeTab);
//     console.log('Search query:', this.searchQuery);

//     // Check localStorage if in browser
//     if (this.isBrowser) {
//       const saved = localStorage.getItem('lc_transactions');
//       console.log('LocalStorage data:', saved ? JSON.parse(saved) : 'No data');
//     }

//     // Check shared service
//     console.log('Shared service getAllTransactions():', this.sharedService.getAllTransactions());
//   }
// }
