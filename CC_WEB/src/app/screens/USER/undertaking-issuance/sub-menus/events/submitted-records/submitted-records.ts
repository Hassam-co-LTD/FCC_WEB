// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterModule } from '@angular/router';
// import { MatIconModule } from '@angular/material/icon';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { SharedService } from '../../../../../../core/services/user-service/shared-form-service/shared-service';
// import { UndertakingIssuanceService, UndertakingTransaction } from '../../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';

// @Component({
//   selector: 'app-submitted-records',
//   standalone: true,
//   imports: [CommonModule, FormsModule, MatIconModule, MatCheckboxModule, RouterModule],
//   templateUrl: './submitted-records.html',
//   styleUrls: ['./submitted-records.scss']
// })
// export class SubmittedRecordsComponent implements OnInit {
//   submittedUndertakings: UndertakingTransaction[] = [];
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
//     beneficiary: '',
//     status: '' // For status tabs
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
//     this.loadSubmittedUndertakings();
//   }

//   loadSubmittedUndertakings(): void {
//     // Get submitted undertakings using service method
//     this.submittedUndertakings = this.undertakingService.getTransactionsByStatus('Submitted');
//     this.applyFilters();
//   }

//   // View transaction
//   viewTransaction(t: UndertakingTransaction): void {
//     this.sharedService.setFormData({
//       transaction: t,
//       mode: 'view', // Submitted records are view-only
//       canUpdate: false,
//       formData: t.formData || {},
//       transactionId: t.id
//     });
    
//     this.router.navigate(['/undertaking-issuance/preview', t.id]);
//   }

//   // Resubmit for approval
//   resubmitForApproval(t: UndertakingTransaction): void {
//     if (confirm(`Resubmit undertaking ${t.channelReference} for approval?`)) {
//       try {
//         // Convert to pending approval
//         this.undertakingService.updateStatus(t.id, 'Pending Approval', {
//           submittedAt: new Date(),
//           canEdit: true
//         });
//         this.loadSubmittedUndertakings();
//       } catch (error) {
//         console.error('Error resubmitting undertaking:', error);
//       }
//     }
//   }

//   // Withdraw submission
//   withdrawSubmission(t: UndertakingTransaction): void {
//     if (confirm(`Withdraw submission ${t.channelReference}? This will move it back to drafts.`)) {
//       try {
//         this.undertakingService.updateStatus(t.id, 'Draft', {
//           canEdit: true,
//           canView: true,
//           updatedAt: new Date()
//         });
//         this.loadSubmittedUndertakings();
//       } catch (error) {
//         console.error('Error withdrawing submission:', error);
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
//       beneficiary: '',
//       status: ''
//     };
//   }

//   // Main filtering
//   applyFilters(): void {
//     let data = [...this.submittedUndertakings];

//     // Apply status filter
//     if (this.filters.status === 'recent') {
//       const twoDaysAgo = new Date();
//       twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
//       data = data.filter(t => {
//         const submissionDate = this.getSubmissionDate(t);
//         return submissionDate >= twoDaysAgo;
//       });
//     } else if (this.filters.status === 'delayed') {
//       const fiveDaysAgo = new Date();
//       fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
//       data = data.filter(t => {
//         const submissionDate = this.getSubmissionDate(t);
//         return submissionDate <= fiveDaysAgo;
//       });
//     }

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

//       const submissionDate = this.getSubmissionDate(t);

//       if (this.filters.fromDate) {
//         const fromDate = new Date(this.filters.fromDate);
//         if (submissionDate < fromDate) return false;
//       }

//       if (this.filters.toDate) {
//         const toDate = new Date(this.filters.toDate);
//         if (submissionDate > toDate) return false;
//       }

//       if (this.filters.minAmount !== null && t.amount < this.filters.minAmount) return false;
//       if (this.filters.maxAmount !== null && t.amount > this.filters.maxAmount) return false;

//       return true;
//     });

//     // Sorting
//     if (this.sortColumn) {
//       data.sort((a, b) => {
//         // Handle special case for submittedAt sorting
//         let aVal: any;
//         let bVal: any;
        
