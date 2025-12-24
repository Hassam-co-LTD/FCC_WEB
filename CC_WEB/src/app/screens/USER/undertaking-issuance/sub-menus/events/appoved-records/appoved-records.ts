// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterModule } from '@angular/router';
// import { MatIconModule } from '@angular/material/icon';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { SharedService } from '../../../../../../core/services/user-service/shared-form-service/shared-service';
// import { UndertakingIssuanceService, UndertakingTransaction } from '../../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';

// @Component({
//   selector: 'app-approved-records',
//   standalone: true,
//   imports: [CommonModule, FormsModule, MatIconModule, MatCheckboxModule, RouterModule],
//   templateUrl: './approved-records.html',
//   styleUrls: ['./approved-records.scss']
// })
// export class ApprovedRecords implements OnInit {
//   approvedUndertakings: UndertakingTransaction[] = [];
//   filteredUndertakings: UndertakingTransaction[] = [];
//   pagedUndertakings: UndertakingTransaction[] = [];

//   // Search & Filter
//   searchQuery = '';
//   showAdvancedSearch = false;
  
//   filters = {
//     channelReference: '',
//     customerReference: '',
//     bankReference: '',
//     fromDate: '',
//     toDate: '',
//     currency: '',
//     minAmount: null as number | null,
//     maxAmount: null as number | null,
//     productType: '',
//     applicantName: '',
//     beneficiary: ''
//   };

//   // Sort
//   sortColumn: keyof UndertakingTransaction | '' = '';
//   sortDirection: 'asc' | 'desc' = 'asc';

//   // Pagination
//   itemsPerPage = 10;
//   currentPage = 1;
//   totalPages = 1;

//   constructor(
//     private sharedService: SharedService,
//     private undertakingService: UndertakingIssuanceService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.loadApprovedUndertakings();
//   }

//   loadApprovedUndertakings(): void {
//     // Get approved (Live) undertakings using service method
//     this.approvedUndertakings = this.undertakingService.getLiveTransactions();
//     this.applyFilters();
//   }

//   // View transaction
//   viewTransaction(t: UndertakingTransaction): void {
//     this.sharedService.setFormData({
//       transaction: t,
//       mode: 'view', // Approved records are view-only
//       canUpdate: false,
//       formData: t.formData || {},
//       transactionId: t.id
//     });
    
//     this.router.navigate(['/undertaking-issuance/preview', t.id]);
//   }

//   // Close transaction
//   closeTransaction(t: UndertakingTransaction): void {
//     if (confirm(`Close undertaking ${t.channelReference}? This action cannot be undone.`)) {
//       try {
//         this.undertakingService.closeTransaction(t.id);
//         this.loadApprovedUndertakings();
//       } catch (error) {
//         console.error('Error closing undertaking:', error);
//       }
//     }
//   }

//   // Search and filter methods
//   onSearch(): void {
//     this.applyFilters();
//   }

//   clearSearch(): void {
//     this.searchQuery = '';
//     this.resetFilters();
//     this.applyFilters();
//   }

//   toggleAdvancedSearch(): void {
//     this.showAdvancedSearch = !this.showAdvancedSearch;
//   }

//   applyAdvancedFilters(): void {
//     this.applyFilters();
//   }

//   resetFilters(): void {
//     this.filters = {
//       channelReference: '',
//       customerReference: '',
//       bankReference: '',
//       fromDate: '',
//       toDate: '',
//       currency: '',
//       minAmount: null,
//       maxAmount: null,
//       productType: '',
//       applicantName: '',
//       beneficiary: ''
//     };
//   }

//   // Main filtering
//   applyFilters(): void {
//     let data = [...this.approvedUndertakings];

//     // Text search
//     if (this.searchQuery.trim()) {
//       const term = this.searchQuery.toLowerCase();
//       data = data.filter(t =>
//         (t.channelReference?.toLowerCase().includes(term) || false) ||
//         (t.customerReference?.toLowerCase().includes(term) || false) ||
//         (t.bankReference?.toLowerCase().includes(term) || false) ||
//         (t.beneficiary?.toLowerCase().includes(term) || false) ||
//         (t.applicantName?.toLowerCase().includes(term) || false) ||
//         (t.productType?.toLowerCase().includes(term) || false)
//       );
//     }

//     // Advanced filters
//     data = data.filter(t => {
//       if (this.filters.channelReference && !t.channelReference?.includes(this.filters.channelReference)) return false;
//       if (this.filters.customerReference && !t.customerReference?.includes(this.filters.customerReference)) return false;
//       if (this.filters.bankReference && !t.bankReference?.includes(this.filters.bankReference)) return false;
//       if (this.filters.currency && t.currency !== this.filters.currency) return false;
//       if (this.filters.productType && t.productType !== this.filters.productType) return false;
//       if (this.filters.applicantName && !t.applicantName?.toLowerCase().includes(this.filters.applicantName.toLowerCase())) return false;
//       if (this.filters.beneficiary && !t.beneficiary?.toLowerCase().includes(this.filters.beneficiary.toLowerCase())) return false;

