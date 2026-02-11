import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  companyId?: string;
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
  
  // UPDATED: Now accepts 'tab' parameter
  refreshTransactions(tab: string = 'pending'): Observable<UndertakingTransaction[]> {
    // Create query params safely
    let params = new HttpParams().set('tab', tab);

    return this.http.get<any[]>(`${this.BASE_URL}/list`, { params }).pipe(
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
    return this.http.get<any>(`${this.BASE_URL}/${id}`).pipe(
      map(data => this.mapToFrontend(data)),
      tap(tx => {
        this.currentTransaction = tx;
        this.updateLocalState(tx);
      })
    );
  }

  // ================= WRITE OPERATIONS =================

  // 1. SAVE DRAFT (Status: 'I' or 'Draft')
  saveDraft(formData: any, companyId: string, id?: string | number | null): Observable<UndertakingTransaction> {
    const payload = this.transformToBackendDTO(formData, id);
    payload.status = 'I'; 

    return this.http.post<any>(
      `${this.BASE_URL}/save`,
      payload,
      {
        headers: { 'companyid': companyId }
      }
    ).pipe(
      map(saved => this.mapToFrontend(saved)),
      tap(savedTx => this.updateLocalState(savedTx))
    );
  }


  updateDraft(formData: any): Observable<UndertakingTransaction> {
    const id = formData.id; 
    const payload = this.transformToBackendDTO(formData, id);
    payload.status = 'I'; 

    return this.http.put<any>(`${this.BASE_URL}/update/${id}`, payload).pipe(
      map(updated => this.mapToFrontend(updated)),
      tap(updatedTx => this.updateLocalState(updatedTx))
    );
  }

  // 2. SUBMIT (Status: 'S' or 'Submitted')
  submitTransaction(id: string | number, formData?: any): Observable<UndertakingTransaction> {
    let payload = {};
    if (formData) {
        payload = this.transformToBackendDTO(formData, id);
        (payload as any).status = 'S'; 
    }

    return this.http.post<any>(`${this.BASE_URL}/submit/${id}`, payload).pipe(
      map(updated => this.mapToFrontend(updated)),
      tap(updatedTx => this.updateLocalState(updatedTx))
    );
  }
  
  // 3. APPROVE (Status: 'A')
  approveUndertaking(id: string | number): Observable<UndertakingTransaction> {
    return this.http.post<any>(`${this.BASE_URL}/approve/${id}`, {}).pipe(
      map(updated => this.mapToFrontend(updated)),
      tap(updatedTx => this.updateLocalState(updatedTx))
    );
  }

  // 4. REJECT (Status: 'R')
 rejectUndertaking(id: string | number, reason: string): Observable<UndertakingTransaction> {
  return this.http.post<any>(
    `${this.BASE_URL}/rejectReason/${id}`, 
    { rejectionReason: reason } // <--- match backend DTO field
  )
  .pipe(
    map(updated => this.mapToFrontend(updated)),
    tap(updatedTx => this.updateLocalState(updatedTx))
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
    // Use tnxId as channel ref if available, else generate one
    const customRef = backendData.tnxId || backendData.channelReference || `UND-${backendData.id}`;

    return {
      id: backendData.id,
      channelReference: customRef,
      tnxId: backendData.tnxId,
      status: backendData.status || 'I', 
      lastUpdated: backendData.updatedAt ? new Date(backendData.updatedAt) : new Date(),
      formData: this.transformToAngularForm(backendData)
    };
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
        address1: backendData.bankAddress1,
        address2: backendData.bankAddress2,
        address3: backendData.bankAddress3,
        country: backendData.bankCountry
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
    const val = (v: any) => (v === undefined || v === '' ? null : v);
    const gen = form.generalDetails || {};
    const app = form.applicantBeneficiary || {};
    const bank = form.bankForm || {};
    const und = form.undertakingDetails || {};
    const inst = form.instructions || {};

    return {
      id: id || form.id || null, 
      status: form.status,
      
      productType: val(gen.productType),
      modeOfTransmission: val(gen.modeOfTransmission),
      formOfUndertaking: val(gen.formOfUndertaking),
      purpose: val(gen.purpose),
      
      applicantName: val(app.applicantName),
      applicantAddress1: val(app.applicantAddress1),
      applicantAddress2: val(app.applicantAddress2),
      applicantAddress3: val(app.applicantAddress3),
      beneficiaryName: val(app.beneficiaryName),
      beneficiaryAddress1: val(app.beneficiaryAddress1),
      beneficiaryAddress2: val(app.beneficiaryAddress2),
      beneficiaryAddress3: val(app.beneficiaryAddress3),
      beneficiaryCountry: val(app.beneficiaryCountry),
      
      recipientBankName: val(bank.recipientBankName),
      issuerReference: val(bank.issuerReference),
      issuanceType: val(bank.issuanceType),
      swift: val(bank.swift),
      bankName: val(bank.bankName),
      bankAddress1: val(bank.address1),
      bankAddress2: val(bank.address2),
      bankAddress3: val(bank.address3),
      bankCountry: val(bank.country),
      
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

      deliveryType: val(inst.deliveryType),
      deliveryMode: val(inst.deliveryMode),
      deliveryTo: val(inst.deliveryTo),
      principalAccount: val(inst.principalAccount),
      feeAccount: val(inst.feeAccount),
      otherInstructions: val(inst.otherInstructions),
      
      files: form.attachments?.files || []
    };
  }

  private formatDateToYYYYMMDD(dateVal: any): string | null {
    if (!dateVal) return null;
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) return dateVal;
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); 
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
}