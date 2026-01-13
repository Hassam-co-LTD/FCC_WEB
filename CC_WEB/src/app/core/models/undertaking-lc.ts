/**
 * Matches Java: RecordListDTO
 * Used for: Dashboard / Grid View (Lighter payload)
 */
export interface RecordListDTO {
  id: number;
  tnxId: string;
  channelReference?: string;
  status: string;
  lastUpdated: string; // ISO Date string
  productType?: string;
  beneficiaryName?: string;
  bankName?: string;
  currency?: string;
  undertakingAmount?: number;
}

/**
 * Matches Java: UndertakingLc (Entity)
 * Used for: Create, Update, View Details (Full Form)
 */
export interface UndertakingLc {
  id?: number;
  tnxId?: string;
  channelReference?: string;
  status?: string;
  rejectionReason?: string;

  // --- 1. General Details ---
  productType?: string;
  modeOfTransmission?: string;
  formOfUndertaking?: string;
  purpose?: string;

  // --- 2. Applicant & Beneficiary ---
  applicantName?: string;
  applicantAddress1?: string;
  applicantAddress2?: string;
  beneficiaryName?: string;
  beneficiaryCountry?: string;

  // --- 3. Bank Details ---
  issuanceType?: string;
  recipientBankName?: string;
  issuerReference?: string;
  bankName?: string;
  swift?: string;
  bankCountry?: string;

  // --- 4. Undertaking Terms ---
  typeOfUndertaking?: string;
  effectiveOption?: string;
  expiryType?: string;
  expiryDate?: string; // Format: 'yyyy-MM-dd'
  currency?: string;
  undertakingAmount?: number;
  variationPlus?: number;
  variationMinus?: number;
  issuanceCharges?: string;
  correspondentCharges?: string;
  basicExtensionType?: string;
  increaseDecreaseType?: string;
  supplementaryInfo?: string;

  // --- 5. Contract Details ---
  contractType?: string;
  contractDate?: string;
  contractCurrency?: string;
  contractAmount?: number;
  percentageCovered?: number;
  contractReference?: string;

  // --- 6. Legal & Rules ---
  applicableRules?: string;
  governingLawsType?: string;
  subdivision?: string;
  jurisdiction?: string;

  // --- 7. Options & Text ---
  demandOption?: string;
  tsOption?: string;
  languageType?: string;
  textOfUndertakingInfo?: string;
  underlyingTransactionInfo?: string;
  presentationInfo?: string;

  // --- 8. Instructions ---
  deliveryType?: string;
  deliveryMode?: string;
  deliveryTo?: string;
  principalAccount?: string;
  feeAccount?: string;
  otherInstructions?: string;
}