import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  ImportlcFormTransactionService,
} from '../../../../../../core/services/user-service/importlc-form-transaction-service/importlc-form-transaction-service';

import { ImportLcTransaction } from "../../../../../../core/models/import-lc";
import { ApiService } from '../../../../../../core/services/api.service';
@Component({
  selector: 'app-enquiries-of-records',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './enquiries-of-records.html',
  styleUrls: ['./enquiries-of-records.scss']
})
export class EnquiriesOfRecords implements OnInit {
  allTransactions: ImportLcTransaction[] = [];
  filteredTransactions: ImportLcTransaction[] = [];
  searchQuery = '';
  currencyFilter = '';
  activeTab = 'pending';
  showAdvanced = false;

  tabs = [
    // { key: 'live', label: 'Live' },
    { key: 'pending', label: 'Pending' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'response awaited', label: 'Response Awaited'}
  ];

  currentPage = 1;
  itemsPerPage = 10;

  sortColumn: keyof ImportLcTransaction | 'currency' | 'amount' | 'expiryDate' | 'createdOn' = 'createdOn';
  sortDirection: 'asc' | 'desc' = 'desc';

  private isBrowser: boolean;

  constructor(
    private api: ApiService,
    private transactionService: ImportlcFormTransactionService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.loadByStatus(this.activeTab);

    this.transactionService.transactionsStream$.subscribe(txList => {
      this.allTransactions = txList;
      this.applyFilters();
    }
  );
  }

  private loadTransactions(): void {
    this.api.getPendingTransactions().subscribe({
      next: (txList: ImportLcTransaction[]) => {
        this.allTransactions = txList;
        this.applyFilters();
      },
      error: () => {
        this.allTransactions = [];
        this.applyFilters();
      }
    });
  }


  applyFilters(): void {
    const query = this.searchQuery.toLowerCase().trim();
    const currency = this.currencyFilter.toLowerCase().trim();

    const filtered = this.allTransactions.filter(tx => {

      const matchesSearch =
        !query ||
        tx.tnxId?.toLowerCase().includes(query) ||
        tx.beneficiaryName?.toLowerCase().includes(query) ||
        tx.issuingBankName?.toLowerCase().includes(query) ||
        tx.currency?.toLowerCase().includes(query);

      const matchesCurrency =
        !currency || tx.currency?.toLowerCase() === currency;

      return matchesSearch && matchesCurrency;
    });

    this.applySorting(filtered);
  }

  // setActiveTab(tab: string): void {
  //   this.activeTab = tab;
  //   this.applyFilters();
  // }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadByStatus(tab);
  }

  private loadByStatus(status: string): void {
    const backendStatus = this.mapTabToBackendStatus(status);
    this.api.getTransactionsByStatus(backendStatus).subscribe({
      next: (txList) => {
        this.allTransactions = txList;
        this.filteredTransactions = txList;
      },
      error: () => {
        this.allTransactions = [];
        this.filteredTransactions = [];
      }
    });
  }


  // getTabCount(tabKey: string): number {
  //   return this.allTransactions.filter(tx => this.mapStatusToTab(tx.status!) === tabKey).length;
  // }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  clearCurrency(): void {
    this.currencyFilter = '';
    this.applyFilters();
  }

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
        ? (aVal).localeCompare((bVal))
        : (bVal).localeCompare((aVal));
    });

    this.filteredTransactions = sorted;
    this.currentPage = 1;
  }

  private resolveColumn(tx: ImportLcTransaction, column: string): any {
    switch (column) {
      case 'tnxId': return tx.tnxId;
      case 'currency': return tx.currency;
      case 'amount': return tx.amount;
      case 'expiryDate': return tx.expiryDate;
      case 'createdOn': return tx.createdOn;
      default: return null;
    }
  }

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

  viewTransaction(tx: ImportLcTransaction): void {
    this.transactionService.setCurrentTransaction(tx, true);
    this.router.navigate(['/import-screen/preview']);
  }
  openImportLc(tx: ImportLcTransaction) {
    // Store transaction in service for import screen to pick up
    // this.transactionService.setCurrentTransaction(tx);

    // Navigate to import screen
    this.router.navigate(['/import-screen', tx.tnxId], {
      state: {
        transaction: tx,
        showUpdateSubmit: true // flag to show buttons
      }
    });
  }

  trackByTnxId(_: number, tx: ImportLcTransaction): string {
    return tx.tnxId!;
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
