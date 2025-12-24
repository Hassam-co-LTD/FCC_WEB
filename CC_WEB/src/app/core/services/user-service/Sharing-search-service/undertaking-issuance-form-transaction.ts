import { Injectable } from '@angular/core';
import { SharedService, TransactionBase } from '../../../services/user-service/shared-form-service/shared-service';

export interface UndertakingTransaction extends TransactionBase {
  beneficiaryCountry?: string;
  isNew?: boolean;
  preference?: string;
  productType?: string;
  applicantName?: string;
  formOfUndertaking?: string;
  draftSavedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UndertakingIssuanceService {
  
  constructor(private sharedService: SharedService) {}

  private generateId(): string {
    return `UND-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getAllTransactions(): UndertakingTransaction[] {
    return this.sharedService.getAllTransactions()
      .filter(t => t.type === 'undertaking') as UndertakingTransaction[];
  }

  getTransactionById(id: string): UndertakingTransaction | undefined {
    const transaction = this.sharedService.getTransactionById(id);
    return transaction?.type === 'undertaking' ? transaction as UndertakingTransaction : undefined;
  }

  saveAsDraft(transactionData: Partial<UndertakingTransaction>): UndertakingTransaction {
    const transaction: UndertakingTransaction = {
      id: transactionData.id || this.generateId(),
      type: 'undertaking',
      channelReference: transactionData.channelReference || `DRAFT-${Date.now().toString().slice(-8)}`,
      customerReference: transactionData.customerReference || `CUST-${Date.now().toString().slice(-8)}`,
      bankReference: transactionData.bankReference || '',
      issueDate: transactionData.issueDate || new Date(),
      status: 'Draft',
      beneficiary: transactionData.beneficiary || '',
      beneficiaryCountry: transactionData.beneficiaryCountry || '',
      currency: transactionData.currency || 'USD',
      amount: transactionData.amount || 0,
      outstandingAmount: transactionData.outstandingAmount || transactionData.amount || 0,
      expiryDate: transactionData.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdAt: transactionData.createdAt || new Date(),
      updatedAt: new Date(),
      canEdit: true,
      canView: true,
      formData: transactionData.formData || {},
      draftSavedAt: new Date(),
      isNew: transactionData.isNew !== undefined ? transactionData.isNew : true,
      preference: transactionData.preference || 'Standard',
      productType: transactionData.productType || 'Performance Guarantee',
      applicantName: transactionData.applicantName || '',
      formOfUndertaking: transactionData.formOfUndertaking || 'Standby LC'
    };

    this.sharedService.addTransaction(transaction);
    return transaction;
  }

  submitForApproval(transactionData: Partial<UndertakingTransaction>): UndertakingTransaction {
    const transaction: UndertakingTransaction = {
      id: transactionData.id || this.generateId(),
      type: 'undertaking',
      channelReference: transactionData.channelReference || `PEND-${Date.now().toString().slice(-8)}`,
      customerReference: transactionData.customerReference || `CUST-${Date.now().toString().slice(-8)}`,
      bankReference: transactionData.bankReference || `BANK-${Date.now().toString().slice(-8)}`,
      issueDate: transactionData.issueDate || new Date(),
      status: 'Pending Approval',
      beneficiary: transactionData.beneficiary || '',
      beneficiaryCountry: transactionData.beneficiaryCountry || '',
      currency: transactionData.currency || 'USD',
      amount: transactionData.amount || 0,
      outstandingAmount: transactionData.outstandingAmount || transactionData.amount || 0,
      expiryDate: transactionData.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdAt: transactionData.createdAt || new Date(),
      updatedAt: new Date(),
      canEdit: false,
      canView: true,
      formData: transactionData.formData || {},
      submittedAt: new Date(),
      isNew: transactionData.isNew !== undefined ? transactionData.isNew : true,
      preference: transactionData.preference || 'Standard',
      productType: transactionData.productType || 'Performance Guarantee',
      applicantName: transactionData.applicantName || '',
      formOfUndertaking: transactionData.formOfUndertaking || 'Standby LC'
    };

    this.sharedService.addTransaction(transaction);
    return transaction;
  }

  // Complete updateTransaction method
  updateTransaction(id: string, updatedData: Partial<UndertakingTransaction>): boolean {
    const existingTransaction = this.getTransactionById(id);
    
    if (!existingTransaction) {
      console.error(`Transaction with id ${id} not found`);
      return false;
    }

    const updatedTransaction: UndertakingTransaction = {
      ...existingTransaction,
      ...updatedData,
      updatedAt: new Date()
    };

    return this.sharedService.updateTransaction(id, updatedTransaction);
  }

  // Complete updateStatus method with full data
  updateStatus(id: string, status: string, updatedData?: Partial<UndertakingTransaction>): boolean {
    const existingTransaction = this.getTransactionById(id);
    
    if (!existingTransaction) {
      console.error(`Transaction with id ${id} not found`);
      return false;
    }

    const updatedTransaction: UndertakingTransaction = {
      ...existingTransaction,
      status,
      canEdit: status === 'Draft',
      canView: true,
      updatedAt: new Date(),
      ...updatedData
    };

    return this.sharedService.updateTransaction(id, updatedTransaction);
  }

  // Method to update transaction with form data
  updateTransactionWithFormData(id: string, formData: any): boolean {
    const existingTransaction = this.getTransactionById(id);
    
    if (!existingTransaction) {
      console.error(`Transaction with id ${id} not found`);
      return false;
    }

    // Extract relevant data from formData to update transaction fields
    const updatedFields: Partial<UndertakingTransaction> = {
      formData: formData,
      updatedAt: new Date(),
      applicantName: formData?.applicantBeneficiary?.applicantName || existingTransaction.applicantName,
      beneficiary: formData?.applicantBeneficiary?.beneficiaryName || existingTransaction.beneficiary,
      beneficiaryCountry: formData?.applicantBeneficiary?.beneficiaryCountry || existingTransaction.beneficiaryCountry,
      currency: formData?.undertakingDetails?.currency || existingTransaction.currency,
      amount: Number(formData?.undertakingDetails?.undertakingAmount) || existingTransaction.amount,
      outstandingAmount: Number(formData?.undertakingDetails?.undertakingAmount) || existingTransaction.outstandingAmount,
      expiryDate: formData?.undertakingDetails?.expiryDate ? 
        new Date(formData.undertakingDetails.expiryDate) : 
        existingTransaction.expiryDate,
      productType: formData?.generalDetails?.productType || existingTransaction.productType,
      preference: formData?.generalDetails?.preference || existingTransaction.preference,
      formOfUndertaking: formData?.generalDetails?.formOfUndertaking || existingTransaction.formOfUndertaking
    };

    return this.updateTransaction(id, updatedFields);
  }

  deleteTransaction(id: string): boolean {
    return this.sharedService.deleteTransaction(id);
  }

  // Method to get transactions by status
  getTransactionsByStatus(status: string): UndertakingTransaction[] {
    return this.getAllTransactions().filter(t => t.status === status);
  }

  // Method to get pending transactions (for approval)
  getPendingTransactions(): UndertakingTransaction[] {
    return this.getAllTransactions().filter(t => 
      t.status === 'Pending Approval' || t.status === 'Pending at Bank'
    );
  }

  // Method to get draft transactions
  getDraftTransactions(): UndertakingTransaction[] {
    return this.getAllTransactions().filter(t => t.status === 'Draft');
  }

  // Method to get live transactions
  getLiveTransactions(): UndertakingTransaction[] {
    return this.getAllTransactions().filter(t => t.status === 'Live');
  }

  // Method to create a new transaction from form data
  createTransactionFromFormData(formData: any): UndertakingTransaction {
    const timestamp = Date.now();
    const channelRef = `UND-${timestamp.toString().slice(-6)}`;
    const customerRef = `CUST-${timestamp.toString().slice(-6)}`;

    const transactionData: Partial<UndertakingTransaction> = {
      channelReference: channelRef,
      customerReference: customerRef,
      bankReference: `BANK-${timestamp.toString().slice(-6)}`,
      issueDate: new Date(),
      status: 'Draft',
      beneficiary: formData?.applicantBeneficiary?.beneficiaryName || '',
      beneficiaryCountry: formData?.applicantBeneficiary?.beneficiaryCountry || '',
      currency: formData?.undertakingDetails?.currency || 'USD',
      amount: Number(formData?.undertakingDetails?.undertakingAmount) || 0,
      outstandingAmount: Number(formData?.undertakingDetails?.undertakingAmount) || 0,
      expiryDate: formData?.undertakingDetails?.expiryDate ? 
        new Date(formData.undertakingDetails.expiryDate) : 
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      productType: formData?.generalDetails?.productType || 'Performance Guarantee',
      preference: formData?.generalDetails?.preference || 'Standard',
      applicantName: formData?.applicantBeneficiary?.applicantName || '',
      formOfUndertaking: formData?.generalDetails?.formOfUndertaking || 'Standby LC',
      formData: formData,
      isNew: true
    };

    return this.saveAsDraft(transactionData);
  }

  // Method to accept/reject transaction
  processTransaction(id: string, action: 'accept' | 'reject', remarks?: string): boolean {
    const existingTransaction = this.getTransactionById(id);
    
    if (!existingTransaction) {
      console.error(`Transaction with id ${id} not found`);
      return false;
    }

    const newStatus = action === 'accept' ? 'Live' : 'Rejected';
    const updatedData: Partial<UndertakingTransaction> = {
      status: newStatus,
      canEdit: false,
      canView: true,
      updatedAt: new Date(),
      // Add remarks if provided
      ...(remarks && { remarks })
    };

    return this.updateStatus(id, newStatus, updatedData);
  }

  // Method to close a transaction
  closeTransaction(id: string): boolean {
    return this.updateStatus(id, 'Closed');
  }

  // Method to submit draft for approval
  submitDraftForApproval(id: string): boolean {
    const existingTransaction = this.getTransactionById(id);
    
    if (!existingTransaction) {
      console.error(`Transaction with id ${id} not found`);
      return false;
    }

    if (existingTransaction.status !== 'Draft') {
      console.error(`Transaction ${id} is not a draft, cannot submit for approval`);
      return false;
    }

    const updatedData: Partial<UndertakingTransaction> = {
      status: 'Pending Approval',
      canEdit: false,
      canView: true,
      submittedAt: new Date(),
      updatedAt: new Date()
    };

    return this.updateStatus(id, 'Pending Approval', updatedData);
  }

  // Method to check if transaction can be edited
  canEditTransaction(id: string): boolean {
    const transaction = this.getTransactionById(id);
    if (!transaction) return false;
    
    const editableStatuses = ['Draft', 'Pending Approval', 'Pending at Bank'];
    return editableStatuses.includes(transaction.status) && (transaction.canEdit ?? false);
  }

  // Method to check if transaction can be viewed
  canViewTransaction(id: string): boolean {
    const transaction = this.getTransactionById(id);
    if (!transaction) return false;
    
    return transaction.canView ?? false;
  }

  // Method to get statistics
  getStatistics(): {
    total: number;
    drafts: number;
    pending: number;
    live: number;
    rejected: number;
    closed: number;
  } {
    const transactions = this.getAllTransactions();
    
    return {
      total: transactions.length,
      drafts: transactions.filter(t => t.status === 'Draft').length,
      pending: transactions.filter(t => 
        t.status === 'Pending Approval' || t.status === 'Pending at Bank'
      ).length,
      live: transactions.filter(t => t.status === 'Live').length,
      rejected: transactions.filter(t => t.status === 'Rejected').length,
      closed: transactions.filter(t => t.status === 'Closed').length
    };
  }

  // Method to search transactions
  searchTransactions(searchTerm: string): UndertakingTransaction[] {
    const term = searchTerm.toLowerCase();
    return this.getAllTransactions().filter(t =>
      t.channelReference?.toLowerCase().includes(term) ||
      t.customerReference?.toLowerCase().includes(term) ||
      t.bankReference?.toLowerCase().includes(term) ||
      t.beneficiary?.toLowerCase().includes(term) ||
      t.applicantName?.toLowerCase().includes(term) ||
      t.productType?.toLowerCase().includes(term) ||
      t.id?.toLowerCase().includes(term)
    );
  }

  // Method to filter transactions by date range
  filterByDateRange(startDate: Date, endDate: Date): UndertakingTransaction[] {
    return this.getAllTransactions().filter(t => {
      const issueDate = new Date(t.issueDate);
      return issueDate >= startDate && issueDate <= endDate;
    });
  }

  // Method to filter transactions by amount range
  filterByAmountRange(minAmount: number, maxAmount: number): UndertakingTransaction[] {
    return this.getAllTransactions().filter(t => {
      const amount = t.amount || 0;
      return amount >= minAmount && amount <= maxAmount;
    });
  }
}