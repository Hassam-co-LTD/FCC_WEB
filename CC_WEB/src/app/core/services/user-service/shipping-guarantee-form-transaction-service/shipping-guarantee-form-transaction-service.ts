import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ShippingGuaranteeTransaction } from '../../../models/shipping-guarantee';

@Injectable({
  providedIn: 'root',
})
export class ShippingGuaranteeFormTransactionService {
   private currentTransaction: ShippingGuaranteeTransaction | null = null;
    private savetransactions$ = new BehaviorSubject<ShippingGuaranteeTransaction[]>([]);
  transactionsStream$ = this.savetransactions$.asObservable();
  private viewMode: 'submit' | 'readonly' = 'submit';
    /* ================= addOrUpdateTransaction ================= */
    // Want UI to reflect the updated transaction immediately without reloading from backend
    // client-side cache update
  // Used to avoid re-fetching from backend
  addOrUpdateTransaction(tx: ShippingGuaranteeTransaction): void {
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

      setCurrentTransaction(tx: ShippingGuaranteeTransaction, readOnly = false): void {
        this.currentTransaction = tx;
        this.viewMode = readOnly ? 'readonly' : 'submit';
      }
}
