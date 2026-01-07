import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { ImportLcTransaction } from '../../../../core/models/import-lc';

@Injectable({
  providedIn: 'root',
})
export class ImportlcFormTransactionService {
  private readonly STORAGE_KEY = 'IMPORT_LC_TRANSACTIONS';
  /* ================= STATE ================= */
  private currentTransaction: ImportLcTransaction | null = null;
  private savetransactions$ = new BehaviorSubject<ImportLcTransaction[]>([]);
  transactionsStream$ = this.savetransactions$.asObservable();
  private readOnly = true;


  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      this.loadFromStorage();
    }
  }

  /* ================= TNX ID ================= */

  // private generateTnxId(): string {
  //   const now = new Date();

  //   const datePart =
  //     now.getFullYear().toString().slice(-2) +
  //     (now.getMonth() + 1).toString().padStart(2, '0') +
  //     now.getDate().toString().padStart(2, '0');

  //   const todayTx = this.savetransactions$.value
  //     .filter(t => t.tnxId.startsWith(`TNX${datePart}`))
  //     .sort(
  //       (a, b) =>
  //         parseInt(a.tnxId.slice(-6), 10) -
  //         parseInt(b.tnxId.slice(-6), 10)
  //     );

  //   const lastId = todayTx.length
  //     ? parseInt(todayTx[todayTx.length - 1].tnxId.slice(-6), 10)
  //     : 0;

  //   return `TNX${datePart}${(lastId + 1).toString().padStart(6, '0')}`;
  // }

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
    this.persist(transactions);
  }

  /* ================= SAVE ================= */

  // createTransaction(form: FormGroup): ImportLcTransaction {
  //   const value = form.value;

  //   const transaction: ImportLcTransaction = {
  //     tnxId: this.generateTnxId(),
  //     createdAt: new Date(),
  //     status: 'pending',

  //     generalDetails: value.generalDetails,
  //     applicantForm: value.applicantForm,
  //     bankForm: value.bankForm,
  //     amountChargeForm: value.amountChargeForm,
  //     paymentDetailsForm: value.paymentDetailsForm,
  //     shipmentForm: value.shipmentForm,
  //     narrativeForm: value.narrativeForm,
  //     instructionForm: value.instructionForm,
  //     attachments: value.attachments,
  //   };

  //   const updated = [...this.savetransactions$.value, transaction];
  //   this.savetransactions$.next(updated);
  //   this.persist(updated);

  //   this.currentTransaction = transaction;
  //   return transaction;
  // }

  /* ================= SUBMIT ================= */

  // addSubmitted(tnxId: string): ImportLcTransaction {
  //   const transactions = [...this.savetransactions$.value];
  //   const index = transactions.findIndex(t => t.tnxId === tnxId);

  //   if (index === -1) {
  //     throw new Error(`Transaction not found { tnxId: ${tnxId} }`);
  //   }

  //   if (transactions[index].status === 'submitted') {
  //     return transactions[index]; // idempotent
  //   }

  //   transactions[index] = {
  //     ...transactions[index],
  //     status: 'submitted',
  //   };

  //   this.savetransactions$.next(transactions);
  //   this.persist(transactions);

  //   return transactions[index];
  // }


  /* ================= UPDATE ================= */

  // updateTransaction(form: FormGroup): ImportLcTransaction {
  //   if (!this.currentTransaction) {
  //     throw new Error('No transaction selected for update');
  //   }

  //   const updatedTx: ImportLcTransaction = {
  //     ...this.currentTransaction,
  //     ...form.value,
  //   };

  //   const updatedList = this.savetransactions$.value.map(tx =>
  //     tx.tnxId === updatedTx.tnxId ? updatedTx : tx
  //   );

  //   this.savetransactions$.next(updatedList);
  //   this.persist(updatedList);

  //   this.currentTransaction = updatedTx;
  //   return updatedTx;
  // }

  /* ================= GETTERS ================= */

  getAllTransactions(): ImportLcTransaction[] {
    return this.savetransactions$.value;
  }

  // getTransactionByTnxId(tnxId: string): ImportLcTransaction | undefined {
  //   return this.savetransactions$.value.find(t => t.tnxId === tnxId);
  // }
  // getCurrentTransaction(): ImportLcTransaction | null {
  //   return this.currentTransaction;
  // }

  getCurrentTransaction(): ImportLcTransaction | null {
    return this.currentTransaction;
  }
  /* ================= SETTERS ================= */
  // setCurrentTransaction(tx: ImportLcTransaction) {
  //   this.currentTransaction = tx;
  // }

  setCurrentTransaction(tx: ImportLcTransaction, readOnly = false): void {
    this.currentTransaction = tx;
    this.readOnly = readOnly;
  }
  // clearCurrentTransaction() {
  //   this.currentTransaction = null;
  // }
  /* ================= STORAGE ================= */

  private persist(transactions: ImportLcTransaction[]) {
    if (!this.isBrowser) return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return;

    const parsed: ImportLcTransaction[] = JSON.parse(stored).map((t: any) => ({
      ...t,
      createdOn: t.createdOn ? new Date(t.createdOn) : undefined,
      updatedOn: t.updatedOn ? new Date(t.updatedOn) : undefined,
    }));

    this.savetransactions$.next(parsed);
  }

  // clearAllTransactions() {
  //   this.savetransactions$.next([]);
  //   if (this.isBrowser) {
  //     localStorage.removeItem(this.STORAGE_KEY);
  //   }
  // }

  // isReadOnly(): boolean {
  //   return this.readOnly;
  // }

  // clear(): void {
  //   this.readOnly = false;
  // }
}
