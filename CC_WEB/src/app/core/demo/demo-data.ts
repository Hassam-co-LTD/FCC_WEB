/**
 * Seed data for the demo build (environment.demoMode).
 *
 * Every record here is fictional. Dates are relative to "today" so the
 * dashboard calendar and recent activity always have something to show.
 */

export type DemoDb = Record<string, any[]>;

export interface DemoAccount {
  loginId: string;
  companyId: string;
  password: string;
  label: string;
  userName: string;
  userCategory: 'A' | 'U';
  companyType: 'B' | 'C';
}

export const DEMO_PASSWORD = 'demo123';

/** Users shown on the login screen. companyType/userCategory pick the portal. */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    loginId: 'user',
    companyId: 'CORP',
    password: DEMO_PASSWORD,
    label: 'Corporate user (Trade & Payments)',
    userName: 'Sara Ahmed',
    userCategory: 'U',
    companyType: 'C',
  },
  {
    loginId: 'admin',
    companyId: 'ADMIN',
    password: DEMO_PASSWORD,
    label: 'Administrator (Masters & Setup)',
    userName: 'Ali Raza',
    userCategory: 'A',
    companyType: 'C',
  },
  {
    loginId: 'bank',
    companyId: 'BANK',
    password: DEMO_PASSWORD,
    label: 'Bank officer (Customer users)',
    userName: 'Usman Khan',
    userCategory: 'U',
    companyType: 'B',
  },
];

/** Every permission the screens check, so demo users can see every action. */
export const DEMO_PERMISSIONS = [
  'EC_Amend', 'EC_AmendApprove', 'EC_AmendPendingReject', 'EC_AmendPreviewDownload',
  'EC_AmendPreviewSubmit', 'EC_AmendSave', 'EC_AmendSubmit', 'EC_AmendUpdateReject',
  'EC_Create', 'EC_CreateSave', 'EC_CreateSubmit', 'EC_Inquiry', 'EC_InquiryApprove',
  'EC_InquiryPendingUpdate', 'EC_InquiryReject', 'EC_InquiryRejectUpdate', 'EC_InquirySubmit',
  'ILCAmendPreview', 'ILC_Amend', 'ILC_AmendApprove', 'ILC_AmendPendingReject',
  'ILC_AmendPreview', 'ILC_AmendReject', 'ILC_AmendSave', 'ILC_AmendSubmit',
  'ILC_AmendUpdateReject', 'ILC_CreateSave', 'ILC_InquiryApprove', 'ILC_InquiryPendingUpdate',
  'ILC_InquiryPreview', 'ILC_InquiryReject', 'ILC_InquiryRejectUpdate', 'ILC_InquirySubmit',
  'SG_Amend', 'SG_AmendApprove', 'SG_AmendPendingReject', 'SG_AmendReject', 'SG_AmendSave',
  'SG_AmendSubmit', 'SG_AmendUpdateReject', 'SG_Create', 'SG_CreateSave', 'SG_Inquiry',
  'SG_InquiryPendingUpdate', 'SG_InquiryPreview', 'SG_InquiryReject', 'SG_InquiryRejectUpdate',
  'SG_InquirySubmit', 'UI_AmendApprove', 'UI_AmendPreview', 'UI_AmendPreviewApprove',
  'UI_AmendPreviewReject', 'UI_AmendPreviewSubmit', 'UI_AmendSave', 'UI_AmendSubmit',
  'UI_CreateSave', 'UI_InquiryApprove', 'UI_InquiryPendingUpdate', 'UI_InquiryPreview',
  'UI_InquiryReject', 'UI_InquiryRejectUpdate', 'UI_InquirySubmit', 'UTG_Amend',
  'UTG_AmendPreviewApprove', 'UTG_AmendPreviewReject', 'UTG_AmendPreviewSubmit', 'UTG_Inquiry',
];

