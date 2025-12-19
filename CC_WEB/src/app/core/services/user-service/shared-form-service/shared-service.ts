import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TransactionBase {
  id: string;
  type: 'undertaking' | 'export-collection' | 'shipping-guarantee';
  channelReference: string;
  customerReference: string;
  bankReference: string;
  issueDate: Date;
  status: string;
  beneficiary: string;
  currency: string;
  amount: number;
  outstandingAmount?: number;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  canEdit?: boolean;
  canView?: boolean;
  formData?: any;
  submittedAt?: Date;
  draftSavedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private formData = new BehaviorSubject<any>(null);
  private allTransactions = new BehaviorSubject<TransactionBase[]>([]);
  
  formData$: Observable<any> = this.formData.asObservable();
  transactions$: Observable<TransactionBase[]> = this.allTransactions.asObservable();
  
  private storageKey = 'allTransactions';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const transactions = parsed.map((t: any) => ({
          ...t,
          issueDate: new Date(t.issueDate),
          expiryDate: t.expiryDate ? new Date(t.expiryDate) : undefined,
          createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
          updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
          submittedAt: t.submittedAt ? new Date(t.submittedAt) : undefined,
          draftSavedAt: t.draftSavedAt ? new Date(t.draftSavedAt) : undefined
        }));
        this.allTransactions.next(transactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      this.allTransactions.next([]);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.allTransactions.getValue()));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }

  setFormData(data: any): void {
    this.formData.next(data);
  }

  getFormData(): any {
    return this.formData.value;
  }

  clearFormData(): void {
    this.formData.next(null);
  }

  hasFormData(): boolean {
    return !!this.formData.value;
  }

  // Transaction management methods
  getAllTransactions(): TransactionBase[] {
    return this.allTransactions.getValue();
  }

  addTransaction(transaction: TransactionBase): void {
    const current = this.allTransactions.getValue();
    const updated = [...current, transaction];
    this.allTransactions.next(updated);
    this.saveToStorage();
  }

  updateTransaction(id: string, updates: Partial<TransactionBase>): boolean {
    const current = this.allTransactions.getValue();
    const index = current.findIndex(t => t.id === id);
    
    if (index === -1) return false;
    
    const updated = [...current];
    updated[index] = { ...updated[index], ...updates, updatedAt: new Date() };
    this.allTransactions.next(updated);
    this.saveToStorage();
    return true;
  }

  deleteTransaction(id: string): boolean {
    const current = this.allTransactions.getValue();
    const updated = current.filter(t => t.id !== id);
    
    if (updated.length === current.length) return false;
    
    this.allTransactions.next(updated);
    this.saveToStorage();
    return true;
  }

  getTransactionById(id: string): TransactionBase | undefined {
    return this.allTransactions.getValue().find(t => t.id === id);
  }

  getTransactionsByType(type: string): TransactionBase[] {
    return this.allTransactions.getValue().filter(t => t.type === type);
  }

  clearAllTransactions(): void {
    this.allTransactions.next([]);
    localStorage.removeItem(this.storageKey);
  }
}