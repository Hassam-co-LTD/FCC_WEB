export interface TransferDTO {
  id?: number;
  tnxId?: string;
  companyId?: string;
  productType: string;
  transferFrom: string;
  transferTo: string;
  amount: number;
  currency: string;
  transferDate: Date;
  transactionRemarks?: string;
  TransactionId?: string;
  status: 'I' | 'S' | 'A' | 'R';
  rejectionReason?: string;
  createdOn?: Date;
  updatedOn?: Date;
}

export interface CreateTransferRequest {
  productType: string;
  transferFrom: string;
  transferTo: string;
  amount: number;
  currency: string;
  transferDate: Date;
  transactionRemarks?: string;
  TransactionId?: string;
}

export interface RecordsListTransferDTO {
  tnxId: string;
  createdOn: Date;
  productType: string;
  transferFrom: string;
  transferTo: string;
  amount: number;
  currency: string;
  transferDate: Date;
  status: string;
}

export const TRANSFER_STATUS = {
  DRAFT: 'I',
  SUBMITTED: 'S',
  APPROVED: 'A',
  REJECTED: 'R'
} as const;

export type TransferStatus = typeof TRANSFER_STATUS[keyof typeof TRANSFER_STATUS];

export interface AccountsMaster {
  accountNumber: string;
  accountName: string;
  accountType: string;
  currentBalance: number;
  currency: string;
  companyId: string;
  isActive: boolean;
  accessPolicyType: string;
  minApprovalLevel: number;
  maxTransferLimit: number;
  dailyTransferLimit: number;
  requiresDualAuthorization: boolean;
  allowedRoles: string;
  createdOn: Date;
  updatedOn: Date;
}

export interface AccountAccessPolicyDTO {
  accountNumber: string;
  userId: string;
  canView: boolean;
  canTransferFrom: boolean;
  canTransferTo: boolean;
  maxDailyLimit: number;
  requiresCoApproval: boolean;
  approvalThreshold: number;
}

export interface RolesMaster {
  roleId: number;
  roleCode: string;
  roleName: string;
  roleDescription: string;
  approvalLevel: number;
  canCreateAccounts: boolean;
  canEditAccounts: boolean;
  canDeleteAccounts: boolean;
  canViewAllAccounts: boolean;
  canTransferFunds: boolean;
  canApproveTransfers: boolean;
  canRejectTransfers: boolean;
  canSetAccessPolicies: boolean;
  maxTransferLimit: number;
  dailyTransferLimit: number;
  isActive: boolean;
  createdOn: Date;
  updatedOn: Date;
}