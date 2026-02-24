import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

// Services & Models
import { ApiService } from '../../../../../../../core/services/api.service';
import { RecordsListTransferDTO } from '../../../../../../../core/models/my-accounts';

@Component({
  selector: 'app-inquiry-of-myaccounts-records',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './inquiry-of-fundtransfer-records.html',
  styleUrls: ['./inquiry-of-fundtransfer-records.scss']
})
export class InquiryOfFundtransferRecords implements OnInit, OnDestroy {
  // Data State
  allTransactions: RecordsListTransferDTO[] = [];
  filteredTransactions: RecordsListTransferDTO[] = [];

  // UI State
  searchQuery = '';
  currencyFilter = '';
  activeTab = 'pending'; // Default
  showAdvanced = false;
  private routeSubscription?: Subscription;

  // Tabs Configuration
  tabs = [
    { key: 'pending', label: 'Pending' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' }
  ];

  // Pagination & Sorting
  currentPage = 1;
  itemsPerPage = 10;
  sortColumn: keyof RecordsListTransferDTO = 'createdOn';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // 1. Listen for Query Params (Handles redirects like ?tab=submitted)
    this.routeSubscription = this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
      this.loadTransactions();
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  /**
   * Fetches data from the backend based on the current tab's status code
   */
loadTransactions(): void {
  const backendStatus = this.mapTabToBackendStatus(this.activeTab);

  this.apiService.getTransferRecordsByStatus(backendStatus).subscribe({
    next: (transactions) => {
      console.log('Received Data:', transactions); // DEBUG: See if data actually arrives
      this.allTransactions = transactions || [];
      this.applyFilters();
    },
    error: (err) => {
      console.error('API Error:', err);
      this.allTransactions = [];
      this.filteredTransactions = [];
    }
  });
}

  /**
   * Status Mapping:
   * I = Pending/Draft
   * S = Submitted (Checker View)
   * A = Approved
   * R = Rejected
   */
  private mapTabToBackendStatus(tab: string): string {
    switch (tab) {
      case 'pending': return 'I';
      case 'submitted': return 'S';
      case 'approved': return 'A';
      case 'rejected': return 'R';
      default: return 'I';
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    // Update the URL without reloading, so the state is preserved if the user refreshes
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
    });
    this.currentPage = 1;
    this.loadTransactions();
  }

  // ==========================================
  // NAVIGATION
  // ==========================================

  /**
   * Called when clicking "View" or the TNX ID link
   * Redirects to the form which will handle screenMode based on status
   */
 viewTransaction(tx: RecordsListTransferDTO): void {
  // Redirects to the form in "View-Only" or "Edit" based on status logic above
  this.router.navigate(['/my-accounts/transfer', tx.tnxId]);
}

  // ==========================================
  // FILTERING & PAGINATION LOGIC
  // ==========================================

  applyFilters(): void {
    const query = this.searchQuery.toLowerCase().trim();
    const currency = this.currencyFilter.toLowerCase().trim();

    this.filteredTransactions = this.allTransactions.filter(tx => {
      const matchesSearch = !query ||
        tx.tnxId?.toLowerCase().includes(query) ||
        tx.productType?.toLowerCase().includes(query);

      const matchesCurrency = !currency ||
        tx.currency?.toLowerCase().includes(currency);

      return matchesSearch && matchesCurrency;
    });

    this.applySorting();
  }

  applySorting(): void {
    this.filteredTransactions.sort((a, b) => {
      const valA = a[this.sortColumn] ?? '';
      const valB = b[this.sortColumn] ?? '';
      const res = valA < valB ? -1 : valA > valB ? 1 : 0;
      return this.sortDirection === 'asc' ? res : -res;
    });
  }

  sortBy(column: keyof RecordsListTransferDTO): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  // --- Pagination Helpers ---
  get totalPages(): number {
    const count = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
    return count < 1 ? 1 : count;
  }

  get pagedTransactions(): RecordsListTransferDTO[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTransactions.slice(start, start + this.itemsPerPage);
  }

  previousPage(): void { if (this.currentPage > 1) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }
  trackByTnxId(index: number, tx: RecordsListTransferDTO): string { return tx.tnxId; }
}