import { Injectable } from '@angular/core';
import { ExportCollectionTransaction } from '../../../models/export-collection';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExportCollectionFormTransactionService {
  private currentTransaction: ExportCollectionTransaction | null = null;
  private savetransactions$ = new BehaviorSubject<ExportCollectionTransaction[]>([]);
    transactionsStream$ = this.savetransactions$.asObservable();
    private viewMode: 'submit' | 'readonly' = 'submit';
      /* ================= addOrUpdateTransaction ================= */
      // Want UI to reflect the updated transaction immediately without reloading from backend
      // client-side cache update
    // Used to avoid re-fetching from backend
  addOrUpdateTransaction(tx: ExportCollectionTransaction): void {
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
  
  setCurrentTransaction(tx: ExportCollectionTransaction, readOnly = false): void {
          this.currentTransaction = tx;
          this.viewMode = readOnly ? 'readonly' : 'submit';
        }
  
  getCurrentTransaction(): ExportCollectionTransaction | null {
            return this.currentTransaction;
          }
    getViewMode(): 'submit' | 'readonly' {
      return this.viewMode;
    }
}