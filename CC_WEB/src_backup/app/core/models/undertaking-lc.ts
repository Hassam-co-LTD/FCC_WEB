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
    
    // Flattened summary fields for the grid
    productType?: string;
    beneficiaryName?: string;
    bankName?: string;
    currency?: string;
    undertakingAmount?: number;
}

/**
 * Matches Java: UndertakingLc (Entity)
 * Used for: Create, Update, View Details (Full Form)
 * Structure: Nested to match Angular Form Groups
 */
export interface UndertakingLc {
    id?: number; // Internal DB ID
    tnxId?: string; // Transaction Reference (e.g., REF-001)
    companyid?: string;
    channelReference?: string;
    status?: string; // I, S, A, R
    rejectionReason?: string;
    createdOn?: string; // Useful for sorting
    
    // Optional: If your backend wraps the form data in a 'formData' property, keep this.
    // If the object is flat (as implied by your snippet), this is not needed.
    formData?: UndertakingLc; 

    // Holds file metadata or base64 content
    attachments?: Array<{
        fileName: string;
        type: string;
        size: number;
        fileContent?: string; // Base64 if needed
        file?: File | Blob;   // If live object
    }>;

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
        address1?: string;
        address2?: string;
        address3?: string;
        country?: string; 
    };

    // --- Group 4: Undertaking Details ---
    undertakingDetails?: {
        // Core & Financials
        typeOfUndertaking?: string;
        effectiveOption?: string;
        expiryType?: string;
        expiryDate?: string; // ISO 'yyyy-MM-dd'
        currency?: string;
        undertakingAmount?: number;
        variationPlus?: number;
        variationMinus?: number;
        
        // Charges & Extensions
        issuanceCharges?: string;
        correspondentCharges?: string;
        basicextensionType?: string;   // Matches HTML casing
        increaseDecreaseType?: string;
        supplementaryInfo?: string;

        // Contract Info
        contractType?: string;
        contractDate?: string;
        contractCurrency?: string;
        contractAmount?: number;
        percentageCovered?: number;
        contractReference?: string;

        // Governance
        applicableRules?: string;
        governinglawsType?: string;    // Matches HTML casing
        subdivision?: string;
        jurisdiction?: string;

        // Terms & Text Standard
        DemandOption?: string;         // Matches HTML casing
        tsOption?: string;
        languageType?: string;
        
        // Narratives
        textofundertakingInfo?: string;     // Matches HTML casing
        underlyingtransactionInfo?: string; // Matches HTML casing
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
}

// Alias for compatibility with the Component code
export type UndertakingTransaction = UndertakingLc;