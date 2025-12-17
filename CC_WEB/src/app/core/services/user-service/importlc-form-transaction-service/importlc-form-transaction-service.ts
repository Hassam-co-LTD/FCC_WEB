import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

export interface ImportLcTransaction {
  tnxId: string;

  generalDetails?: any;
  applicantForm?: any;
  bankForm?: any;
  amountChargeForm?: any;
  paymentDetailsForm?: any;
  shipmentForm?: any;
  narrativeForm?: any;
  instructionForm?: any;
  attachments?: any[];

  createdAt: Date;
  status: 'Pending';
}
@Injectable({
  providedIn: 'root',
})
export class ImportlcFormTransactionService {
  private readonly STORAGE_KEY = 'IMPORT_LC_TRANSACTIONS';

  // current form snapshot (for preview)
  private formData$ = new BehaviorSubject<any>(null);
  currentData$ = this.formData$.asObservable();

  // all saved Import LC transactions
  private transactions$ = new BehaviorSubject<ImportLcTransaction[]>([]);
  transactionsStream$ = this.transactions$.asObservable();

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      this.loadFromStorage();
    }
  }

  /* ================= FORM DATA ================= */

  setFormData(data: any) {
    this.formData$.next(data);
  }

  getFormData() {
    return this.formData$.value;
  }

  clearFormData() {
    this.formData$.next(null);
  }

  /* ================= IMPORT LC SAVE ================= */

  saveImportLc(form: FormGroup): ImportLcTransaction {
    const value = form.value;

    const transaction: ImportLcTransaction = {
      tnxId: this.generateTnxId(),

      generalDetails: value.generalDetails,
      applicantForm: value.applicantForm,
      bankForm: value.bankForm,
      amountChargeForm: value.amountChargeForm,
      paymentDetailsForm: value.paymentDetailsForm,
      shipmentForm: value.shipmentForm,
      narrativeForm: value.narrativeForm,
      instructionForm: value.instructionForm,
      attachments: value.attachments,

      createdAt: new Date(),
      status: 'Pending',
    };

    const updated = [...this.transactions$.value, transaction];
    this.transactions$.next(updated);
    this.persist(updated);

    return transaction;
  }

  /* ================= GETTERS ================= */

  getAllTransactions(): ImportLcTransaction[] {
    return this.transactions$.value;
  }

  getTransactionByTnxId(tnxId: string): ImportLcTransaction | undefined {
    return this.transactions$.value.find(t => t.tnxId === tnxId);
  }

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
      createdAt: new Date(t.createdAt),
    }));

    this.transactions$.next(parsed);
  }

  clearAllTransactions() {
    this.transactions$.next([]);
    if (this.isBrowser) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /* ================= TNX ID ================= */

  private generateTnxId(): string {
    const now = new Date();
    return (
      'TNX-' +
      now.getFullYear().toString().slice(-2) +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      '-' +
      Math.floor(100000 + Math.random() * 900000)
    );
  }

}