export const CAPTCHA = {
  question: 'Select the item that is a currency',
  items: ['Dollar', 'Tiger', 'Mountain', 'Laptop'],
  answer: 'Dollar',
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/** Date-only value (yyyy-MM-dd), the way the backend returns LocalDate fields. */
export function dateFromNow(days: number): string {
  return daysFromNow(days).slice(0, 10);
}

const audit = (status: string, ageDays: number) => ({
  recordStatus: status,
  createdBy: 'admin',
  createdOn: daysFromNow(-ageDays),
  updatedBy: 'admin',
  updatedOn: daysFromNow(-Math.max(ageDays - 1, 0)),
  inputterId: 'admin',
  inputterDttm: daysFromNow(-ageDays),
  authorizerId: status === 'A' ? 'checker' : null,
  authorizerDttm: status === 'A' ? daysFromNow(-Math.max(ageDays - 1, 0)) : null,
  rejectReason: status === 'R' ? 'Incomplete details, please review and resubmit.' : null,
  rejectedBy: status === 'R' ? 'checker' : null,
  rejectedOn: status === 'R' ? daysFromNow(-Math.max(ageDays - 1, 0)) : null,
});

/** Admin masters: A, A, I, S, A, A, I, ... so every inquiry tab has rows. */
const statusFor = (i: number) => ['A', 'A', 'I', 'S'][i % 4];

const STATUSES = ['A', 'A', 'S', 'I', 'R', 'A', 'S', 'I'];

const COUNTERPARTIES = [
  { name: 'Shanghai Textile Exports Ltd', country: 'CN', city: 'Shanghai' },
  { name: 'Hamburg Machinery GmbH', country: 'DE', city: 'Hamburg' },
  { name: 'Dubai Steel Trading LLC', country: 'AE', city: 'Dubai' },
  { name: 'Osaka Electronics Co.', country: 'JP', city: 'Osaka' },
  { name: 'Istanbul Cotton Mills', country: 'TR', city: 'Istanbul' },
  { name: 'Rotterdam Agro BV', country: 'NL', city: 'Rotterdam' },
  { name: 'Chicago Medical Supplies Inc', country: 'US', city: 'Chicago' },
  { name: 'Milan Leather SpA', country: 'IT', city: 'Milan' },
];

const BANKS = [
  'Bank of China, Shanghai Branch',
  'Deutsche Bank AG, Hamburg',
  'Emirates NBD, Dubai',
  'MUFG Bank, Osaka',
  'HSBC Bank plc, London',
];

const CURRENCIES = ['USD', 'EUR', 'AED', 'JPY', 'GBP', 'USD', 'EUR', 'USD'];
const GOODS = [
  'Cotton yarn 30s combed, 40 MT',
  'CNC milling machines, 4 units',
  'Hot rolled steel coils, 500 MT',
  'Industrial control panels, 120 sets',
  'Raw cotton bales, 200 bales',
  'Fresh produce, refrigerated containers',
  'Surgical instruments and consumables',
  'Finished leather hides, 3,000 sq ft',
];

const applicant = {
  applicantName: 'Crescent Traders (Pvt) Ltd',
  applicantAddress1: 'Plot 21, Industrial Area',
  applicantAddress2: 'Korangi',
  applicantAddress3: 'Karachi',
  applicantAddress4: '',
  applicantCountry: 'PK',
};

function system(prefix: string, i: number, status: string, ageDays: number) {
  return {
    id: i + 1,
    tnxId: `${prefix}${String(240100 + i)}`,
    companyId: 'CORP',
    status,
    createdOn: daysFromNow(-ageDays),
    updatedOn: daysFromNow(-Math.max(ageDays - 1, 0)),
    createdBy: 'user',
    updatedBy: 'user',
    eventType: 'NEW',
    eventSequence: 0,
    rejectionReason: status === 'R' ? 'Beneficiary address does not match the proforma invoice.' : undefined,
    backofficeRefNo: status === 'A' ? `BO-${prefix}-${9000 + i}` : undefined,
    backofficeDate: status === 'A' ? daysFromNow(-Math.max(ageDays - 2, 0)) : undefined,
    dynamicFields: [],
    attachments: [],
  };
}

function beneficiary(i: number) {
  const c = COUNTERPARTIES[i % COUNTERPARTIES.length];
  return {
    beneficiaryName: c.name,
    beneficiaryAddress1: `${10 + i} Harbour Road`,
    beneficiaryAddress2: c.city,
    beneficiaryAddress3: '',
    beneficiaryAddress4: '',
    beneficiaryCountry: c.country,
  };
}

const amountFor = (i: number) => [125000, 48500, 310000, 76250, 22000, 189900, 64000, 405000][i % 8];

/* ------------------------------------------------------------------ */
/* Trade & payment transactions                                        */
/* ------------------------------------------------------------------ */

function importLcs() {
  return Array.from({ length: 8 }, (_, i) => ({
    ...system('ILC', i, STATUSES[i], i * 3),
    productType: 'Import LC',
    modeOfTransmission: 'SWIFT',
    expiryDate: dateFromNow(i === 4 ? -5 : 30 + i * 12),
    placeOfExpiry: 'Karachi',
    featureIrrevocable: true,
    featureRevolving: false,
    featureTransferable: i % 3 === 0,
    applicableRules: 'UCP Latest Version',
    confirmationInstruction: 'Without',
    ...applicant,
    ...beneficiary(i),
    issuingBankName: 'FCC Demo Bank',
    customerReference: `PO-2026-${310 + i}`,
    issuerReference: `ISS-${7700 + i}`,
    advisingBankName: BANKS[i % BANKS.length],
    adviseThroughBankName: '',
    currency: CURRENCIES[i],
    amount: amountFor(i),
    variationType: 'Percentage',
    variationPlus: 5,
    variationMinus: 5,
    issuingBankCharges: 'Applicant',
    outsideCountryCharges: 'Beneficiary',
    creditAvailableWith: 'Any Bank',
    bankName: BANKS[i % BANKS.length],
    creditAvailableBy: 'Payment',
    paymentDraftAt: 'Sight',
    shipmentFrom: COUNTERPARTIES[i % 8].city,
    shipmentTo: 'Karachi',
    placeOfLoading: `Port of ${COUNTERPARTIES[i % 8].city}`,
    placeOfDischarge: 'Port Qasim, Karachi',
    lastShipmentDate: dateFromNow(20 + i * 10),
    partialShipment: 'Allowed',
    transhipment: 'Not Allowed',
    descriptionOfGoods: GOODS[i],
    documentsRequired: 'Commercial invoice in 3 originals; full set of clean on board bills of lading; packing list; certificate of origin.',
    additionalInstructions: 'All documents must mention the LC number.',
    principalAccount: '0100-2233445-01',
    feeAccount: '0100-2233445-01',
  }));
}

function shippingGuarantees() {
  return Array.from({ length: 6 }, (_, i) => ({
    ...system('SG', i, STATUSES[i + 1], i * 4 + 2),
    expiryDate: dateFromNow(i === 3 ? -2 : 45 + i * 7),
    beneficiaryReference: `BEN-${5100 + i}`,
    customerReference: `SG-REF-${880 + i}`,
    billoflading: `BL-${COUNTERPARTIES[i].country}-${447000 + i}`,
    modeOfShipment: i % 2 ? 'Air' : 'Sea',
    shippingDetails: `Vessel MSC ${['Aurora', 'Helena', 'Nova', 'Bella', 'Orion', 'Vega'][i]}`,
    description: GOODS[i],
    ...applicant,
    ...beneficiary(i),
    bankName: BANKS[i % BANKS.length],
    issuerReference: `SGI-${3300 + i}`,
    currency: CURRENCIES[i],
    amount: amountFor(i + 2),
    principalAccount: '0100-2233445-01',
    feeAccount: '0100-2233445-01',
  }));
}

function exportCollections() {
  return Array.from({ length: 6 }, (_, i) => {
    const c = COUNTERPARTIES[(i + 3) % 8];
    return {
      ...system('EC', i, STATUSES[(i + 2) % 8], i * 3 + 2),
      eventSequence: '0',
      collectionType: i % 2 ? 'Documents against Acceptance' : 'Documents against Payment',
      customerReference: `INV-EXP-${640 + i}`,
      draweeReference: `DRW-${2100 + i}`,
      drawerName: 'Crescent Traders (Pvt) Ltd',
      drawerAddress1: 'Plot 21, Industrial Area',
      drawerAddress2: 'Karachi',
      draweeName: c.name,
      draweeAddress1: `${30 + i} Market Street`,
      draweeAddress2: c.city,
      remittingBankName: 'FCC Demo Bank',
      issuerReference: `ECI-${4400 + i}`,
      principalAccount: '0100-2233445-01',
      feeAccount: '0100-2233445-01',
      presentingBankName: BANKS[(i + 1) % BANKS.length],
      collectingBankName: BANKS[(i + 2) % BANKS.length],
      swiftCode: ['BKCHCNBJ', 'DEUTDEHH', 'EBILAEAD', 'BOTKJPJT', 'MIDLGB22'][i % 5],
      currency: CURRENCIES[(i + 1) % 8],
      amount: amountFor(i + 1),
      paymentType: i % 2 ? 'Usance' : 'Sight',
      tenor: i % 2 ? '90 days from B/L date' : 'At sight',
      shippingMethod: 'Sea',
      shipmentReference: `SHP-${7800 + i}`,
      shippingFrom: 'Karachi',
      shippingTo: c.city,
      shipmentDate: dateFromNow(-i),
      applicableRule: 'URC 522',
      incotermsRules: 'Incoterms 2020',
      incoterms: 'FOB',
      waiveAllChargesIfRefusedByDrawee: false,
      protestInCaseOfNonPayment: true,
      protestInCaseOfNonAcceptance: false,
      openingCharges: 'DRAWER',
      outsideCountryCharges: 'DRAWEE',
    };
  });
}

function undertakings() {
  return Array.from({ length: 6 }, (_, i) => ({
    ...system('UTG', i, STATUSES[(i + 3) % 8], i * 5),
    productType: 'Guarantee',
    modeOfTransmission: 'SWIFT',
    formOfUndertaking: 'Demand Guarantee',
    purpose: ['Performance', 'Advance Payment', 'Bid Bond', 'Retention', 'Payment', 'Warranty'][i],
    ...applicant,
    ...beneficiary(i + 2),
    recipientBankName: BANKS[i % BANKS.length],
    issuerReference: `UTGI-${6600 + i}`,
    issuanceType: 'Direct',
    swiftcode: 'FCCDPKKA',
    bankName: 'FCC Demo Bank',
    bankCountry: 'PK',
    typeOfUndertaking: ['Performance Bond', 'Advance Payment Guarantee', 'Bid Bond', 'Retention Bond', 'Payment Guarantee', 'Warranty Bond'][i],
    effectiveOption: 'Issuance Date',
    expiryType: 'Fixed',
    expiryDate: dateFromNow(i === 2 ? -10 : 90 + i * 30),
    currency: CURRENCIES[(i + 2) % 8],
    undertakingAmount: amountFor(i + 4),
    variationPlus: 0,
    variationMinus: 0,
    issuanceCharges: 'Applicant',
    correspondentCharges: 'Beneficiary',
    contractType: 'Supply Contract',
    contractDate: dateFromNow(-40 - i),
    contractCurrency: CURRENCIES[(i + 2) % 8],
    contractAmount: amountFor(i + 4) * 10,
    percentageCovered: 10,
    applicableRules: 'URDG 758',
    governingLawsType: 'Pakistan',
    jurisdiction: 'Karachi',
    demandOption: 'Complying demand',
    languageType: 'English',
    deliveryType: 'SWIFT',
    deliveryMode: 'Electronic',
    principalAccount: '0100-2233445-01',
    feeAccount: '0100-2233445-01',
  }));
}

function exportLcs() {
  return Array.from({ length: 5 }, (_, i) => ({
    ...system('ELC', i, STATUSES[i + 2], i * 4 + 3),
    customerReference: `ELC-REF-${120 + i}`,
    advisingBankName: BANKS[(i + 3) % BANKS.length],
    issuerReference: `ELCI-${2200 + i}`,
    currency: CURRENCIES[(i + 4) % 8],
    amount: amountFor(i + 5),
    expiryDate: dateFromNow(25 + i * 15),
    beneficiaryName: 'Crescent Traders (Pvt) Ltd',
    applicantName: COUNTERPARTIES[(i + 5) % 8].name,
  }));
}

function importCollections() {
  return Array.from({ length: 5 }, (_, i) => {
    const c = COUNTERPARTIES[(i + 1) % 8];
    return {
      ...system('IC', i, STATUSES[(i + 4) % 8], i * 3 + 2),
      customerReference: `IC-REF-${510 + i}`,
      advisingBankName: BANKS[i % BANKS.length],
      issuerReference: `ICI-${8100 + i}`,
      currency: CURRENCIES[(i + 3) % 8],
      amount: amountFor(i + 3),
      expiryDate: dateFromNow(35 + i * 10),
      productType: 'Import Collection',
      documentRelease: i % 2 ? 'Against Acceptance' : 'Against Payment',
      receivedFrom: BANKS[(i + 1) % BANKS.length],
      receivedFromName: BANKS[(i + 1) % BANKS.length],
      receivedFromCountry: c.country,
      receivedOn: dateFromNow(-i - 1),
      drawerName: c.name,
      drawerCountry: c.country,
      draftCollectionCurrency: CURRENCIES[(i + 3) % 8],
      draftCollectionAmount: String(amountFor(i + 3)),
      tenor: i % 2 ? '60 days' : 'Sight',
      goodsDescription: GOODS[(i + 2) % 8],
      shipmentFrom: c.city,
      shipmentTo: 'Karachi',
      vesselAircraft: `MV ${['Atlas', 'Zephyr', 'Meridian', 'Polaris', 'Tide'][i]}`,
    };
  });
}

function transfers() {
  const pairs = [
    ['0100-2233445-01', '0100-2233445-02'],
    ['0100-2233445-02', '0100-5566778-01'],
    ['0100-2233445-01', '0100-9988776-01'],
    ['0100-5566778-01', '0100-2233445-01'],
    ['0100-2233445-01', '0100-5566778-01'],
  ];
  const statuses = ['A', 'S', 'I', 'R', 'A'];
  return pairs.map(([from, to], i) => ({
    id: i + 1,
    tnxId: `FT${240100 + i}`,
    companyId: 'CORP',
    productType: i % 2 ? 'Third Party Transfer' : 'Own Account Transfer',
    transferFrom: from,
    transferTo: to,
    amount: [250000, 1200000, 85000, 430000, 64000][i],
    currency: 'PKR',
    transferDate: dateFromNow(-i * 2),
    transactionRemarks: ['Payroll funding', 'Supplier payment', 'Petty cash', 'Utility settlement', 'Tax deposit'][i],
    status: statuses[i],
    rejectionReason: statuses[i] === 'R' ? 'Insufficient supporting documents.' : undefined,
    createdOn: daysFromNow(-i * 2),
    updatedOn: daysFromNow(-i * 2),
  }));
}

function bankAccounts() {
  return [
    ['0100-2233445-01', 'Crescent Traders - Operating', 'Current', 18450000, 'PKR'],
    ['0100-2233445-02', 'Crescent Traders - Payroll', 'Current', 6200000, 'PKR'],
    ['0100-5566778-01', 'Crescent Traders - USD', 'Foreign Currency', 285000, 'USD'],
    ['0100-9988776-01', 'Crescent Traders - Savings', 'Savings', 42000000, 'PKR'],
  ].map(([accountNumber, accountName, accountType, currentBalance, currency]) => ({
    accountNumber,
    accountName,
    accountType,
    currentBalance,
    currency,
    companyId: 'CORP',
    isActive: true,
    accessPolicyType: 'ROLE_BASED',
    minApprovalLevel: 1,
    maxTransferLimit: 50000000,
    dailyTransferLimit: 100000000,
    requiresDualAuthorization: true,
    allowedRoles: 'MAKER,CHECKER',
    createdOn: daysFromNow(-200),
    updatedOn: daysFromNow(-3),
  }));
}

/* ------------------------------------------------------------------ */
/* Admin masters                                                       */
/* ------------------------------------------------------------------ */

function cities() {
  return [
    ['Karachi', 'Sindh', 'Pakistan'],
    ['Lahore', 'Punjab', 'Pakistan'],
    ['Islamabad', 'ICT', 'Pakistan'],
    ['Faisalabad', 'Punjab', 'Pakistan'],
    ['Peshawar', 'KPK', 'Pakistan'],
    ['Quetta', 'Balochistan', 'Pakistan'],
  ].map(([cityName, state, country], i) => ({
    id: i + 1,
    cityId: i + 1,
    cityName,
    state,
    country,
    ...audit(statusFor(i), 60 - i),
  }));
}

function branches() {
  return [
    ['0001', 'Main Branch Karachi', 1],
    ['0002', 'Gulberg Branch Lahore', 2],
    ['0003', 'Blue Area Branch Islamabad', 3],
    ['0004', 'D Ground Branch Faisalabad', 4],
  ].map(([branchCode, branchName, cityId], i) => ({
    id: i + 1,
    branchId: i + 1,
    branchCode,
    branchName,
    branchAddress: `${branchName}, Pakistan`,
    citymaster: { cityId, cityName: ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad'][i] },
    contactNo: `+92 21 3456 70${i}0`,
    contactPerson: ['Imran Ali', 'Ayesha Malik', 'Bilal Shah', 'Hina Iqbal'][i],
    emailAddress: `branch${branchCode}@fccdemo.bank`,
    localCurrency: 'PKR',
    swiftAddress: `FCCDPKKA${String(branchCode).slice(1)}`,
    ...audit(statusFor(i), 50 - i),
  }));
}

function companies() {
  return [
    ['CORP', 'Crescent Traders (Pvt) Ltd', 'C'],
    ['ADMIN', 'FCC Platform Administration', 'C'],
    ['BANK', 'FCC Demo Bank', 'B'],
    ['NOVA', 'Nova Textiles Ltd', 'C'],
    ['ZEN', 'Zenith Pharma (Pvt) Ltd', 'C'],
  ].map(([companyId, companyName, companyType], i) => ({
    id: i + 1,
    companyId,
    companyName,
    companyType,
    companyAddress: ['Korangi, Karachi', 'Clifton, Karachi', 'I.I. Chundrigar Road, Karachi', 'SITE, Karachi', 'Gulberg, Lahore'][i],
    companyStatus: 'Active',
    ...audit(statusFor(i), 120 - i * 5),
  }));
}

function currencies() {
  return [
    ['PKR', 'Pakistani Rupee'],
    ['USD', 'US Dollar'],
    ['EUR', 'Euro'],
    ['GBP', 'British Pound'],
    ['AED', 'UAE Dirham'],
    ['JPY', 'Japanese Yen'],
    ['CNY', 'Chinese Yuan'],
  ].map(([currencyCode, currencyDesc], i) => ({
    id: i + 1,
    currencyId: i + 1,
    currencyMapId: i + 1,
    currencyCode,
    currencyDesc,
    currencyStatus: 'Active',
    authorizedBy: 'checker',
    authorizedOn: daysFromNow(-90),
    ...audit(statusFor(i), 100 - i),
  }));
}

function customers() {
  return [
    ['Crescent Traders (Pvt) Ltd', 'Corporate', 'info@crescent.example'],
    ['Nova Textiles Ltd', 'Corporate', 'accounts@novatex.example'],
    ['Zenith Pharma (Pvt) Ltd', 'Corporate', 'finance@zenith.example'],
    ['Hassan Enterprises', 'SME', 'hassan@enterprises.example'],
    ['Fatima Exports', 'SME', 'ops@fatimaexports.example'],
  ].map(([name, customerCategory, email], i) => ({
    id: i + 1,
    custId: `C${1000 + i}`,
    name,
    customerCategory,
    customerType: 'Business',
    customerStatus: 'Active',
    email,
    contact: `+92 300 12345${60 + i}`,
    address: ['Korangi, Karachi', 'SITE, Karachi', 'Gulberg, Lahore', 'Saddar, Rawalpindi', 'Model Town, Lahore'][i],
    countryCity: ['Pakistan / Karachi', 'Pakistan / Karachi', 'Pakistan / Lahore', 'Pakistan / Rawalpindi', 'Pakistan / Lahore'][i],
    branchCode: '0001',
    legalId: `42101-${5550000 + i}-1`,
    ...audit(statusFor(i), 80 - i * 4),
  }));
}

function clientUsers() {
  return [
    ['user', 'Sara Ahmed', 'CORP', 'U'],
    ['admin', 'Ali Raza', 'ADMIN', 'A'],
    ['bank', 'Usman Khan', 'BANK', 'U'],
    ['checker', 'Nadia Hussain', 'CORP', 'U'],
    ['maker2', 'Omar Farooq', 'CORP', 'U'],
    ['viewer', 'Zainab Tariq', 'NOVA', 'U'],
  ].map(([loginId, userName, companyId, userCategory], i) => ({
    id: i + 1,
    appUserId: i + 1,
    loginId,
    userName,
    companyId,
    userCategory,
    userStatus: 'A',
    email: `${loginId}@fccdemo.example`,
    password: '********',
    ...audit(statusFor(i), 70 - i * 3),
  }));
}

function roles() {
  return [
    ['MAKER', 'Creates and saves transactions'],
    ['CHECKER', 'Approves or rejects transactions'],
    ['VIEWER', 'Read-only access'],
    ['SUPERVISOR', 'Maker and checker rights'],
  ].map(([roleId, roleDesc], i) => ({
    id: i + 1,
    roleId,
    roleDesc,
    roleDest: roleDesc,
    roleStatus: 'Active',
    ...audit(statusFor(i), 90 - i),
  }));
}

function permissions() {
  const modules: Record<string, string> = {
    ILC: 'Import LC',
    SG: 'Shipping Guarantee',
    EC: 'Export Collection',
    UI: 'Undertaking Issuance',
    UTG: 'Undertaking Issuance',
  };
  return DEMO_PERMISSIONS.map((permissionName, i) => ({
    id: i + 1,
    permissionId: i + 1,
    permissionName,
    moduleName: modules[permissionName.split('_')[0]] ?? 'Import LC',
    description: permissionName.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2'),
    permissionStatus: 'Active',
    ...audit(statusFor(i), 150 - (i % 30)),
  }));
}

function permissionGroups() {
  return [
    ['Trade Maker', 'Create and update trade transactions'],
    ['Trade Checker', 'Approve or reject trade transactions'],
    ['Full Access', 'All trade and payment permissions'],
    ['Read Only', 'Inquiry access only'],
  ].map(([permissionGroupName, description], i) => ({
    id: i + 1,
    permissionGroupId: i + 1,
    permissionGroupName,
    description,
    permissionGroupStatus: 'Active',
    permissionNames: DEMO_PERMISSIONS,
    permissions: DEMO_PERMISSIONS.map((permissionName, j) => ({ permissionId: j + 1, permissionName })),
    ...audit(statusFor(i), 100 - i),
  }));
}

function accountTypes() {
  return [
    ['Current', 'Non-interest bearing current account'],
    ['Savings', 'Profit bearing savings account'],
    ['Foreign Currency', 'FCY denominated account'],
    ['Term Deposit', 'Fixed tenor deposit'],
  ].map(([typeName, description], i) => ({
    id: i + 1,
    typeName,
    description,
    accountStatus: 'Active',
    authorizedBy: 'checker',
    ...audit(statusFor(i), 110 - i),
  }));
}

function customerAccounts() {
  return [
    ['C1000', 'CORP', 'Crescent Traders - Operating', 'Current', 'PK36FCCD0100223344501'],
    ['C1000', 'CORP', 'Crescent Traders - USD', 'Foreign Currency', 'PK36FCCD0100556677801'],
    ['C1001', 'NOVA', 'Nova Textiles - Main', 'Current', 'PK36FCCD0200112233401'],
    ['C1002', 'ZEN', 'Zenith Pharma - Savings', 'Savings', 'PK36FCCD0300998877601'],
  ].map(([custId, companyId, accountTitle, accountType, iban], i) => ({
    id: i + 1,
    custId,
    companyId,
    accountTitle,
    accountType,
    iban,
    accountNumber: iban.slice(-13),
    currency: accountType === 'Foreign Currency' ? 'USD' : 'PKR',
    accountStatus: 'Active',
    ...audit(statusFor(i), 60 - i),
  }));
}

function dynamicFields() {
  return [
    ['ImportScreen', 'internalCostCenter', 'Internal Cost Center', 'text'],
    ['ImportScreen', 'insurancePolicyNo', 'Insurance Policy No.', 'text'],
    ['ExportCollection', 'hsCode', 'HS Code', 'text'],
    ['shippingGuarntee', 'containerCount', 'Number of Containers', 'number'],
    ['UndertakingIssuance', 'projectName', 'Project Name', 'text'],
    ['customer', 'ntnNumber', 'NTN Number', 'text'],
    ['ImportScreen', 'portAgent', 'Port Agent', 'text', 'I'],
    ['ExportCollection', 'courierAwb', 'Courier AWB No.', 'text', 'S'],
  ].map(([screen, fieldName, label, fieldType, status], i) => ({
    id: i + 1,
    fieldId: i + 1,
    fieldName,
    label,
    fieldType,
    screen,
    options: [],
    // Approved fields appear on the screens; the last two fill the draft/submitted tabs
    ...audit(status ?? 'A', 40 - i),
  }));
}

function dynamicDropdowns() {
  return [
    ['customerType', 'Individual, Business, Government'],
    ['shipmentMode', 'Sea, Air, Road'],
    ['chargeBearer', 'Applicant, Beneficiary, Shared'],
  ].map(([name, description], i) => ({
    id: i + 1,
    name,
    description,
    options: description.split(', ').map((text, j) => ({ id: j + 1, value: text.toUpperCase(), text })),
    ...audit(statusFor(i), 30 - i),
  }));
}

function registrationRequests() {
  return [
    ['Bilal Ahmed', 'bilal.ahmed@example.com'],
    ['Mehwish Khan', 'mehwish.k@example.com'],
    ['Tariq Mehmood', 'tariq.m@example.com'],
  ].map(([name, email], i) => ({
    id: i + 1,
    name,
    email,
    cnic: `35202-${8880000 + i}-${i + 1}`,
    contactNumber: `+92 321 55500${i}0`,
    remarks: 'Would like to open a corporate trade account.',
    status: 'PENDING',
    createdOn: daysFromNow(-i),
  }));
}

/** Fresh copy of the whole demo database. */
export function createSeedDb(): DemoDb {
  return {
    importlc: importLcs(),
    shippingguarantee: shippingGuarantees(),
    exportcollection: exportCollections(),
    utg: undertakings(),
    exportlc: exportLcs(),
    importcollection: importCollections(),
    transfers: transfers(),
    bankAccounts: bankAccounts(),

    // Amendment events per module, created at runtime
    'events:importlc': [],
    'events:shippingguarantee': [],
    'events:exportcollection': [],
    'events:utg': [],

    city: cities(),
    branch: branches(),
    company: companies(),
    currency: currencies(),
    customer: customers(),
    clientUsers: clientUsers(),
    roles: roles(),
    Permissions: permissions(),
    PermissionsGroup: permissionGroups(),
    AccountMaster: accountTypes(),
    accounts: customerAccounts(),
    'dynamic-fields': dynamicFields(),
    'dynamic-dropdown': dynamicDropdowns(),
    'create-dropdown': [],
    'user-roles': [],
    registrationRequests: registrationRequests(),
  };
}
