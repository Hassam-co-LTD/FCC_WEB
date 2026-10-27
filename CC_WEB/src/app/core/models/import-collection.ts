// Import Collection is received from the middleware and is preview-only in CC_WEB.
export interface ImportCollectionTransaction {
  id?: number;

  // Inquiry list columns
  customerReference?: string;
  advisingBankName?: string;
  issuerReference?: string;
  currency?: string;
  amount?: number;
  expiryDate?: Date;

  // Collection Details
  documentRelease?: string;
  productType?: string;
  receivedFromReference?: string;
  receivedOn?: string;
  collectionAmount?: string;
  sharedDirectory?: boolean;
  direct?: boolean;
  multiplePayment?: boolean;

  // Party Details
  receivedFrom?: string;
  receivedFromCode?: string;
  receivedFromName?: string;
  receivedFromCountry?: string;
  sendTo?: string;
  sendToCode?: string;
  sendToName?: string;
  drawerName?: string;
  drawerCode?: string;
  drawerCountry?: string;

  // Draft Details
  draftCollectionCurrency?: string;
  draftCollectionAmount?: string;
  draftAgainst?: string;
  draftIdentifier?: string;
  draftText?: string;
  draftAmount?: string;
  tenor?: string;

  // Interest (for late payment)
  interestRate?: string;
  interestStartDate?: string;
  interestEndPeriod?: string;
  startInterest?: string;
  dayBasis?: string;
  startFrom?: string;
  interestEndDate?: string;
  graceDays?: string;
  waiveIfRefused?: boolean;

  // Goods
  goodsCode?: string;
  goodsDescription?: string;
  shipmentFrom?: string;
  expectedDate?: string;
  shipmentTo?: string;
  vesselAircraft?: string;

  // General Instruction
  urcApply?: boolean;
  acknowledgeReceipt?: boolean;
  adviseNonAcceptance?: boolean;
  adviseAcceptance?: boolean;
  advisePayment?: boolean;
  adviseNonPayment?: boolean;
  holdDocumentsUntilArrivalOfGoods?: boolean;
  protestNonAcceptance?: boolean;
  protestNonPayment?: boolean;
  allowPartPayments?: boolean;

  // Dynamic Fields
  dynamicFields?: {
    fieldId: string | number;
    value: string;
  }[];

  // file is Base64 text when received from the backend
  attachments?: {
    id?: number;
    fileName: string;
    file: string | Blob;
  }[];

  // System fields
  status?: string; // "I", "S", "A", "R"
  tnxId?: string;
  companyId?: string;
  createdOn?: Date;
  updatedOn?: Date;
  createdBy?: string;
  updatedBy?: string;
  eventType?: string;
  eventRefNo?: string;
  eventSequence?: number;
  rejectionReason?: string;

  // Backoffice (bank settlement) response
  backofficeRefNo?: string;
  backofficeDate?: string;
}
