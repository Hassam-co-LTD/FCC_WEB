import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { RecordListDTO, UndertakingResponseDTO } from '../../../models/undertaking-lc';

// INTERFACES
export interface UndertakingTransaction {
  id: string | number;         // Database PK
  channelReference: string;    // Display Ref
  tnxId?: string;             // Unique String ID (e.g., UND260212000001)
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

  constructor(private http: HttpClient) { }

  // ================= READ OPERATIONS =================

  refreshTransactions(tab: string = 'pending'): Observable<UndertakingTransaction[]> {
    const companyId = sessionStorage.getItem('companyId') || '';
    const headers = new HttpHeaders({ companyid: companyId });

    return this.http.get<RecordListDTO[]>(`${this.BASE_URL}/status/${tab}`, { headers }).pipe(
      map(list => Array.isArray(list) ? list.map(item => this.mapToFrontend(item)) : []),
      tap(data => this.transactionsSubject$.next(data)),
      catchError(() => of([]))
    );
  }

  /**
   * IMPORTANT: backend uses tnxId (the String) for lookup
   */
  getTransactionById(tnxId: string | number): Observable<UndertakingTransaction> {
    return this.http.get<UndertakingResponseDTO>(`${this.BASE_URL}/${tnxId}`).pipe(
      map(data => this.mapToFrontend(data)),
      tap(tx => this.updateLocalState(tx)),
      catchError(err => this.handleError(err))
    );
  }

  // ================= WRITE OPERATIONS =================

  /**
   * First Save: Sends data to generate a tnxId
   */
  saveDraft(formData: any, id?: string | number | null): Observable<UndertakingTransaction> {
    const companyId = sessionStorage.getItem('companyId') || '';
    const payload = this.transformToBackendDTO(formData, id);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', companyid: companyId });

    return this.http.post<UndertakingResponseDTO>(`${this.BASE_URL}/save`, payload, { headers }).pipe(
      map(saved => this.mapToFrontend(saved)),
      tap(savedTx => this.updateLocalState(savedTx)),
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Update: Uses tnxId in the URL path
   */
  updateDraft(formData: any): Observable<UndertakingTransaction> {
    // 1. Extract tnxId to match @PathVariable in Java
    const tnxId = formData.tnxId;

    // 2. Transform form data to match UndertakingRequestDTO
    const payload = this.transformToBackendDTO(formData, formData.id);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'companyid': sessionStorage.getItem('companyId') || 'ABC'
    });

    // 3. Match Controller: BASE_URL + /update-draft/ + tnxId
    return this.http.put<UndertakingResponseDTO>(
      `${this.BASE_URL}/update-draft/${tnxId}`,
      payload,
      { headers }
    ).pipe(
      map(updated => this.mapToFrontend(updated)),
      tap(updatedTx => this.updateLocalState(updatedTx)),
      catchError(err => {
        // Pass the backend error (ErrorResponse) up to the component
        return throwError(() => err);
      })
    );
  }
  submitTransaction(tnxId: string | number, formData?: any): Observable<UndertakingTransaction> {
    const payload = formData ? this.transformToBackendDTO(formData, formData.id) : {};
    return this.http.post<UndertakingResponseDTO>(`${this.BASE_URL}/submit/${tnxId}`, payload).pipe(
      map(updated => this.mapToFrontend(updated)),
      tap(updatedTx => this.updateLocalState(updatedTx)),
      catchError(err => this.handleError(err))
    );
  }

  approveUndertaking(tnxId: string | number, formData?: any): Observable<UndertakingTransaction> {
    const payload = formData ? this.transformToBackendDTO(formData, formData.id) : {};
    return this.http.post<UndertakingResponseDTO>(`${this.BASE_URL}/approve/${tnxId}`, payload).pipe(
      map(updated => this.mapToFrontend(updated)),
      tap(updatedTx => this.updateLocalState(updatedTx)),
      catchError(err => this.handleError(err))
    );
  }

  rejectUndertaking(tnxId: string | number, reason: string): Observable<UndertakingTransaction> {
    // Backend expects an UndertakingRequestDTO, so we wrap the reason in an object
    const body = { rejectionReason: reason };
    return this.http.post<UndertakingResponseDTO>(`${this.BASE_URL}/rejectReason/${tnxId}`, body).pipe(
      map(updated => this.mapToFrontend(updated)),
      tap(updatedTx => this.updateLocalState(updatedTx)),
      catchError(err => this.handleError(err))
    );
  }

  // ================= HELPERS & MAPPING =================

  private updateLocalState(item: UndertakingTransaction) {
    const current = this.transactionsSubject$.value;
    const index = current.findIndex(t => t.id === item.id || (t.tnxId && t.tnxId === item.tnxId));
    if (index > -1) {
      const updatedList = [...current];
      updatedList[index] = item;
      this.transactionsSubject$.next(updatedList);
    } else {
      this.transactionsSubject$.next([item, ...current]);
    }
    this.currentTransaction = item;
  }

  private handleError(error: any) {
    // Pull error message from backend if available
    const msg = error.error?.message || error.message || 'Server Error';
    return throwError(() => new Error(msg));
  }

  private mapToFrontend(backendData: any): UndertakingTransaction {
    return {
      id: backendData.id,
      channelReference: backendData.tnxId || `UND-${backendData.id}`,
      tnxId: backendData.tnxId,
      status: backendData.status || 'I',
      lastUpdated: backendData.updatedOn ? new Date(backendData.updatedOn) : new Date(),
      formData: this.transformToAngularForm(backendData)
    };
  }

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

  private transformToBackendDTO(form: any, id?: string | number | null): any {
    if (!form) return {};

    // GUARD: Ensure 'id' in JSON is a number or null, never 'ABC'
    const rawId = id || form.id;
    const finalId = (rawId && !isNaN(Number(rawId))) ? Number(rawId) : null;

    const val = (v: any) => (v === undefined || v === '' ? null : v);
    const gen = form.generalDetails || {};
    const app = form.applicantBeneficiary || {};
    const bank = form.bankForm || {};
    const und = form.undertakingDetails || {};
    const inst = form.instructions || {};

    return {
      id: finalId,
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
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  }
}