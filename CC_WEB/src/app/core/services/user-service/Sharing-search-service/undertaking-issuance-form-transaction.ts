import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// IMPORTANT: Ensure this path is correct for your project structure
import { ApiService } from '../../../../core/services/api.service';

// ==========================================
// 1. INTERFACES
// ==========================================
export interface UndertakingTransaction {
  id: string | number;
  channelReference: string;
  status: string;
  lastUpdated: Date;
  formData: any; 
}

@Injectable({
  providedIn: 'root'
})
export class UndertakingIssuanceService {

  // Base Endpoint matching your Java Controller
  private readonly ENDPOINT = '/undertaking-lc'; 

  constructor(private apiService: ApiService) { }

  // ==========================================
  // 2. WRITE OPERATIONS (Save, Submit, etc.)
  // ==========================================

  /**
   * SAVE DRAFT (Create or Update)
   * If 'id' is provided, the Backend should treat it as an UPDATE.
   * If 'id' is null/undefined, the Backend should treat it as a CREATE.
   */
  saveDraft(formData: any, id?: string | number | null): Observable<any> {
    // 1. Convert Nested Angular Form -> Flat Java Entity
    const payload = this.transformToBackendDTO(formData, id);

    // 2. Send to Backend
    // Note: Depending on your API design, you might use PUT for updates.
    // Here we assume the /save endpoint handles both based on the ID presence.
    return this.apiService.post(`${this.ENDPOINT}/save`, payload);
  }

  /**
   * SUBMIT
   */
  submitTransaction(id: any): Observable<any> {
    return this.apiService.post(`${this.ENDPOINT}/submit/${id}`, {});
  }

  /**
   * APPROVE
   */
  approveTransaction(id: any): Observable<any> {
    return this.apiService.post(`${this.ENDPOINT}/approve/${id}`, {});
  }

  /**
   * REJECT
   */
  rejectTransaction(id: any, reason: string): Observable<any> {
    return this.apiService.post(`${this.ENDPOINT}/reject/${id}`, reason);
  }

  /**
   * ISSUE
   */
  issueTransaction(id: any): Observable<any> {
    return this.apiService.post(`${this.ENDPOINT}/issue/${id}`, {});
  }

  /**
   * CANCEL
   */
  cancelTransaction(id: any): Observable<any> {
    return this.apiService.post(`${this.ENDPOINT}/cancel/${id}`, {});
  }

  // ==========================================
  // 3. READ OPERATIONS (List, Get By ID)
  // ==========================================

  /**
   * GET LIST
   */
  getTransactions(): Observable<UndertakingTransaction[]> {
    return this.apiService.get<any[]>(`${this.ENDPOINT}/list`).pipe(
      map((backendList: any[]) => {
        if (!Array.isArray(backendList)) return [];

        return backendList.map((item: any) => ({
          id: item.id,
          channelReference: item.channelReference || item.tnxId || `REF-${item.id}`,
          status: item.status || 'Draft',
          lastUpdated: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          formData: this.transformToAngularForm(item)
        }));
      }),
      catchError(err => {
        console.error('Error fetching transactions:', err);
        return of([]); 
      })
    );
  }

  /**
   * GET BY ID
   * Called by Component when loading from URL ?transactionId=123
   */
  getTransactionById(id: string | number): Observable<any> {
    return this.apiService.get<any>(`${this.ENDPOINT}/${id}`).pipe(
      map((backendData: any) => {
        // Return the nested form structure directly so patchValue works instantly
        return this.transformToAngularForm(backendData);
      })
    );
  }

  // ==========================================
  // 4. DATA MAPPERS (The Bridge)
  // ==========================================

