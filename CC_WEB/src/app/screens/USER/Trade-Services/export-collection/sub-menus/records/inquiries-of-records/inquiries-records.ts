import { Component, Inject, PLATFORM_ID, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import {ExportCollectionFormTransactionService} from '../../../../../../../core/services/user-service/export-collection-form-transaction-service/export-collection-form-transaction';

import { ExportCollectionTransaction } from "../../../../../../../core/models/export-collection";
import { ApiService } from '../../../../../../../core/services/api.service';
@Component({
  selector: 'app-inquiries-records',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './inquiries-records.html',
  styleUrls: ['./inquiries-records.scss']
})
export class InquiriesRecords implements OnInit {
  currentPage = 1;
  itemsPerPage = 10;
  allTransactions: ExportCollectionTransaction[] = [];
  filteredTransactions: ExportCollectionTransaction[] = [];
  showAdvanced = false;
  searchQuery = '';
  currencyFilter = '';
  activeTab = 'pending';
  tabs = [
    { key: 'live', label: 'Live' },
    { key: 'pending', label: 'Pending' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    // { key: 'response awaited', label: 'Response Awaited'}
  ];
  sortColumn: keyof ExportCollectionTransaction | 'currency' | 'amount' | 'expiryDate' | 'createdOn' = 'createdOn';
  sortDirection: 'asc' | 'desc' = 'desc';

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    private api: ApiService,
    private transactionService: ExportCollectionFormTransactionService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

 ngOnInit(): void {
  if (!this.isBrowser) return;

  this.loadTransactions();

  this.transactionService.transactionsStream$.subscribe(txList => {
    this.allTransactions = txList;
    this.applyFilters();
  });
}


  private loadTransactions(): void {
    if (this.activeTab === 'live') {

      this.api.getLiveEventHistoryExportCollection().subscribe({
        next: (txList) => {
          this.allTransactions = txList;
          this.applyFilters();
          // this.filteredTransactions = [...txList];
        },
        error: () => {
          this.allTransactions = [];
          this.filteredTransactions = [];
        }
      });

      return;
    }

    const backendStatus = this.mapTabToBackendStatus(this.activeTab);

    this.api.getRecordTransactionsByStatusExportCollection(backendStatus).subscribe({
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



  applyFilters(): void {
    const query = this.searchQuery.toLowerCase().trim();
    const currency = this.currencyFilter.toLowerCase().trim();

    const filtered = this.allTransactions.filter(tx => {

      const matchesSearch =
        !query ||
        tx.tnxId?.toLowerCase().includes(query) ||
        
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
  if (this.activeTab === tab) {
    return;
  }

  this.activeTab = tab;
  this.currentPage = 1;

  this.loadTransactions();
}

  // private loadByStatus(status: string): void {
  //   const backendStatus = this.mapTabToBackendStatus(status);
  //   this.api.getTransactionsByStatus(backendStatus).subscribe({
  //     next: (txList) => {
  //       this.allTransactions = txList;
  //       this.filteredTransactions = txList;
  //     },
  //     error: () => {
  //       this.allTransactions = [];
  //       this.filteredTransactions = [];
  //     }
  //   });
  // }


  // getTabCount(tabKey: string): number {
  //   return this.allTransactions.filter(tx => this.mapStatusToTab(tx.status!) === tabKey).length;
  // }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  // clearCurrency(): void {
  //   this.currencyFilter = '';
  //   this.applyFilters();
  // }

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

  get totalPages(): number {
    const count = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
    return count < 1 ? 1 : count;
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

  // viewTransaction(tx: ImportLcTransaction): void {
  //   this.transactionService.setCurrentTransaction(tx, true);
  //   this.router.navigate(['/import-screen/preview']);
  // }
  viewTransaction(tx: ExportCollectionTransaction): void {
    const readOnly = ['A', 'R'].includes(tx.status!);

    this.api.getTransactionByTnxIdExportCollection(tx.tnxId!).subscribe({
      next: (freshTx) => {
        this.transactionService.setCurrentTransaction(freshTx, readOnly);
        this.router.navigate(['dashboard/Trade-Services/export-collection/preview']);
      },
      error: () => {
        this.transactionService.setCurrentTransaction(tx, readOnly);
        this.router.navigate(['dashboard/Trade-Services/export-collection/preview']);
      }
    });
  }

  openExportCollection(tx: ExportCollectionTransaction) {
    if (this.activeTab === 'live') {
      // Live tab rows are event records — navigate by eventRefNo
      this.router.navigate(
        ['dashboard/Trade-Services/export-collection/amend', tx.tnxId],
        {
          queryParams: {
            mode: 'READ_ONLY',
            tab: 'live',
            eventRefNo: tx.eventRefNo ?? ''
          }
        }
      );
      return;
    }
    // Store transaction in service for import screen to pick up
    // this.transactionService.setCurrentTransaction(tx);
    const mode = this.resolveScreenMode(this.activeTab);
    // Navigate to import screen
    this.router.navigate(['dashboard/Trade-Services/export-collection', tx.tnxId], {
      state: {
        transaction: tx,
        // showUpdateSubmit: true // flag to show buttons
        mode : mode
      }
    });
  }

  trackByTnxId(_: number, tx: ExportCollectionTransaction): string {
    return tx.eventRefNo ?? tx.tnxId!;
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