//         if (this.sortColumn === 'submittedAt') {
//           aVal = this.getSubmissionDate(a);
//           bVal = this.getSubmissionDate(b);
//         } else {
//           aVal = a[this.sortColumn as keyof UndertakingTransaction];
//           bVal = b[this.sortColumn as keyof UndertakingTransaction];
//         }
        
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
//     return this.submittedUndertakings.reduce((sum, t) => sum + (t.amount || 0), 0);
//   }

//   getUniqueProductTypes(): string[] {
//     const types = this.submittedUndertakings
//       .map(t => t.productType)
//       .filter((t): t is string => !!t);
//     return [...new Set(types)];
//   }

//   getUniqueCurrencies(): string[] {
//     const currencies = this.submittedUndertakings
//       .map(t => t.currency)
//       .filter((t): t is string => !!t);
//     return [...new Set(currencies)];
//   }

//   // Get submission date
//   private getSubmissionDate(t: UndertakingTransaction): Date {
//     return t.submittedAt ? new Date(t.submittedAt) : t.issueDate ? new Date(t.issueDate) : new Date();
//   }

//   // Get recent submissions (within 2 days)
//   getRecentSubmissionsCount(): number {
//     const twoDaysAgo = new Date();
//     twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
//     return this.submittedUndertakings.filter(t => {
//       const submissionDate = this.getSubmissionDate(t);
//       return submissionDate >= twoDaysAgo;
//     }).length;
//   }

//   // Get delayed submissions (more than 5 days)
//   getDelayedSubmissionsCount(): number {
//     const fiveDaysAgo = new Date();
//     fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    
//     return this.submittedUndertakings.filter(t => {
//       const submissionDate = this.getSubmissionDate(t);
//       return submissionDate <= fiveDaysAgo;
//     }).length;
//   }

//   // Show recent submissions
//   showRecentSubmissions(): void {
//     this.filters.status = 'recent';
//     const twoDaysAgo = new Date();
//     twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
//     this.filters.fromDate = twoDaysAgo.toISOString().split('T')[0];
//     this.filters.toDate = new Date().toISOString().split('T')[0];
//     this.applyFilters();
//   }

//   // Show delayed submissions
//   showDelayedSubmissions(): void {
//     this.filters.status = 'delayed';
//     const fiveDaysAgo = new Date();
//     fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 30); // Last 30 days
//     this.filters.fromDate = fiveDaysAgo.toISOString().split('T')[0];
    
//     const cutoffDate = new Date();
//     cutoffDate.setDate(cutoffDate.getDate() - 5);
//     this.filters.toDate = cutoffDate.toISOString().split('T')[0];
//     this.applyFilters();
//   }

//   // Get days since submission
//   getDaysSinceSubmission(submittedAt: Date | undefined): number {
//     if (!submittedAt) return 0;
//     const submissionDate = new Date(submittedAt);
//     const today = new Date();
//     const diffTime = today.getTime() - submissionDate.getTime();
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   }

//   // Expected approval date
//   getExpectedApprovalDate(submittedAt: Date | undefined): string {
//     if (!submittedAt) return 'N/A';
//     const submissionDate = new Date(submittedAt);
//     const expectedDate = new Date(submissionDate);
    
//     // Add 5 business days (skip weekends)
//     let addedDays = 0;
//     while (addedDays < 5) {
//       expectedDate.setDate(expectedDate.getDate() + 1);
//       // Skip weekends
//       if (expectedDate.getDay() !== 0 && expectedDate.getDay() !== 6) {
//         addedDays++;
//       }
//     }
    
//     return this.formatDate(expectedDate);
//   }

//   // Submission status with more detailed categories
//   getSubmissionStatus(submittedAt: Date | undefined): string {
//     if (!submittedAt) return 'Unknown';
//     const daysSince = this.getDaysSinceSubmission(submittedAt);
    
//     if (daysSince <= 1) return 'Submitted Today';
//     if (daysSince <= 2) return 'Submitted Yesterday';
//     if (daysSince <= 3) return 'In Review';
//     if (daysSince <= 5) return 'Under Process';
//     if (daysSince <= 7) return 'Awaiting Documents';
//     if (daysSince <= 10) return 'Delayed Review';
//     return 'Requires Follow-up';
//   }

