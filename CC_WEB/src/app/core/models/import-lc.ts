export interface ImportLcTransaction {
    id?: number;

    // General
    productType?: string;
    modeOfTransmission?: string;
    expiryDate?: Date;
    placeOfExpiry?: string;
    featureIrrevocable?: boolean;
    featureRevolving?: boolean;
    featureTransferable?: boolean;
    applicableRules?: string;
    confirmationInstruction?: string;

    // Applicant
    applicantName?: string;
    applicantAddress1?: string;
    applicantAddress2?: string;
    applicantAddress3?: string;
    applicantCountry?: string;
    // Beneficiary
    beneficiaryName?: string;
    beneficiaryAddress1?: string;
    beneficiaryAddress2?: string;
    beneficiaryAddress3?: string;
    beneficiaryCountry?: string;

    // Bank
    issuingBankName?: string;
    issuerReference?: string;
    advisingBankName?: string;
    adviseThroughBankName?: string;

    // Amount
    currency?: string;
    amount?: number;
    variationType?: string;
    variationPlus?: number;
    variationMinus?: number;
    issuingBankCharges?: string;
    outsideCountryCharges?: string;
    additionalAmount?: string;

    // Payment
    creditAvailableWith?: string;
    bankName?: string;
    creditAvailableBy?: string;
    paymentDraftAt?: string;

    // Shipment
    shipmentFrom?: string;
    shipmentTo?: string;
    placeOfLoading?: string;
    placeOfDischarge?: string;
    lastShipmentDate?: Date;
    shipmentPeriodNarrative?: string;
    partialShipment?: string;
    transhipment?: string;

    // Narratives
    descriptionOfGoods?: string;
    documentsRequired?: string;
    additionalInstructions?: string;
    otherDetails?: string;

    // Instructions to Bank
    principalAccount?: string;
    feeAccount?: string;
    otherInstructions?: string;

    attachments?: {
        id?: number;
        fileName: string;
        file: string | Blob;
    }[];

    // System fields
    status?: string; // "I", "S", "A"
    tnxId?: string;
    companyId?: string;
    createdOn?: Date;
    updatedOn?: Date;
}
