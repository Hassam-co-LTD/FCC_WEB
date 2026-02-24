// Matches Java com.crud.example.demo.dto.RecordListDTO
export interface RecordListDTO {
  id: number;
  tnxId: string;
  status: string;
  applicantName: string;
  beneficiaryName: string;
  currency: string;
  undertakingAmount: number;
  productType: string;
  updatedAt: string;        // ISO datetime
  issuerReference: string;
  expiryDate: string;       // ISO date (yyyy-MM-dd)
  rejectionReason?: string;
}
// Matches Java com.crud.example.demo.dto.UndertakingRequestDTO
// All fields are optional because the DTO is used for both partial updates and full save
export interface UndertakingRequestDTO {
  // Used only for UPDATE (optional for CREATE)
  id?: number;

  // --- GENERAL DETAILS ---
  productType?: string;
  modeOfTransmission?: string;
  formOfUndertaking?: string;
  purpose?: string;

  // --- APPLICANT & BENEFICIARY (full addresses) ---
  applicantName?: string;
  applicantAddress1?: string;
  applicantAddress2?: string;
  applicantAddress3?: string;
  beneficiaryName?: string;
  beneficiaryAddress1?: string;
  beneficiaryAddress2?: string;
  beneficiaryAddress3?: string;
  beneficiaryCountry?: string;

  // --- BANK DETAILS ---
  issuanceType?: string;
  recipientBankName?: string;
  issuerReference?: string;
  bankName?: string;
  swift?: string;
  bankCountry?: string;

  // --- INSTRUCTIONS ---
  deliveryType?: string;
  deliveryMode?: string;
  deliveryTo?: string;
  principalAccount?: string;
  feeAccount?: string;
  otherInstructions?: string;

  // --- UNDERTAKING DETAILS ---
  typeOfUndertaking?: string;
  effectiveOption?: string;
  expiryType?: string;
  expiryDate?: string;         // ISO date
  currency?: string;
  undertakingAmount?: number;
  variationPlus?: number;
  variationMinus?: number;

  // --- CHARGES & EXTENSIONS ---
  issuanceCharges?: string;
  correspondentCharges?: string;
  basicExtensionType?: string;
  increaseDecreaseType?: string;
  supplementaryInfo?: string;

  // --- CONTRACT INFORMATION ---
  contractType?: string;
  contractDate?: string;       // ISO date
  contractCurrency?: string;
  contractAmount?: number;
  percentageCovered?: number;
  contractReference?: string;

  // --- RULES & GOVERNANCE ---
  applicableRules?: string;
  governingLawsType?: string;
  subdivision?: string;
  jurisdiction?: string;

  // --- TERMS & TEXT STANDARD ---
  demandOption?: string;
  tsOption?: string;
  languageType?: string;

  // --- NARRATIVES ---
  textOfUndertakingInfo?: string;
  underlyingTransactionInfo?: string;
  presentationInfo?: string;

  // --- ATTACHMENTS (metadata) ---
  attachments?: any[];

  // --- SPECIAL: used only in rejectTransfer() ---
  rejectionReason?: string;
}

// Matches Java com.crud.example.demo.dto.UndertakingResponseDTO
// Contains ALL entity fields (system + business)
export interface UndertakingResponseDTO {
  // --- SYSTEM FIELDS ---
  id: number;
  tnxId: string;
  companyid: string;
  status: string;
  rejectionReason?: string;
  createdOn: string;   // ISO datetime
  updatedOn: string;   // ISO datetime

  // --- BUSINESS FIELDS (same as UndertakingRequestDTO) ---
  productType?: string;
  modeOfTransmission?: string;
  formOfUndertaking?: string;
  purpose?: string;

  applicantName?: string;
  applicantAddress1?: string;
  applicantAddress2?: string;
  applicantAddress3?: string;
  beneficiaryName?: string;
  beneficiaryAddress1?: string;
  beneficiaryAddress2?: string;
  beneficiaryAddress3?: string;
  beneficiaryCountry?: string;

