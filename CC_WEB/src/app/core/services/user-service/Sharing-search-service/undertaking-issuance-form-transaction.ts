import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

// INTERFACES
export interface UndertakingTransaction {
  id: string | number;
  channelReference: string; 
  tnxId?: string;
  status: string;
  lastUpdated: Date;
  formData: any;
}

@Injectable({
  providedIn: 'root'
})
export class UndertakingIssuanceService {

  private readonly BASE_URL = 'http://localhost:8084/api/v1/undertaking_lc';

  private transactionsSubject$ = new BehaviorSubject<UndertakingTransaction[]>([]);
  public transactionsStream$ = this.transactionsSubject$.asObservable();
  private currentTransaction: UndertakingTransaction | null = null;

  constructor(private http: HttpClient) {}

  // ================= READ OPERATIONS =================
  refreshTransactions(): Observable<UndertakingTransaction[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/list`).pipe(
      map(list => {
        if (!Array.isArray(list)) return [];
        return list.map(item => this.mapToFrontend(item));
      }),
      tap(data => this.transactionsSubject$.next(data)),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getTransactionById(id: string | number): Observable<UndertakingTransaction> {
    // REMOVED THE CACHE CHECK HERE. 
    // We must always hit the API to get full details (addresses, instructions, etc.)
    // because the 'list' view only provides summary data.
    
    return this.http.get<any>(`${this.BASE_URL}/${id}`).pipe(
      map(data => this.mapToFrontend(data)),
      tap(tx => {
        this.currentTransaction = tx;
        // Optionally update the local list with this full detailed version
        this.updateLocalState(tx);
      })
    );
  }

  // ================= WRITE OPERATIONS =================

  saveDraft(formData: any, id?: string | number | null): Observable<UndertakingTransaction> {
    // 1. Flatten the form data
    const payload = this.transformToBackendDTO(formData, id);
    
    // 2. FORCE STATUS 'Draft' for new saves if not present
    if (!payload.status) {
        payload.status = 'Draft'; 
    }

    console.log('Final Payload being sent to Save:', payload);

    return this.http.post<any>(`${this.BASE_URL}/save`, payload).pipe(
      map(saved => this.mapToFrontend(saved)),
      tap(savedTx => this.updateLocalState(savedTx))
    );
  }

  updateDraft(formData: any): Observable<UndertakingTransaction> {
    const id = formData.id; 
    const payload = this.transformToBackendDTO(formData, id);
    
    // Ensure status exists (keep existing or default to Draft)
    if (!payload.status) {
        payload.status = 'Draft';
    }

    return this.http.put<any>(`${this.BASE_URL}/update/${id}`, payload).pipe(
      map(updated => this.mapToFrontend(updated)),
      tap(updatedTx => this.updateLocalState(updatedTx)),
      catchError(err => {
        console.error('Update failed:', err);
        throw err;
      })
    );
  }

  submitTransaction(id: string | number, payload?: any): Observable<UndertakingTransaction> {
    return this.http.post<any>(`${this.BASE_URL}/submit/${id}`, {}).pipe(
      map(updated => this.mapToFrontend(updated)),
      tap(updatedTx => this.updateLocalState(updatedTx))
    );
  }
  
  approveUndertaking(id: string | number): Observable<UndertakingTransaction> {
    return this.http.post<any>(`${this.BASE_URL}/approve/${id}`, {}).pipe(
      map(updated => this.mapToFrontend(updated)),
      tap(updatedTx => this.updateLocalState(updatedTx))
    );
  }

  rejectUndertaking(id: string | number, reason: string): Observable<UndertakingTransaction> {
    return this.http.post<any>(`${this.BASE_URL}/reject/${id}`, { reason }).pipe(
      map(updated => this.mapToFrontend(updated)),
      tap(updatedTx => this.updateLocalState(updatedTx))
    );
  }

  revertToDraft(id: string | number, currentData: any): Observable<UndertakingTransaction> {
      const payload = this.transformToBackendDTO(currentData, id);
      payload.status = 'Draft'; // Force status reset
      return this.http.post<any>(`${this.BASE_URL}/save`, payload).pipe(
        map(saved => this.mapToFrontend(saved)),
        tap(savedTx => this.updateLocalState(savedTx))
      );
  }

  // ================= HELPERS =================
  private updateLocalState(item: UndertakingTransaction) {
    const current = this.transactionsSubject$.value;
    const index = current.findIndex(t => t.id === item.id);
    if (index > -1) {
       const updatedList = [...current];
       updatedList[index] = item;
       this.transactionsSubject$.next(updatedList);
    } else {
       this.transactionsSubject$.next([item, ...current]);
    }
    this.currentTransaction = item;
  }

  private mapToFrontend(backendData: any): UndertakingTransaction {
    const refDate = backendData.createdAt || backendData.updatedAt || new Date();
    const customRef = backendData.channelReference || 
                      this.generateBusinessId(backendData.id, refDate);

    return {
      id: backendData.id,
      channelReference: customRef,
      tnxId: backendData.tnxId,
      status: backendData.status || 'Draft',
      lastUpdated: backendData.updatedAt ? new Date(backendData.updatedAt) : new Date(),
      formData: this.transformToAngularForm(backendData)
    };
  }

  private generateBusinessId(id: number | string, dateVal: any): string {
    if (!id) return 'UND-NEW-DRAFT'; 
    const dateObj = new Date(dateVal);
    if (isNaN(dateObj.getTime())) return `UND-${id}`;
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const paddedId = String(id).padStart(5, '0');
    return `UND${yyyy}${mm}${dd}${paddedId}`;
  }

  // --- MAPPING: BACKEND FLAT JSON -> ANGULAR NESTED FORM ---
  private transformToAngularForm(backendData: any): any {
    if (!backendData) return {};
    const safeDate = (val: any) => val ? new Date(val) : '';

    return {
      id: backendData.id, 
      tnxId: backendData.tnxId,
      status: backendData.status,
      
      generalDetails: {
        productType: backendData.productType,
        modeOfTransmission: backendData.modeOfTransmission,
        formOfUndertaking: backendData.formOfUndertaking,
        purpose: backendData.purpose
      },
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
      bankForm: {
        recipientBankName: backendData.recipientBankName,
        issuerReference: backendData.issuerReference,
        issuanceType: backendData.issuanceType,
        swift: backendData.swift,
        bankName: backendData.bankName,
        address1: backendData.bankAddress1 || backendData.address1,
        address2: backendData.bankAddress2 || backendData.address2,
        address3: backendData.bankAddress3 || backendData.address3,
        country: backendData.bankCountry   || backendData.country
      },
      undertakingDetails: {
        typeOfUndertaking: backendData.typeOfUndertaking,
        effectiveOption: backendData.effectiveOption,
        expiryType: backendData.expiryType,
        expiryDate: safeDate(backendData.expiryDate),
        currency: backendData.currency,
        undertakingAmount: backendData.undertakingAmount,
        variationPlus: backendData.variationPlus,
        variationMinus: backendData.variationMinus,
        issuanceCharges: backendData.issuanceCharges,
        correspondentCharges: backendData.correspondentCharges,
        supplementaryInfo: backendData.supplementaryInfo,
        
        // --- MATCHING COMPONENT CASING (CamelCase) ---
        textOfUndertakingInfo: backendData.textOfUndertakingInfo, 
        underlyingTransactionInfo: backendData.underlyingTransactionInfo, 
        presentationInfo: backendData.presentationInfo,
        basicExtensionType: backendData.basicExtensionType, 
        
        increaseDecreaseType: backendData.increaseDecreaseType,
        contractType: backendData.contractType,
        contractDate: safeDate(backendData.contractDate),
        contractCurrency: backendData.contractCurrency,
        contractAmount: backendData.contractAmount,
        percentageCovered: backendData.percentageCovered,
        contractReference: backendData.contractReference,
        applicableRules: backendData.applicableRules,
        subdivision: backendData.subdivision,
        jurisdiction: backendData.jurisdiction,
        
        demandOption: backendData.demandOption, 
        governingLawsType: backendData.governingLawsType,
        languageType: backendData.languageType,
        tsOption: backendData.tsOption
      },
      instructions: {
        deliveryType: backendData.deliveryType,
        deliveryMode: backendData.deliveryMode,
        deliveryTo: backendData.deliveryTo,
        principalAccount: backendData.principalAccount,
        feeAccount: backendData.feeAccount,
        otherInstructions: backendData.otherInstructions
      },
      attachments: { files: backendData.files || [] }
    };
  }

  // --- MAPPING: ANGULAR NESTED FORM -> BACKEND FLAT JSON ---
  private transformToBackendDTO(form: any, id?: string | number | null): any {
    if (!form) return {};
    
    // Helper to avoid sending "undefined" to backend
    const val = (v: any) => (v === undefined || v === '' ? null : v);

    const gen = form.generalDetails || {};
    const app = form.applicantBeneficiary || {};
    const bank = form.bankForm || {};
    const und = form.undertakingDetails || {};
    const inst = form.instructions || {};

    return {
      id: id || form.id || null, 
      
      // Ensure STATUS is sent
      status: form.status || 'Draft',
      
      // General
      productType: val(gen.productType),
      modeOfTransmission: val(gen.modeOfTransmission),
      formOfUndertaking: val(gen.formOfUndertaking),
      purpose: val(gen.purpose),
      
      // Applicant & Beneficiary
      applicantName: val(app.applicantName),
      applicantAddress1: val(app.applicantAddress1),
      applicantAddress2: val(app.applicantAddress2),
      applicantAddress3: val(app.applicantAddress3),
      beneficiaryName: val(app.beneficiaryName),
      beneficiaryAddress1: val(app.beneficiaryAddress1),
      beneficiaryAddress2: val(app.beneficiaryAddress2),
      beneficiaryAddress3: val(app.beneficiaryAddress3),
      beneficiaryCountry: val(app.beneficiaryCountry),
      
      // Bank
      recipientBankName: val(bank.recipientBankName),
      issuerReference: val(bank.issuerReference),
      issuanceType: val(bank.issuanceType),
      swift: val(bank.swift),
      bankName: val(bank.bankName),
      bankAddress1: val(bank.address1),
      bankAddress2: val(bank.address2),
      bankAddress3: val(bank.address3),
      bankCountry: val(bank.country),
      
      // Undertaking
      typeOfUndertaking: val(und.typeOfUndertaking),
      effectiveOption: val(und.effectiveOption),
      expiryType: val(und.expiryType),
      expiryDate: this.formatDateToYYYYMMDD(und.expiryDate),

      currency: val(und.currency),
      undertakingAmount: val(und.undertakingAmount),
      variationPlus: val(und.variationPlus),
      variationMinus: val(und.variationMinus),
      issuanceCharges: val(und.issuanceCharges),
      correspondentCharges: val(und.correspondentCharges),
      
      supplementaryInfo: val(und.supplementaryInfo),

      // --- MATCHING COMPONENT CASING ---
      textOfUndertakingInfo: val(und.textOfUndertakingInfo), 
      underlyingTransactionInfo: val(und.underlyingTransactionInfo), 
      presentationInfo: val(und.presentationInfo),
      
      basicExtensionType: val(und.basicExtensionType),
      increaseDecreaseType: val(und.increaseDecreaseType),
      
      contractType: val(und.contractType),
      contractDate: this.formatDateToYYYYMMDD(und.contractDate),
      contractCurrency: val(und.contractCurrency),
      contractAmount: val(und.contractAmount),
      percentageCovered: val(und.percentageCovered),
      contractReference: val(und.contractReference),

      applicableRules: val(und.applicableRules),
      subdivision: val(und.subdivision),
      jurisdiction: val(und.jurisdiction),
      
      demandOption: val(und.demandOption),
      governingLawsType: val(und.governingLawsType),
      languageType: val(und.languageType),
      tsOption: val(und.tsOption),

      // Instructions
      deliveryType: val(inst.deliveryType),
      deliveryMode: val(inst.deliveryMode),
      deliveryTo: val(inst.deliveryTo),
      principalAccount: val(inst.principalAccount),
      feeAccount: val(inst.feeAccount),
      otherInstructions: val(inst.otherInstructions),
      
      // Files
      files: form.attachments?.files || []
    };
  }

  private formatDateToYYYYMMDD(dateVal: any): string | null {
    if (!dateVal) return null;
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
        return dateVal;
    }
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); 
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
}