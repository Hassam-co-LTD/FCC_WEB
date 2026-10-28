export interface ExportScreenTransaction {
  id?: number;

  // General Details
  customerReference?: string;
  advisingBankName?: string;
  issuerReference?: string;

  // Amount / Expiry (shown in inquiry lists)
  currency?: string;
  amount?: number;
  expiryDate?: Date;

  // Upload MT700 / MT701
  uploadFileName?: string;

  // Dynamic Fields
  dynamicFields?: {
    fieldId: string | number;
    value: string;
  }[];

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
