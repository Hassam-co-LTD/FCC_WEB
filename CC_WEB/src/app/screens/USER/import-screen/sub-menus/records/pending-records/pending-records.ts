import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import {
  ImportlcFormTransactionService,
  ImportLcTransaction
} from
  '../../../../../../core/services/user-service/importlc-form-transaction-service/importlc-form-transaction-service';

@Component({
  selector: 'app-pending-records',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './pending-records.html',
  styleUrls: ['./pending-records.scss']
})
export class PendingRecords implements OnInit {

  allTransactions: ImportLcTransaction[] = [];
  filteredTransactions: ImportLcTransaction[] = [];

  currentPage = 1;
  itemsPerPage = 10;

  sortColumn: 'tnxId' | 'currency' | 'amount' | 'expiryDate' | 'createdAt' = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  private isBrowser: boolean;

  constructor(
    private importLcService: ImportlcFormTransactionService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /* ===================== INIT ===================== */
  ngOnInit(): void {
    if (!this.isBrowser) return;

    // initial load
    this.loadTransactions();

    // live updates from service
    this.importLcService.transactionsStream$.subscribe(tx => {
      this.allTransactions = tx;
      this.applySorting();
    });
  }

  /* ===================== LOAD ===================== */
  private loadTransactions(): void {
    this.allTransactions = this.importLcService.getAllTransactions();
    this.applySorting();
  }

  /* ===================== SORT ===================== */
  sortBy(column: typeof this.sortColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  private applySorting(): void {
    const sorted = [...this.allTransactions].sort((a, b) => {
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
  viewTransaction(tx: ImportLcTransaction): void {
    alert(
      `Import LC Draft\n\n` +
      `TNX ID: ${tx.tnxId}\n` +
      `Beneficiary: ${tx.applicantForm?.beneficiaryName || '-'}\n` +
      `Issuing Bank: ${tx.bankForm?.issuingBankName || '-'}\n` +
      `Currency: ${tx.amountChargeForm?.currency || '-'}\n` +
      `Amount: ${tx.amountChargeForm?.amount || 0}\n` +
      `Status: ${tx.status}`
    );
  }
}
