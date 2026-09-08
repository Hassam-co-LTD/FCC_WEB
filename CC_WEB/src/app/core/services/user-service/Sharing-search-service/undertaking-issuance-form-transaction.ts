import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs';
import { UndertakingGuarantee } from '../../../models/undertaking-lc';

@Injectable({
  providedIn: 'root',
})
export class UndertakingIssuanceService {
  private currentTransaction: UndertakingGuarantee | null = null;
  private savetransactions$ = new BehaviorSubject<UndertakingGuarantee[]>([]);
  transactionsStream$ = this.savetransactions$.asObservable();
  private viewMode: 'submit' | 'readonly' = 'submit';
  /* ================= addOrUpdateTransaction ================= */
  addOrUpdateTransaction(tx: UndertakingGuarantee): void {
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
  
  getAllTransactions(): UndertakingGuarantee[] {
      return this.savetransactions$.value;
    }
  getCurrentTransaction(): UndertakingGuarantee | null {
      return this.currentTransaction;
    }
    getViewMode(): 'submit' | 'readonly' {
      return this.viewMode;
    }
    /* ================= SETTERS ================= */
  setCurrentTransaction(tx: UndertakingGuarantee, readOnly = false): void {
      this.currentTransaction = tx;
      this.viewMode = readOnly ? 'readonly' : 'submit';
    }
}