  /**
   * Maps Java Entity (Flat) -> Angular Form (Nested)
   * This ensures that when you load a draft, all fields populate correctly.
   */
  private transformToAngularForm(backendData: any): any {
    if (!backendData) return {};
    
    return {
      // General Details
      generalDetails: {
        productType: backendData.productType,
        modeOfTransmission: backendData.modeOfTransmission,
        formOfUndertaking: backendData.formOfUndertaking,
        purpose: backendData.purpose
      },
      // Applicant & Beneficiary
      applicantBeneficiary: {
        applicantName: backendData.applicantName,
        applicantAddress1: backendData.applicantAddress1,
        applicantAddress2: backendData.applicantAddress2,
        applicantAddress3: backendData.applicantAddress3,
        beneficiaryName: backendData.beneficiaryName,
        beneficiaryAddress1: backendData.beneficiaryAddress1,
        beneficiaryAddress2: backendData.beneficiaryAddress2,
        beneficiaryAddress3: backendData.beneficiaryAddress3,
        beneficiaryCountry: backendData.beneficiaryCountry
      },
      // Bank Details
      bankForm: {
        recipientBankName: backendData.recipientBankName,
        issuerReference: backendData.issuerReference,
        issuanceType: backendData.issuanceType,
        swift: backendData.swift,
        bankName: backendData.bankName,
        address1: backendData.bankAddress1,
        address2: backendData.bankAddress2,
        address3: backendData.bankAddress3,
        country: backendData.bankCountry
      },
      // Undertaking Details
      undertakingDetails: {
        typeOfUndertaking: backendData.typeOfUndertaking,
        effectiveOption: backendData.effectiveOption,
        expiryType: backendData.expiryType,
        expiryDate: backendData.expiryDate ? new Date(backendData.expiryDate).toISOString().split('T')[0] : '', // Format for Input Date
        currency: backendData.currency || 'USD',
        undertakingAmount: backendData.undertakingAmount,
        variationPlus: backendData.variationPlus,
        variationMinus: backendData.variationMinus,
        issuanceCharges: backendData.issuanceCharges,
        correspondentCharges: backendData.correspondentCharges,
        supplementaryInfo: backendData.supplementaryInfo,
        textofundertakingInfo: backendData.textofundertakingInfo,
        underlyingtransactionInfo: backendData.underlyingtransactionInfo,
        presentationInfo: backendData.presentationInfo
      },
      // Instructions
      instructions: {
        deliveryType: backendData.deliveryType,
        deliveryMode: backendData.deliveryMode,
        deliveryTo: backendData.deliveryTo,
        principalAccount: backendData.principalAccount,
        feeAccount: backendData.feeAccount,
        otherInstructions: backendData.otherInstructions
      },
      // Attachments (Files usually handled separately or as metadata list)
      attachments: {
        files: backendData.files || []
      }
    };
  }

  /**
   * Maps Angular Form (Nested) -> Java Entity (Flat)
   */
  private transformToBackendDTO(form: any, id?: string | number | null): any {
    const gen = form?.generalDetails || {};
    const app = form?.applicantBeneficiary || {};
    const bank = form?.bankForm || {};
    const und = form?.undertakingDetails || {};
    const inst = form?.instructions || {};

    return {
      // Identity
      id: id || form.id || null, // VITAL: This triggers Update vs Create on Backend

      // General
      productType: gen.productType,
      modeOfTransmission: gen.modeOfTransmission,
      formOfUndertaking: gen.formOfUndertaking,
      purpose: gen.purpose,

      // Applicant
      applicantName: app.applicantName,
      applicantAddress1: app.applicantAddress1,
      applicantAddress2: app.applicantAddress2,
      applicantAddress3: app.applicantAddress3,

      // Beneficiary
      beneficiaryName: app.beneficiaryName,
      beneficiaryAddress1: app.beneficiaryAddress1,
      beneficiaryAddress2: app.beneficiaryAddress2,
      beneficiaryAddress3: app.beneficiaryAddress3,
      beneficiaryCountry: app.beneficiaryCountry,

      // Bank
      recipientBankName: bank.recipientBankName,
      issuerReference: bank.issuerReference,
      issuanceType: bank.issuanceType,
      swift: bank.swift,
      bankName: bank.bankName,
      bankAddress1: bank.address1,
      bankAddress2: bank.address2,
      bankAddress3: bank.address3,
      bankCountry: bank.country,

      // Undertaking
      typeOfUndertaking: und.typeOfUndertaking,
      effectiveOption: und.effectiveOption,
      expiryType: und.expiryType,
      expiryDate: und.expiryDate,
      currency: und.currency,
      undertakingAmount: und.undertakingAmount,
      variationPlus: und.variationPlus,
      variationMinus: und.variationMinus,
      issuanceCharges: und.issuanceCharges,
      correspondentCharges: und.correspondentCharges,
      supplementaryInfo: und.supplementaryInfo,
      textofundertakingInfo: und.textofundertakingInfo,
      underlyingtransactionInfo: und.underlyingtransactionInfo,
      presentationInfo: und.presentationInfo,

      // Instructions
      deliveryType: inst.deliveryType,
      deliveryMode: inst.deliveryMode,
      deliveryTo: inst.deliveryTo,
      principalAccount: inst.principalAccount,
      feeAccount: inst.feeAccount,
      otherInstructions: inst.otherInstructions,

      // Attachments
      files: form.attachments?.files || []
    };
  }
}