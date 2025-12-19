import { Injectable } from '@angular/core';
import { SharedService, TransactionBase } from '../../../services/user-service/shared-form-service/shared-service';

export interface UndertakingTransaction extends TransactionBase {
  beneficiaryCountry?: string;
  isNew?: boolean;
  preference?: string;
  productType?: string;
  applicantName?: string;
  formOfUndertaking?: string;
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
      id: this.generateId(),
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
      createdAt: new Date(),
      updatedAt: new Date(),
      canEdit: true,
      canView: true,
      formData: transactionData.formData || {},
      draftSavedAt: new Date(),
      isNew: true,
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
      id: this.generateId(),
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
      createdAt: new Date(),
      updatedAt: new Date(),
      canEdit: false,
      canView: true,
      formData: transactionData.formData || {},
      submittedAt: new Date(),
      isNew: true,
      preference: transactionData.preference || 'Standard',
      productType: transactionData.productType || 'Performance Guarantee',
      applicantName: transactionData.applicantName || '',
      formOfUndertaking: transactionData.formOfUndertaking || 'Standby LC'
    };

    this.sharedService.addTransaction(transaction);
    return transaction;
  }

  updateStatus(id: string, status: string): boolean {
    return this.sharedService.updateTransaction(id, {
      status,
      canEdit: status === 'Draft',
      canView: true
    });
  }

  deleteTransaction(id: string): boolean {
    return this.sharedService.deleteTransaction(id);
  }
}