//       if (this.filters.fromDate) {
//         const fromDate = new Date(this.filters.fromDate);
//         const issueDate = new Date(t.issueDate);
//         if (issueDate < fromDate) return false;
//       }

//       if (this.filters.toDate) {
//         const toDate = new Date(this.filters.toDate);
//         const issueDate = new Date(t.issueDate);
//         if (issueDate > toDate) return false;
//       }

//       if (this.filters.minAmount !== null && t.amount < this.filters.minAmount) return false;
//       if (this.filters.maxAmount !== null && t.amount > this.filters.maxAmount) return false;

//       return true;
//     });

//     // Sorting
//     if (this.sortColumn) {
//       data.sort((a, b) => {
//         const aVal = a[this.sortColumn as keyof UndertakingTransaction];
//         const bVal = b[this.sortColumn as keyof UndertakingTransaction];
        
//         if (aVal == null && bVal == null) return 0;
//         if (aVal == null) return this.sortDirection === 'asc' ? -1 : 1;
//         if (bVal == null) return this.sortDirection === 'asc' ? 1 : -1;
        
//         if (typeof aVal === 'string' && typeof bVal === 'string') {
//           return this.sortDirection === 'asc' 
//             ? aVal.localeCompare(bVal)
//             : bVal.localeCompare(aVal);
//         }
        
//         if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
//         if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
//         return 0;
//       });
//     }

//     this.filteredUndertakings = data;
//     this.applyPagination();
//   }

//   // Sorting
//   sortBy(column: keyof UndertakingTransaction): void {
//     if (this.sortColumn === column) {
//       this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
//     } else {
//       this.sortColumn = column;
//       this.sortDirection = 'asc';
//     }
//     this.applyFilters();
//   }

//   // Pagination
//   applyPagination(): void {
//     this.totalPages = Math.max(1, Math.ceil(this.filteredUndertakings.length / this.itemsPerPage));
//     this.currentPage = Math.min(this.currentPage, this.totalPages);
    
//     const start = (this.currentPage - 1) * this.itemsPerPage;
//     const end = start + this.itemsPerPage;
    
//     this.pagedUndertakings = this.filteredUndertakings.slice(start, end);
//   }

//   nextPage(): void {
//     if (this.currentPage < this.totalPages) {
//       this.currentPage++;
//       this.applyPagination();
//     }
//   }

//   previousPage(): void {
//     if (this.currentPage > 1) {
//       this.currentPage--;
//       this.applyPagination();
//     }
//   }

//   // Utility methods
//   formatDate(date: Date | undefined): string {
//     if (!date) return 'N/A';
//     return new Date(date).toLocaleDateString('en-GB');
//   }

//   formatCurrency(amount: number | undefined, currency: string = 'USD'): string {
//     if (!amount) return 'N/A';
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: currency,
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     }).format(amount);
//   }

//   getTotalAmount(): number {
//     return this.approvedUndertakings.reduce((sum, t) => sum + (t.amount || 0), 0);
//   }

//   getUniqueProductTypes(): string[] {
//     const types = this.approvedUndertakings
//       .map(t => t.productType)
//       .filter((t): t is string => !!t);
//     return [...new Set(types)];
//   }

//   getUniqueCurrencies(): string[] {
//     const currencies = this.approvedUndertakings
//       .map(t => t.currency)
//       .filter((t): t is string => !!t);
//     return [...new Set(currencies)];
//   }

//   // Additional methods for statistics
//   getAverageDaysActive(): number {
//     if (this.approvedUndertakings.length === 0) return 0;
//     const totalDays = this.approvedUndertakings.reduce((sum, t) => {
//       const approvedDate = t.issueDate ? new Date(t.issueDate) : new Date();
//       const today = new Date();
//       const diffTime = Math.abs(today.getTime() - approvedDate.getTime());
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//       return sum + diffDays;
//     }, 0);
//     return Math.round(totalDays / this.approvedUndertakings.length);
//   }

//   getExpiringSoonCount(): number {
//     const thirtyDaysFromNow = new Date();
//     thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
//     return this.approvedUndertakings.filter(t => {
//       if (!t.expiryDate) return false;
//       const expiryDate = new Date(t.expiryDate);
//       return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
//     }).length;
//   }

//   isExpiringSoon(expiryDate: Date | undefined): boolean {
//     if (!expiryDate) return false;
//     const expiry = new Date(expiryDate);
//     const thirtyDaysFromNow = new Date();
//     thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
//     return expiry <= thirtyDaysFromNow && expiry >= new Date();
//   }

//   getDaysRemaining(expiryDate: Date | undefined): number {
//     if (!expiryDate) return 0;
//     const expiry = new Date(expiryDate);
//     const today = new Date();
//     const diffTime = expiry.getTime() - today.getTime();
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   }

//   showExpiringSoon(): void {
//     // Filter to show only expiring soon records
//     this.filters.fromDate = new Date().toISOString().split('T')[0];
//     const thirtyDaysFromNow = new Date();
//     thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
//     this.filters.toDate = thirtyDaysFromNow.toISOString().split('T')[0];
//     this.applyFilters();
//   }
// }