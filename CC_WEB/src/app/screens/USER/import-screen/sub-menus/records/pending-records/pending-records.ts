import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import {
  ImportlcFormTransactionService,
  ImportLcTransaction
} from
  '../../../../../../core/services/user-service/importlc-form-transaction-service/importlc-form-transaction-service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pending-records',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './pending-records.html',
  styleUrls: ['./pending-records.scss']
})
export class PendingRecords implements OnInit {

  allTransactions: ImportLcTransaction[] = [];
  filteredTransactions: ImportLcTransaction[] = [];
  searchQuery = '';
  currencyFilter = '';
  activeTab = 'Pending';
  showAdvanced = false;

  tabs = [
    { key: 'live', label: 'Live' },
    { key: 'pending', label: 'Pending' },
    { key: 'draft', label: 'Draft' },
    { key: 'actions', label: 'Actions' },
    { key: 'pendingApproval', label: 'Pending Approval' },
    { key: 'pendingBank', label: 'Pending at Bank' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'closed', label: 'Closed' }
  ];

  currentPage = 1;
  itemsPerPage = 10;

  sortColumn: 'tnxId' | 'currency' | 'amount' | 'expiryDate' | 'createdAt' = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  private isBrowser: boolean;

  constructor(
    private transactionService: ImportlcFormTransactionService,
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /* ===================== INIT ===================== */
  ngOnInit(): void {
    if (!this.isBrowser) return;

    // initial load
    this.loadTransactions();

    // live updates from service
    this.transactionService.transactionsStream$.subscribe(tx => {
      this.allTransactions = tx;
      this.applyFilters();
    });
  }

  /* ===================== FILTERS ===================== */
  applyFilters(): void {
    const query = this.searchQuery.toLowerCase().trim();
    const currency = this.currencyFilter.toLowerCase().trim();

    const filtered = this.allTransactions.filter(tx => {
      const matchesTab = this.mapStatusToTab(tx.status) === this.activeTab;

      const matchesSearch =
        !query ||
        tx.tnxId?.toLowerCase().includes(query) ||
        tx.applicantForm?.beneficiaryName?.toLowerCase().includes(query) ||
        tx.bankForm?.issuingBankName?.toLowerCase().includes(query) ||
        tx.amountChargeForm?.currency?.toLowerCase().includes(query);

      const matchesCurrency =
        !currency ||
        tx.amountChargeForm?.currency?.toLowerCase() === currency;

      return matchesTab && matchesSearch && matchesCurrency;
    });

    this.applySorting(filtered);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.applyFilters();
  }

  getTabCount(tabKey: string): number {
    return this.allTransactions.filter(tx => this.mapStatusToTab(tx.status) === tabKey).length;
  }


  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  clearCurrency(): void {
    this.currencyFilter = '';
    this.applyFilters();
  }



  /* ===================== LOAD ===================== */
  private loadTransactions(): void {
    this.allTransactions = this.transactionService.getAllTransactions();
    this.applyFilters();
  }

  /* ===================== SORT ===================== */
  sortBy(column: typeof this.sortColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applyFilters();
  }

  private applySorting(source: ImportLcTransaction[] = this.allTransactions): void {
    const sorted = [...source].sort((a, b) => {
      const aVal = this.resolveColumn(a, this.sortColumn);
      const bVal = this.resolveColumn(b, this.sortColumn);

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
    this.currentPage = 1;
  }


  private resolveColumn(tx: ImportLcTransaction, column: string): any {
    switch (column) {
      case 'tnxId':
        return tx.tnxId;
      case 'currency':
        return tx.amountChargeForm?.currency;
      case 'amount':
        return tx.amountChargeForm?.amount;
      case 'expiryDate':
        return tx.generalDetails?.expiryDate;
      case 'createdAt':
        return tx.createdAt;
      default:
        return null;
    }
  }

  /* ===================== PAGINATION ===================== */
  get totalPages(): number {
    return Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
  }

  get pagedTransactions(): ImportLcTransaction[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTransactions.slice(start, start + this.itemsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  /* ===================== VIEW ===================== */
  viewTransaction(tx: ImportLcTransaction) {
    // this.transactionService.setCurrentTransaction(tx); 
    // this.router.navigate(['/import-screen/preview'], { state: { data: tx, isPending: true } });

    this.transactionService.setCurrentTransaction(tx);
    this.router.navigate(['/import-screen/preview'], {
      state: { isPending: true }
    });
  }


  private mapStatusToTab(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'draft':
        return 'draft';
      case 'live':
        return 'live';
      case 'actions':
        return 'actions';
      case 'pending approval':
        return 'pendingApproval';
      case 'pending at bank':
        return 'pendingBank';
      case 'rejected':
        return 'rejected';
      case 'closed':
        return 'closed';
      default:
        return '';
    }
  }

}
