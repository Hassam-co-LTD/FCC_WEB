import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
export interface TransactionBase {

  id: string;
  type: 'undertaking' | 'export-collection' | 'shipping-guarantee';
  status: 'Draft' | 'Pending Approval' | 'Pending at Bank' | 'Live' | 'Rejected' | 'Closed' | 'Submitted';

  // --- References ---
  channelReference: string;
  customerReference?: string;
  bankReference?: string;

  // --- Financials ---
  beneficiary?: string;
  currency: string;
  amount: number;
  outstandingAmount?: number;

  // --- Dates ---
  issueDate: Date | string;
  expiryDate?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  submittedAt?: Date | string;

  // --- Permissions ---
  canEdit: boolean;
  canView: boolean;

  // --- Data Storage ---
  formData?: any; 

  collectionType?: string;
  drawerName?: string;
  draweeName?: string;
  shippingDetails?: any;
  collectionInstructions?: any;
}

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  // 1. Initialize with some dummy data for testing
  // private initialData: TransactionBase[] = [
  //   {
  //     id: '101',
  //     type: 'undertaking',
  //     status: 'Live',
  //     channelReference: 'UND-2023-001',
  //     customerReference: 'REF-A1',
  //     beneficiary: 'Acme Corp',
  //     currency: 'USD',
  //     amount: 50000,
  //     outstandingAmount: 50000,
  //     issueDate: new Date('2023-10-01'),
  //     createdAt: new Date('2023-10-01'),
  //     updatedAt: new Date('2023-10-05'),
  //     canEdit: false,
  //     canView: true,
  //     formData: {}
  //   },
  //   {
  //     id: '102',
  //     type: 'export-collection',
  //     status: 'Draft',
  //     channelReference: 'EXP-2023-099',
  //     customerReference: 'PO-999',
  //     beneficiary: 'Global Trade Ltd',
  //     currency: 'EUR',
  //     amount: 12500.50,
  //     outstandingAmount: 12500.50,
  //     issueDate: new Date('2023-11-15'),
  //     createdAt: new Date('2023-11-15'),
  //     updatedAt: new Date('2023-11-15'),
  //     canEdit: true,
  //     canView: true,
  //     formData: {},
  //     collectionType: 'DA',
  //     drawerName: 'Global Trade Ltd'
  //   }
  // ];

  // 2. BehaviorSubject holds the current state of transactions
  private transactionsSubject = new BehaviorSubject<TransactionBase[]>([]);

  // 3. Components subscribe to this Observable
  public transactions$ = this.transactionsSubject.asObservable();

  // Storage for passing data between pages (View/Edit)
  private formDataStore: any = null;

  constructor() { }

  // ==========================================================
  //  TRANSACTION MANAGEMENT
  // ==========================================================

  addTransaction(transaction: TransactionBase): void {
    const currentTransactions = this.transactionsSubject.value;

    // Ensure default timestamps
    const newTransaction = {
      ...transaction,
      createdAt: transaction.createdAt || new Date(),
      updatedAt: transaction.updatedAt || new Date()
    };

    // Add to the top of the list
    const updatedTransactions = [newTransaction, ...currentTransactions];

    this.transactionsSubject.next(updatedTransactions);
    console.log('Transaction added to SharedService:', newTransaction);
  }

  getAllTransactions(): TransactionBase[] {
    return this.transactionsSubject.value;
  }

  updateTransaction(id: string, updates: Partial<TransactionBase>): void {
    const currentTransactions = this.transactionsSubject.value;
    const index = currentTransactions.findIndex(t => t.id === id);

    if (index !== -1) {
      // Always update 'updatedAt' timestamp
      const timestampedUpdates = {
        ...updates,
        updatedAt: new Date()
      };

      const updatedTransactions = [...currentTransactions];
      updatedTransactions[index] = { ...updatedTransactions[index], ...timestampedUpdates };

      this.transactionsSubject.next(updatedTransactions);
    }
  }

  deleteTransaction(id: string): void {
    const currentTransactions = this.transactionsSubject.value;
    const updatedTransactions = currentTransactions.filter(t => t.id !== id);
    this.transactionsSubject.next(updatedTransactions);
  }

  // ==========================================================
  //  FORM DATA TRANSFER (View/Edit Routing)
  // ==========================================================

  setFormData(data: any): void {
    this.formDataStore = data;
  }

  getFormData(): any {
    return this.formDataStore;
  }

  clearFormData(): void {
    this.formDataStore = null;
  }
}