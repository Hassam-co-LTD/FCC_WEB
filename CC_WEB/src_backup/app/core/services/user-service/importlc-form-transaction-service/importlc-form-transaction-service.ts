import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { ImportLcTransaction } from '../../../../core/models/import-lc';

@Injectable({
  providedIn: 'root',
})
export class ImportlcFormTransactionService {
  // private readonly STORAGE_KEY = 'IMPORT_LC_TRANSACTIONS';
  /* ================= STATE ================= */
  private currentTransaction: ImportLcTransaction | null = null;
  private savetransactions$ = new BehaviorSubject<ImportLcTransaction[]>([]);
  transactionsStream$ = this.savetransactions$.asObservable();
  private readOnly = true;
  private viewMode: 'submit' | 'readonly' = 'submit';

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // if (this.isBrowser) {
    //   // this.loadFromStorage();
    // }
  }

  /* ================= addOrUpdateTransaction ================= */
  addOrUpdateTransaction(tx: ImportLcTransaction): void {
    const transactions = [...this.savetransactions$.value];
    const index = transactions.findIndex(t => t.tnxId === tx.tnxId);

    if (index > -1) {
      // Merge new data with existing transaction to avoid nulls
      transactions[index] = { ...transactions[index], ...tx };
    } else {
      transactions.push(tx);
    }

    this.savetransactions$.next(transactions);
    // this.persist(transactions);
  }

  /* ================= GETTERS ================= */

  getAllTransactions(): ImportLcTransaction[] {
    return this.savetransactions$.value;
  }
  getCurrentTransaction(): ImportLcTransaction | null {
    return this.currentTransaction;
  }
  getViewMode(): 'submit' | 'readonly' {
    return this.viewMode;
  }
  /* ================= SETTERS ================= */
  setCurrentTransaction(tx: ImportLcTransaction, readOnly = false): void {
    this.currentTransaction = tx;
    this.viewMode = readOnly ? 'readonly' : 'submit';
  }
  /* ================= STORAGE ================= */

  // private persist(transactions: ImportLcTransaction[]) {
  //   if (!this.isBrowser) return;
  //   // localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
  // }

  // private loadFromStorage() {
  //   // const stored = localStorage.getItem(this.STORAGE_KEY);
  //   if (!stored) return;

  //   const parsed: ImportLcTransaction[] = JSON.parse(stored).map((t: any) => ({
  //     ...t,
  //     createdOn: t.createdOn ? new Date(t.createdOn) : undefined,
  //     updatedOn: t.updatedOn ? new Date(t.updatedOn) : undefined,
  //   }));

  //   this.savetransactions$.next(parsed);
  // }
}
