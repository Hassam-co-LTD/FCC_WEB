export interface ExportCollectionTransaction {
  id?: number;
  // System fields
  status?: string; // "I", "S", "A"
  tnxId?: string;
  companyId?: string;
  createdOn?: Date;
  updatedOn?: Date;
  eventRefNo?: string;
  eventType?: string;
  eventSequence?: string;

  collectionType?: string;
  customerReference?: string;
  draweeReference?: string;

  drawerName?: string;
  drawerAddress1?: string;
  drawerAddress2?: string;
  drawerAddress3?: string;
  drawerAddress4?: string;
  // Beneficiary
  draweeName?: string;
  draweeAddress1?: string;
  draweeAddress2?: string;
  draweeAddress3?: string;
  draweeAddress4?: string;

  remittingBankName?: string;
  remittingBank: string;
  issuerReference?: string;
  principalAccount?: string;
  feeAccount?: string;

  presentingBankName?: string;
  bankAddress1?: string;
  bankAddress2?: string;
  bankAddress3?: string;
  bankAddress4?: string;
  collectingBankName?: string;
  swiftCode?: string;
  collectingReference?: string;
  currency?: string;
  amount?: number;
  paymentType?: string;
  tenor?: string;
  paymentReference?: string;
  shippingMethod?: string;
  shipmentReference?: string;
  shippingFrom?: string;
  shippingTo?: string;
  shipmentDate?: Date;
  applicableRule?: string;

  advicePaymentBy?: string;
  adviceAcceptanceAndDueDateBy?: Date;
  adviceReasonOfRefusalBy?: string;

  incotermsRules?: string;
  incoterms?: string;
  waiveAllChargesIfRefusedByDrawee?: Boolean;
  protestInCaseOfNonPayment?: Boolean;
  protestInCaseOfNonAcceptance?: Boolean;
  acceptanceMayBeDeferredPendingArrival?: Boolean;
  warehouseOrInsureGoodsIfNecessary?: Boolean;

  openingCharges?: ChargeBearer;
  outsideCountryCharges?: ChargeBearer;
  referTo?: string;
}
enum ChargeBearer {
  DRAWEE = 'DRAWEE',
  DRAWER = 'DRAWER',
}