  issuanceType?: string;
  recipientBankName?: string;
  issuerReference?: string;
  bankName?: string;
  swift?: string;
  bankCountry?: string;

  deliveryType?: string;
  deliveryMode?: string;
  deliveryTo?: string;
  principalAccount?: string;
  feeAccount?: string;
  otherInstructions?: string;

  typeOfUndertaking?: string;
  effectiveOption?: string;
  expiryType?: string;
  expiryDate?: string;
  currency?: string;
  undertakingAmount?: number;
  variationPlus?: number;
  variationMinus?: number;

  issuanceCharges?: string;
  correspondentCharges?: string;
  basicExtensionType?: string;
  increaseDecreaseType?: string;
  supplementaryInfo?: string;

  contractType?: string;
  contractDate?: string;
  contractCurrency?: string;
  contractAmount?: number;
  percentageCovered?: number;
  contractReference?: string;

  applicableRules?: string;
  governingLawsType?: string;
  subdivision?: string;
  jurisdiction?: string;

  demandOption?: string;
  tsOption?: string;
  languageType?: string;

  textOfUndertakingInfo?: string;
  underlyingTransactionInfo?: string;
  presentationInfo?: string;

  attachments?: any[];
}


// Keep this for your form structure – but with CORRECT camelCase names
export interface UndertakingFormModel {
  id?: number;
  tnxId?: string;
  companyid?: string;
  status?: string;
  rejectionReason?: string;
  createdOn?: string;
  updatedOn?: string;

  // --- Group 1: General Details ---
  generalDetails?: {
    productType?: string;
    modeOfTransmission?: string;
    formOfUndertaking?: string;
    purpose?: string;
  };

  // --- Group 2: Applicant & Beneficiary ---
  applicantBeneficiary?: {
    applicantName?: string;
    applicantAddress1?: string;
    applicantAddress2?: string;
    applicantAddress3?: string;
    beneficiaryName?: string;
    beneficiaryAddress1?: string;
    beneficiaryAddress2?: string;
    beneficiaryAddress3?: string;
    beneficiaryCountry?: string;
  };

  // --- Group 3: Bank Details ---
  bankForm?: {
    issuanceType?: string;
    recipientBankName?: string;
    issuerReference?: string;
    bankName?: string;
    swift?: string;
    bankCountry?: string;
  };

  // --- Group 4: Undertaking Details ---
  undertakingDetails?: {
    // Core
    typeOfUndertaking?: string;
    effectiveOption?: string;
    expiryType?: string;
    expiryDate?: string;
    currency?: string;
    undertakingAmount?: number;
    variationPlus?: number;
    variationMinus?: number;

    // Charges
    issuanceCharges?: string;
    correspondentCharges?: string;
    basicExtensionType?: string;
    increaseDecreaseType?: string;
    supplementaryInfo?: string;

    // Contract
    contractType?: string;
    contractDate?: string;
    contractCurrency?: string;
    contractAmount?: number;
    percentageCovered?: number;
    contractReference?: string;

    // Governance
    applicableRules?: string;
    governingLawsType?: string;
    subdivision?: string;
    jurisdiction?: string;

    // Terms & Text
    demandOption?: string;
    tsOption?: string;
    languageType?: string;

    // Narratives
    textOfUndertakingInfo?: string;
    underlyingTransactionInfo?: string;
    presentationInfo?: string;
  };

  // --- Group 5: Instructions ---
  instructions?: {
    deliveryType?: string;
    deliveryMode?: string;
    deliveryTo?: string;
    principalAccount?: string;
    feeAccount?: string;
    otherInstructions?: string;
  };

  attachments?: any[];
}

export interface UndertakingTransaction {
  id: number;
  tnxId: string;
  channelReference: string;
  status: string;
  lastUpdated: Date;
  companyId?: string;
  formData: UndertakingFormModel | null;
}