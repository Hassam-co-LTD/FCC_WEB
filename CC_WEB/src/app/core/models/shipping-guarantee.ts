export interface ShippingGuaranteeTransaction{
    id?: number;

    expiryDate?: Date;

    //References
    beneficiaryReference?: string;
    customerReference?: string;
    //Guarantee Details
    billoflading?: string;
    modeOfShipment?: string;
    shippingDetails?: string;
    //Description of Goods
    description?: string;

    // Applicant
    applicantName?: string;
    applicantAddress1?: string;
    applicantAddress2?: string;
    applicantCountry?: string;
    // Beneficiary
    beneficiaryName?: string;
    beneficiaryAddress1?: string;
    beneficiaryAddress2?: string;
    beneficiaryCountry?: string;

    bankName?: string;
    issuerReference?: string;

    // Amount
    currency?: string;
    amount?: number;

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