import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

export interface Transaction {
  id: number;
  channelReference: string;
  customerReference: string;
  bankReference: string;
  issueDate: Date;
  status: string;
  beneficiary: string;
  currency: string;
  amount: number;
  outstandingAmount: number;
  expiryDate: Date;
  formData?: any;
}

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  // For current form data
  private formData = new BehaviorSubject<any>(null);
  currentData$ = this.formData.asObservable();

  // For storing all transactions
  private transactions = new BehaviorSubject<Transaction[]>([]);
  transactions$ = this.transactions.asObservable();

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    console.log('SharedService initialized - isBrowser:', this.isBrowser);
    
    // Load saved transactions from localStorage only in browser
    if (this.isBrowser) {
      this.loadTransactions();
    }
  }

  // ==================== FORM DATA METHODS ====================
  
  setFormData(data: any) {
    console.log('Setting form data:', data);
    this.formData.next(data);
  }

  getFormData() {
    const data = this.formData.value;
    return data;
  }

  clearFormData() {
    console.log('Clearing form data');
    this.formData.next(null);
  }

  // ==================== TRANSACTION METHODS ====================

  // Get all transactions (for search screen) - ADD THIS METHOD
  getAllTransactions(): Transaction[] {
    return this.transactions.value;
  }

  // Add a new transaction
  addTransaction(form: FormGroup) {
    console.log('=== START: Adding transaction ===');
    
    // Generate unique references
    const timestamp = Date.now();
    const channelRef = 'CH' + timestamp.toString().slice(-8);
    const customerRef = 'CUST' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const bankRef = 'BNK' + timestamp.toString().slice(-6);

    // Safely get form values
    const formValue = form.value || {};
    const undertakingDetails = formValue.undertakingDetails || {};
    const applicantBeneficiary = formValue.applicantBeneficiary || {};
    
    // Create transaction object
    const transaction: Transaction = {
      id: timestamp,
      channelReference: channelRef,
      customerReference: customerRef,
      bankReference: bankRef,
      issueDate: new Date(),
      status: 'Live',
      beneficiary: applicantBeneficiary.beneficiaryName || 'Unknown Beneficiary',
      currency: undertakingDetails.currency || 'USD',
      amount: parseFloat(undertakingDetails.undertakingAmount) || 0,
      outstandingAmount: parseFloat(undertakingDetails.undertakingAmount) || 0,
      expiryDate: undertakingDetails.expiryDate ? new Date(undertakingDetails.expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      formData: formValue
    };

    console.log('Created transaction:', transaction);

    // Add to existing transactions
    const currentTransactions = this.transactions.value;
    const updatedTransactions = [...currentTransactions, transaction];
    
    this.transactions.next(updatedTransactions);
    this.saveTransactions(updatedTransactions);
    
    console.log('Transaction added successfully. Total transactions:', updatedTransactions.length);
    
    return transaction;
  }

  // Search transactions
  searchTransactions(searchTerm: string, filters?: any): Transaction[] {
    console.log('Searching transactions:', { searchTerm, filters });
    
    let results = [...this.transactions.value];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(t =>
        t.channelReference.toLowerCase().includes(term) ||
        t.customerReference.toLowerCase().includes(term) ||
        t.bankReference.toLowerCase().includes(term) ||
        t.beneficiary.toLowerCase().includes(term) ||
        t.id.toString().includes(term)
      );
    }

    // Apply filters
    if (filters) {
      if (filters.channelReference) {
        results = results.filter(t => 
          t.channelReference.toLowerCase().includes(filters.channelReference.toLowerCase())
        );
      }
      
      if (filters.customerReference) {
        results = results.filter(t => 
          t.customerReference.toLowerCase().includes(filters.customerReference.toLowerCase())
        );
      }
      
      if (filters.bankReference) {
        results = results.filter(t => 
          t.bankReference.toLowerCase().includes(filters.bankReference.toLowerCase())
        );
      }
      
      if (filters.status) {
        results = results.filter(t => t.status === filters.status);
      }
      
      if (filters.currency) {
        results = results.filter(t => t.currency === filters.currency);
      }
      
      if (filters.fromDate) {
        results = results.filter(t => new Date(t.issueDate) >= new Date(filters.fromDate));
      }
      
      if (filters.toDate) {
        results = results.filter(t => new Date(t.issueDate) <= new Date(filters.toDate));
      }
      
      if (filters.minAmount !== null && filters.minAmount !== undefined) {
        results = results.filter(t => t.amount >= filters.minAmount);
      }
      
      if (filters.maxAmount !== null && filters.maxAmount !== undefined) {
        results = results.filter(t => t.amount <= filters.maxAmount);
      }
    }

    return results;
  }

  // Get transaction by ID
  getTransactionById(id: number): Transaction | undefined {
    return this.transactions.value.find(t => t.id === id);
  }

  // Get transaction by reference
  getTransactionByReference(reference: string): Transaction | undefined {
    return this.transactions.value.find(t => 
      t.channelReference === reference || 
      t.customerReference === reference || 
      t.bankReference === reference
    );
  }

  // Update transaction status
  updateTransactionStatus(id: number, status: string) {
    const transactions = this.transactions.value.map(t =>
      t.id === id ? { ...t, status } : t
    );
    this.transactions.next(transactions);
    this.saveTransactions(transactions);
  }

  // Clear all transactions
  clearAllTransactions() {
    console.log('Clearing all transactions');
    this.transactions.next([]);
    if (this.isBrowser) {
      localStorage.removeItem('lc_transactions');
    }
  }

  // ==================== PRIVATE METHODS ====================

  // Save transactions to localStorage
  private saveTransactions(transactions: Transaction[]) {
    if (!this.isBrowser) {
      console.log('Skipping localStorage save (not in browser)');
      return;
    }
    
    try {
      localStorage.setItem('lc_transactions', JSON.stringify(transactions));
      console.log('Saved transactions to localStorage:', transactions.length);
    } catch (error) {
      console.error('Error saving transactions to localStorage:', error);
    }
  }

  // Load transactions from localStorage
  private loadTransactions() {
    if (!this.isBrowser) {
      console.log('Skipping localStorage load (not in browser)');
      return;
    }
    
    try {
      const saved = localStorage.getItem('lc_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('Loaded transactions from localStorage:', parsed.length);
        
        // Convert date strings back to Date objects
        const transactions = parsed.map((t: any) => ({
          ...t,
          issueDate: new Date(t.issueDate),
          expiryDate: new Date(t.expiryDate)
        }));
        
        this.transactions.next(transactions);
      } else {
        console.log('No saved transactions found in localStorage');
      }
    } catch (error) {
      console.error('Error loading transactions from localStorage:', error);
    }
  }

  // Clear method
  clear() {
    this.formData.next(null);
    this.transactions.next([]);
  }

  // Helper to check if running in browser
  isRunningInBrowser(): boolean {
    return this.isBrowser;
  }

  // Helper method to add transaction directly (for mock data)
  addTransactionDirectly(transaction: Transaction) {
    const currentTransactions = this.transactions.value;
    const updatedTransactions = [...currentTransactions, transaction];
    this.transactions.next(updatedTransactions);
    this.saveTransactions(updatedTransactions);
    console.log('Transaction added directly:', transaction);
  }
}