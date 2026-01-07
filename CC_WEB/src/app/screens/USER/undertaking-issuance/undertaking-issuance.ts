import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";


@Component({
  selector: 'app-undertaking-issued',
  templateUrl: './undertaking-issuance.html',
  styleUrls: ['./undertaking-issuance.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule , RouterLink]
})
export class UndertakingIssuance {

  constructor(private router: Router) {}

  /**
   * Navigate to undertaking templates page
  //  */
  // openTemplates(): void {
  //   this.router.navigate(['/undertaking-templates']);
  // }

  // /**
  //  * Navigate to request undertaking flow
  //  */
  // requestUndertaking(): void {
  //   this.router.navigate([
  //     '/undertaking-issuance/request-undertaking/general-details'
  //   ]);
  }


  // // Data
  // allUndertakings: UndertakingTransaction[] = [];
  // filteredUndertakings: UndertakingTransaction[] = [];
  // pagedUndertakings: UndertakingTransaction[] = [];

  // // Search & Filter
  // searchQuery = '';
  // showAdvancedSearch = false;
  // hasActiveFilters = false;
  
  // filters = {
  //   channelReference: '',
  //   status: '',
  //   currency: '',
  //   minAmount: null as number | null,
  //   maxAmount: null as number | null,
  //   productType: '',
  // };

//   // Tabs
//   tabs = [
//     { id: 'all', name: 'All Transactions' },
//     { id: 'draft', name: 'Drafts' },
//     { id: 'pending', name: 'Pending Approval' },
//     { id: 'submitted', name: 'Submitted' }
//   ];
//   activeTab: string = 'all';

//   // Sort & Pagination
//   sortColumn: string = 'lastUpdated';
//   sortDirection: 'asc' | 'desc' = 'desc';
//   itemsPerPage = 10;
//   currentPage = 1;
//   totalPages = 1;

//   constructor(
//     private sharedService: SharedService,
//     private backendService: UndertakingIssuanceService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.loadUndertakings();
//   }

//   loadUndertakings(): void {
//     // Fetch directly from the "Backend" service
//     this.backendService.getTransactions().subscribe(data => {
//       this.allUndertakings = data;
//       this.applyAllFilters();
//     });
//   }

//   // ================= ACTIONS =================

//   /**
//    * Handles navigation based on status.
//    * Draft -> Request Page (Edit)
//    * Submitted/Pending -> Preview Page (View)
//    */
//   viewTransaction(t: UndertakingTransaction): void {
//     const isDraft = t.status === 'Draft';
    
//     // Pass data to shared service so target page can load it
//     this.sharedService.setFormData({
//       isEditMode: isDraft, 
//       isReadOnly: !isDraft, // Read only if not a draft
//       transactionId: t.id,
//       formData: t.formData
//     });

//     if (isDraft) {
//       this.router.navigate(['/undertaking-issuance/request']);
//     } else {
//       this.router.navigate(['/undertaking-issuance/preview']);
//     }
//   }

//   approveTransaction(t: UndertakingTransaction): void {
//     if (confirm(`Approve transaction ${t.channelReference}?`)) {
//       this.backendService.approveTransaction(t.id).subscribe(() => {
//         this.loadUndertakings(); // Refresh list
//       });
//     }
//   }

//   deleteTransaction(t: UndertakingTransaction): void {
//     if (confirm(`Are you sure you want to delete ${t.channelReference}?`)) {
//       // Assuming backend service has a delete method (or you can filter it out locally)
//       this.allUndertakings = this.allUndertakings.filter(item => item.id !== t.id);
//       this.applyAllFilters();
//       // Ideally: this.backendService.deleteTransaction(t.id).subscribe(...)
//     }
//   }

//   // ================= SEARCH & FILTER =================

//   onSearch(): void {
//     this.applyAllFilters();
//   }

//   clearSearch(): void {
//     this.searchQuery = '';
//     this.resetFilters();
//     this.applyAllFilters();
//   }

//   toggleAdvancedSearch(): void {
//     this.showAdvancedSearch = !this.showAdvancedSearch;
//   }

//   resetFilters(): void {
//     this.filters = {
//       channelReference: '',
//       status: '',
//       currency: '',
//       minAmount: null,
//       maxAmount: null,
//       productType: ''
//     };
//     this.hasActiveFilters = false;
//   }

//   applyAdvancedFilters(): void {
//     this.hasActiveFilters = true;
//     this.applyAllFilters();
//   }

//   // Main Pipeline: Tabs -> Search -> Filters -> Sort -> Pagination
//   applyAllFilters(): void {
//     let data = [...this.allUndertakings];

//     // 1. Tabs
//     if (this.activeTab !== 'all') {
//       if (this.activeTab === 'pending') {
//         data = data.filter(t => t.status === 'Pending Approval');
//       } else if (this.activeTab === 'draft') {
//         data = data.filter(t => t.status === 'Draft');
//       } else if (this.activeTab === 'submitted') {
//         // data = data.filter(t => t.status === 'Submitted' || t.status === 'Live');
//       }
//     }

//     // 2. Text Search (Deep search into formData)
//     if (this.searchQuery.trim()) {
//       const term = this.searchQuery.toLowerCase();
//       data = data.filter(t => 
//         t.channelReference?.toLowerCase().includes(term) ||
//         t.formData?.applicantBeneficiary?.beneficiaryName?.toLowerCase().includes(term) ||
//         t.formData?.generalDetails?.productType?.toLowerCase().includes(term)
//       );
//     }

//     // 3. Advanced Filters
//     if (this.hasActiveFilters) {
//       if (this.filters.channelReference) {
//         data = data.filter(t => t.channelReference.includes(this.filters.channelReference));
//       }
//       if (this.filters.status) {
//         data = data.filter(t => t.status === this.filters.status);
//       }
//       if (this.filters.productType) {
//         data = data.filter(t => t.formData?.generalDetails?.productType === this.filters.productType);
//       }
//       if (this.filters.currency) {
//         data = data.filter(t => t.formData?.undertakingDetails?.currency === this.filters.currency);
//       }
//       // Amount logic (handling potentially undefined amounts)
//       if (this.filters.minAmount !== null) {
//         data = data.filter(t => (t.formData?.undertakingDetails?.undertakingAmount || 0) >= this.filters.minAmount!);
//       }
//       if (this.filters.maxAmount !== null) {
//         data = data.filter(t => (t.formData?.undertakingDetails?.undertakingAmount || 0) <= this.filters.maxAmount!);
//       }
//     }

//     // 4. Sorting
//     this.doSort(data);

//     this.filteredUndertakings = data;
//     this.applyPagination();
//   }

//   // ================= HELPERS =================

//   doSort(data: UndertakingTransaction[]): void {
//     data.sort((a, b) => {
//       let valA: any = a;
//       let valB: any = b;

//       // Handle specific columns that are nested in formData
//       if (this.sortColumn === 'channelReference' || this.sortColumn === 'status') {
//         valA = a[this.sortColumn as keyof UndertakingTransaction];
//         valB = b[this.sortColumn as keyof UndertakingTransaction];
//       } else if (this.sortColumn === 'lastUpdated') {
//         valA = new Date(a.lastUpdated).getTime();
//         valB = new Date(b.lastUpdated).getTime();
//       }

//       if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
//       if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
//       return 0;
//     });
//   }

//   sortBy(col: string): void {
//     if (this.sortColumn === col) {
//       this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
//     } else {
//       this.sortColumn = col;
//       this.sortDirection = 'asc';
//     }
//     this.applyAllFilters();
//   }

//   getSortIcon(col: string): string {
//     if (this.sortColumn !== col) return 'unfold_more';
//     return this.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
//   }

//   // Pagination
//   applyPagination(): void {
//     this.totalPages = Math.ceil(this.filteredUndertakings.length / this.itemsPerPage) || 1;
//     this.currentPage = Math.min(this.currentPage, this.totalPages) || 1;
    
//     const start = (this.currentPage - 1) * this.itemsPerPage;
//     this.pagedUndertakings = this.filteredUndertakings.slice(start, start + this.itemsPerPage);
//   }

//   nextPage() { if (this.currentPage < this.totalPages) { this.currentPage++; this.applyPagination(); } }
//   previousPage() { if (this.currentPage > 1) { this.currentPage--; this.applyPagination(); } }

//   setActiveTab(id: string) {
//     this.activeTab = id;
//     this.currentPage = 1;
//     this.applyAllFilters();
//   }

//   // Utilities for HTML
//   getTabCount(id: string): number {
//     if (id === 'all') return this.allUndertakings.length;
//     if (id === 'draft') return this.allUndertakings.filter(t => t.status === 'Draft').length;
//     if (id === 'pending') return this.allUndertakings.filter(t => t.status === 'Pending Approval').length;
//     if (id === 'submitted') return this.allUndertakings.filter(t => t.status === 'Submitted' || t.status === 'Live').length;
//     return 0;
//   }

//   getUniqueProductTypes(): string[] {
//     const types = new Set(this.allUndertakings.map(t => t.formData?.generalDetails?.productType).filter(Boolean));
//     return Array.from(types);
//   }

//   getUniqueCurrencies(): string[] {
//     const curs = new Set(this.allUndertakings.map(t => t.formData?.undertakingDetails?.currency).filter(Boolean));
//     return Array.from(curs);
//   }

//   getStatusClass(status: string): string {
//     switch (status.toLowerCase()) {
//       case 'draft': return 'draft'; // CSS class: status-draft
//       case 'submitted': return 'submitted';
//       case 'live': return 'live';
//       case 'pending approval': return 'pending';
//       case 'rejected': return 'rejected';
//       default: return '';
//     }
//   }
// }