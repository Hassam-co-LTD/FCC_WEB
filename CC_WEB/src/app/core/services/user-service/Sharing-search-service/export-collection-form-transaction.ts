import { Injectable } from '@angular/core';
import { SharedService, TransactionBase } from '../shared-form-service/shared-service';

export interface ExportCollectionTransaction extends TransactionBase {
  collectionType?: string;
  drawerName?: string;
  draweeName?: string;
  shippingDetails?: any;
  collectionInstructions?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ExportCollectionService {
  constructor(private sharedService: SharedService) {}

  private generateId(): string {
    return `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getAllTransactions(): ExportCollectionTransaction[] {
    return this.sharedService.getAllTransactions()
      .filter(t => t.type === 'export-collection') as ExportCollectionTransaction[];
  }

  submitTransaction(formData: any): ExportCollectionTransaction {
    const transaction: ExportCollectionTransaction = {
      id: this.generateId(),
      type: 'export-collection',
      channelReference: `EXP${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      customerReference: `CUST${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      bankReference: `BNK${Date.now().toString().slice(-6)}`,
      issueDate: new Date(),
      status: 'Submitted',
      beneficiary: formData.DrawerDraweeDetails?.draweeName || 'Unknown',
      currency: formData.paymentamount?.currency || 'USD',
      amount: parseFloat(formData.paymentamount?.amount) || 0,
      outstandingAmount: parseFloat(formData.paymentamount?.amount) || 0,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      canEdit: false,
      canView: true,
      formData,
      submittedAt: new Date(),
      collectionType: formData.generaldetails?.collectionType,
      drawerName: formData.DrawerDraweeDetails?.drawerName,
      draweeName: formData.DrawerDraweeDetails?.draweeName,
      shippingDetails: formData.shippingdetails,
      collectionInstructions: formData.collectioninstructions
    };

    this.sharedService.addTransaction(transaction);
    return transaction;
  }
}