//   // Additional methods for statistics
//   getAverageSubmissionDays(): number {
//     if (this.submittedUndertakings.length === 0) return 0;
//     const totalDays = this.submittedUndertakings.reduce((sum, t) => {
//       const submissionDate = this.getSubmissionDate(t);
//       const today = new Date();
//       const diffTime = Math.abs(today.getTime() - submissionDate.getTime());
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//       return sum + diffDays;
//     }, 0);
//     return Math.round(totalDays / this.submittedUndertakings.length);
//   }

//   getMonthlySubmissionCount(): number {
//     const today = new Date();
//     const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
//     return this.submittedUndertakings.filter(t => {
//       const submissionDate = this.getSubmissionDate(t);
//       return submissionDate >= firstDayOfMonth;
//     }).length;
//   }

//   // Additional helper methods for UI
//   getSubmissionStatusClass(submittedAt: Date | undefined): string {
//     const status = this.getSubmissionStatus(submittedAt);
//     switch(status) {
//       case 'Submitted Today':
//       case 'Submitted Yesterday':
//         return 'status-recent';
//       case 'In Review':
//       case 'Under Process':
//         return 'status-in-progress';
//       case 'Awaiting Documents':
//         return 'status-waiting';
//       case 'Delayed Review':
//       case 'Requires Follow-up':
//         return 'status-delayed';
//       default:
//         return 'status-default';
//     }
//   }

//   // Method to check if a submission is delayed
//   isDelayedSubmission(submittedAt: Date | undefined): boolean {
//     const status = this.getSubmissionStatus(submittedAt);
//     return status === 'Delayed Review' || status === 'Requires Follow-up';
//   }

//   // Method to get the submission date for display
//   getFormattedSubmissionDate(t: UndertakingTransaction): string {
//     const submissionDate = this.getSubmissionDate(t);
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);
    
//     if (submissionDate.toDateString() === today.toDateString()) {
//       return 'Today';
//     } else if (submissionDate.toDateString() === yesterday.toDateString()) {
//       return 'Yesterday';
//     } else {
//       return this.formatDate(submissionDate);
//     }
//   }

//   // Method to get submission urgency
//   getSubmissionUrgency(submittedAt: Date | undefined): string {
//     const daysSince = this.getDaysSinceSubmission(submittedAt);
//     if (daysSince <= 2) return 'low';
//     if (daysSince <= 5) return 'medium';
//     if (daysSince <= 7) return 'high';
//     return 'critical';
//   }

//   // Method to get count by urgency
//   getUrgencyCount(urgency: string): number {
//     return this.submittedUndertakings.filter(t => {
//       return this.getSubmissionUrgency(t.submittedAt || t.issueDate) === urgency;
//     }).length;
//   }

//   // Method to export submitted records
//   exportSubmittedRecords(): void {
//     try {
//       const exportData = this.filteredUndertakings.map(t => ({
//         'Channel Reference': t.channelReference,
//         'Customer Reference': t.customerReference,
//         'Bank Reference': t.bankReference || 'N/A',
//         'Submission Date': this.formatDate(t.submittedAt || t.issueDate),
//         'Beneficiary': t.beneficiary || 'N/A',
//         'Currency': t.currency,
//         'Amount': t.amount,
//         'Expected Approval': this.getExpectedApprovalDate(t.submittedAt || t.issueDate),
//         'Status': this.getSubmissionStatus(t.submittedAt || t.issueDate),
//         'Days Since Submission': this.getDaysSinceSubmission(t.submittedAt || t.issueDate)
//       }));
      
//       // In a real app, you would implement actual export functionality
//       console.log('Exporting data:', exportData);
//       alert(`Exported ${exportData.length} records. In a real application, this would download a CSV/Excel file.`);
//     } catch (error) {
//       console.error('Error exporting records:', error);
//       alert('Error exporting records. Please try again.');
//     }
//   }
// }