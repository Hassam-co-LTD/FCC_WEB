export interface UndertakingGuarantee {
  status?: string; // "I", "S", "A"
  tnxId?: string;
  companyId?: string;
  createdOn?: Date;
  updatedOn?: Date;
  eventType?: string;
  eventRefNo?: string;
  eventSequence?: number;
  // ================================
  // SYSTEM FIELDS
  // ================================
  id?: number;
  rejectionReason?: string;

  // ================================
  // 1. GENERAL DETAILS
  // ================================
  productType?: string;
  modeOfTransmission?: string;
  formOfUndertaking?: string;
  purpose?: string;

  // ================================
  // 2. APPLICANT
  // ================================
  applicantName?: string;
  applicantAddress1?: string;
  applicantAddress2?: string;
  applicantAddress3?: string;
  applicantAddress4?: string;
  applicantCountry?: string;

  // ================================
  // BENEFICIARY
  // ================================
  beneficiaryName?: string;
  beneficiaryAddress1?: string;
  beneficiaryAddress2?: string;
  beneficiaryAddress3?: string;
  beneficiaryAddress4?: string;
  beneficiaryCountry?: string;

  // ================================
  // 3. BANK DETAILS
  // ================================
  recipientBankName?: string;
  issuerReference?: string;
  issuanceType?: string;

  swiftcode?: string;

  bankName?: string;
  bankAddress1?: string;
  bankAddress2?: string;
  bankAddress3?: string;
  bankAddress4?: string;
  bankCountry?: string;

  // ================================
  // 4. UNDERTAKING TERMS
  // ================================
  typeOfUndertaking?: string;
  effectiveOption?: string;
  expiryType?: string;
  expiryDate?: Date;

  currency?: string;
  undertakingAmount?: number;
  variationPlus?: number;
  variationMinus?: number;

  issuanceCharges?: string;
  correspondentCharges?: string;
  supplementaryInfo?: string;
  basicExtensionType?: string;
  increaseDecreaseType?: string;

  // ================================
  // 5. CONTRACT DETAILS
  // ================================
  contractType?: string;
  contractDate?: Date;
  contractCurrency?: string;
  contractAmount?: number;
  percentageCovered?: number;
  contractNarrative?: string;

  // ================================
  // 6. LEGAL & RULES
  // ================================
  applicableRules?: string;
  governingLawsType?: string;
  countrySubdivision?: string;
  jurisdiction?: string;

  // ================================
  // 7. OPTIONS & TEXT
  // ================================
  demandOption?: string;
  tsOption?: string;
  languageType?: string;
  textOfUndertakingInfo?: string;
  underlyingTransactionInfo?: string;
  presentationInfo?: string;

  // ================================
  // 8. INSTRUCTIONS
  // ================================
  deliveryType?: string;
  deliveryMode?: string;
  deliveryTo?: string;
  principalAccount?: string;
  feeAccount?: string;
  otherInstructions?: string;
}