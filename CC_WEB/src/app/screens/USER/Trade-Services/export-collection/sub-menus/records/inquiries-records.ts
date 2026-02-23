import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser, DatePipe, TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// SERVICES
import { ApiService } from '../../../../../../core/services/api.service';
import { ExportCollectionTransaction } from '../../../../../../core/models/export-collection';
import { ExportCollectionFormTransactionService } from '../../../../../../core/services/user-service/export-collection-form-transaction-service/export-collection-form-transaction';

@Component({
  selector: 'app-inquiries-records',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule,
    MatTooltipModule,
    FormsModule,
    DatePipe,
    TitleCasePipe
  ],
  templateUrl: './inquiries-records.html',
  styleUrls: ['./inquiries-records.scss']
})
export class inquiriesRecords implements OnInit {
  
  // State
  allTransactions: ExportCollectionTransaction[] = [];
  filteredTransactions: ExportCollectionTransaction[] = [];
  
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
  sortColumn: keyof ExportCollectionTransaction | 'currency' | 'amount' | 'expiryDate' | 'createdOn' = 'createdOn';
  sortDirection: 'asc' | 'desc' = 'desc';

  private isBrowser: boolean;

  constructor(
     private api: ApiService,
    private transactionService: ExportCollectionFormTransactionService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // ngOnInit(): void {
  //   if (!this.isBrowser) return;

  //   // 1. Check URL for tab preference
  //   this.route.queryParams.subscribe(params => {
  //       if(params['tab']) {
  //           this.activeTab = params['tab'];
  //       }
  //       // Initial Load (Backend Filtered)
  //       this.loadByStatus();
  //   });

  //   // 2. Subscribe to stream updates (Real-time updates)
  //   this.transactionService.transactionsStream$.subscribe(txList => {
  //     this.allTransactions = txList; 
  //     // Filter ONLY by search/sort locally (Status is done by backend)
  //     this.filterBySearchOnly(); 
  //   });
  // }
  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.loadTransactions();

    this.transactionService.transactionsStream$.subscribe(txList => {
      this.allTransactions = txList;
      this.applyFilters();
    }
    );
  }
  private loadTransactions(): void {
    const backendStatus = this.mapTabToBackendStatus(this.activeTab);

    this.api.getRecordTransactionsByStatusForExportCollection(backendStatus).subscribe({
      next: (txList) => {
        this.allTransactions = txList;
        this.applyFilters();
      },
      error: () => {
        this.allTransactions = [];
        this.filteredTransactions = [];
      }
    });
  }
  // --- DATA LOADING ---

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadTransactions();
  }

  // --- FILTERING ---

  applyFilters(): void {
    const query = this.searchQuery.toLowerCase().trim();
    const currency = this.currencyFilter.toLowerCase().trim();

    const filtered = this.allTransactions.filter(tx => {

      const matchesSearch =
        !query ||
        tx.tnxId?.toLowerCase().includes(query) ||
        tx.draweeName?.toLowerCase().includes(query) ||
        tx.currency?.toLowerCase().includes(query);

      const matchesCurrency =
        !currency || tx.currency?.toLowerCase() === currency;

      return matchesSearch && matchesCurrency;
    });

    this.applySorting(filtered);
  }
  
  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  // --- SORTING ---

  sortBy(column: typeof this.sortColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  private applySorting(source: ExportCollectionTransaction[] = this.allTransactions): void {
    const sorted = [...source].sort((a, b) => {
      let aVal = this.resolveColumn(a, this.sortColumn);
      let bVal = this.resolveColumn(b, this.sortColumn);

      // Handle null or undefined
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Handle Dates
      if (aVal instanceof Date && bVal instanceof Date) {
        return this.sortDirection === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      // Handle numbers
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return this.sortDirection === 'asc'
          ? aVal - bVal
          : bVal - aVal;
      }

      // Everything else: convert to string and use localeCompare
      const aStr = String(aVal);
      const bStr = String(bVal);
      return this.sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    this.filteredTransactions = sorted;
    this.currentPage = 1;
  }

  private resolveColumn(tx: ExportCollectionTransaction, column: string): any {
    switch (column) {
      case 'tnxId': return tx.tnxId;
      case 'currency': return tx.currency;
      case 'amount': return tx.amount;
      case 'createdOn': return tx.createdOn;
      default: return null;
    }
  }

  // --- PAGINATION ---

  get totalPages(): number {
    return Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
  }

  get pagedTransactions(): ExportCollectionTransaction[] {
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

  viewTransaction(tx: ExportCollectionTransaction): void {
    const readOnly = ['A', 'R'].includes(tx.status!);

   this.api.getTransactionForExportCollectionByTnxId(tx.tnxId!).subscribe({
      next: (freshTx) => {
        this.transactionService.setCurrentTransaction(freshTx, readOnly);
        this.router.navigate(['/export-collection/preview']);
      },
      error: () => {
        this.transactionService.setCurrentTransaction(tx, readOnly);
        this.router.navigate(['/export-collection/preview']);
      }
    });
  }

  openExportCollection(tx: ExportCollectionTransaction) {
    // Store transaction in service for import screen to pick up
    // this.transactionService.setCurrentTransaction(tx);
    const mode = this.resolveScreenMode(this.activeTab);
    // Navigate to import screen
    this.router.navigate(['/export-collection', tx.tnxId], {
      state: {
        transaction: tx,
        // showUpdateSubmit: true // flag to show buttons
        mode: mode
      }
    });
  }
  
  trackByTnxId(_: number, tx: ExportCollectionTransaction): string {
    return tx.tnxId!;
  }

  private resolveScreenMode(tab: string): 'EDIT' | 'APPROVAL' | 'READ_ONLY' {
    switch (tab) {
      case 'pending':
        return 'EDIT';
      case 'submitted':
        return 'APPROVAL';
      default:
        return 'READ_ONLY';
    }
  }

  private mapTabToBackendStatus(tab: string): string {
    switch (tab) {
      case 'pending':
        return 'i';
      case 'submitted':
        return 's';
      case 'approved':
        return 'a';
      case 'rejected':
        return 'r';
      default:
        return 'i';
    }
  }

}