import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
// import { environment } from '../../../../../environments/environment';

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

  // CONFIGURATION: Backend Endpoint (Matches your 8084 logs)
  private readonly BASE_URL = 'http://localhost:8084/api/v1/undertaking-lc';
  
  // ================= STATE MANAGEMENT =================
  
  // 1. Internal Store: Holds the list of transactions
  private transactionsSubject$ = new BehaviorSubject<UndertakingTransaction[]>([]);

  // 2. Public Stream: Components subscribe to this
  public transactionsStream$ = this.transactionsSubject$.asObservable();

  // 3. Current Selection
  private currentTransaction: UndertakingTransaction | null = null;

  constructor(private http: HttpClient) {}

  // ==========================================
  // 2. READ OPERATIONS
  // ==========================================

  /**
   * Fetches latest list from Backend and updates the local State
   * Endpoint: GET /list
   */
  refreshTransactions(): Observable<UndertakingTransaction[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/list`).pipe(
      map(backendList => {
        if (!Array.isArray(backendList)) return [];
        return backendList.map(item => this.mapToFrontend(item));
      }),
      tap(transactions => {
        this.transactionsSubject$.next(transactions);
      }),
      catchError(err => {
        console.error('Error fetching transactions:', err);
        return of([]);
      })
    );
  }

  /**
   * (Optional) Fetch by Status if you used the specific backend endpoint
   * Endpoint: GET /records/{status}
   */
  refreshByStatus(status: string): Observable<UndertakingTransaction[]> {
     return this.http.get<any[]>(`${this.BASE_URL}/records/${status}`).pipe(
      map(backendList => backendList.map(item => this.mapToFrontend(item))),
      tap(transactions => this.transactionsSubject$.next(transactions))
    );
  }

  /**
   * Get ID: Check memory first, then fallback to API
   */
  getTransactionById(id: string | number): Observable<UndertakingTransaction> {
    const cached = this.transactionsSubject$.value.find(t => t.id == id);
    
    if (cached) {
      this.currentTransaction = cached;
      return of(cached);
    }

    return this.http.get<any>(`${this.BASE_URL}/${id}`).pipe(
      map(data => this.mapToFrontend(data)),
      tap(tx => this.currentTransaction = tx)
    );
  }

  // ==========================================
  // 3. WRITE OPERATIONS
  // ==========================================

  /**
   * Create New Draft
   * Endpoint: POST /save
   */
  saveDraft(formData: any, id?: string | number | null): Observable<UndertakingTransaction> {
    const payload = this.transformToBackendDTO(formData, id);

    return this.http.post<any>(`${this.BASE_URL}/save`, payload).pipe(
      map(savedData => this.mapToFrontend(savedData)),
      tap(savedTx => this.updateLocalState(savedTx))
    );
  }

  /**
   * Update Existing Draft
   * Endpoint: PUT /draft/{id}
   */
  updateDraft(formData: any): Observable<UndertakingTransaction> {
    // 1. Ensure we have an ID
    const id = formData.id || this.currentTransaction?.id;
    
    if (!id) {
        console.error("Update failed: Missing Transaction ID", formData);
        throw new Error("Cannot update draft without an ID.");
    }

    const payload = this.transformToBackendDTO(formData, id);

    return this.http.put<any>(`${this.BASE_URL}/draft/${id}`, payload).pipe(
      map(updatedData => this.mapToFrontend(updatedData)),
      tap(updatedTx => this.updateLocalState(updatedTx))
    );
  }

  /**
   * Final Submission
   * Endpoint: POST /submit/{id}
   */
  submitTransaction(id: string | number, payload?: any): Observable<UndertakingTransaction> {
    
    // Safe Logic: If payload exists, transform it. If not, send null.
    // This prevents sending an empty object {} which might overwrite data on backend.
    const body = payload ? this.transformToBackendDTO(payload, id) : null; 
    
    return this.http.post<any>(`${this.BASE_URL}/submit/${id}`, body).pipe(
      map(updatedData => this.mapToFrontend(updatedData)),
      tap(updatedTx => this.updateLocalState(updatedTx))
    );
  }
  
  approveUndertaking(id: string | number): Observable<UndertakingTransaction> {
    return this.http.post<any>(`${this.BASE_URL}/approve/${id}`, {}).pipe(
      map(updatedData => this.mapToFrontend(updatedData)),
      tap(updatedTx => this.updateLocalState(updatedTx))
    );
  }

  rejectUndertaking(id: string | number, reason: string): Observable<UndertakingTransaction> {
    return this.http.post<any>(`${this.BASE_URL}/reject/${id}`, { reason }).pipe(
      map(updatedData => this.mapToFrontend(updatedData)),
      tap(updatedTx => this.updateLocalState(updatedTx))
    );
  }

  // --- OTHER ACTIONS ---

  issueTransaction(id: any): Observable<UndertakingTransaction> {
    return this.http.post<any>(`${this.BASE_URL}/issue/${id}`, {}).pipe(
      map(updatedData => this.mapToFrontend(updatedData)),
      tap(updatedTx => this.updateLocalState(updatedTx))
    );
  }

  cancelTransaction(id: any): Observable<UndertakingTransaction> {
    return this.http.post<any>(`${this.BASE_URL}/cancel/${id}`, {}).pipe(
      map(updatedData => this.mapToFrontend(updatedData)),
      tap(updatedTx => this.updateLocalState(updatedTx))
    );
  }

  // ==========================================
  // 4. HELPERS & STATE UPDATERS
  // ==========================================

  private updateLocalState(updatedTx: UndertakingTransaction) {
    const currentList = this.transactionsSubject$.value;
    const index = currentList.findIndex(t => t.id === updatedTx.id);

    if (index > -1) {
      // Update existing
      const updatedList = [...currentList];
      updatedList[index] = updatedTx;
      this.transactionsSubject$.next(updatedList);
    } else {
      // Add new
      this.transactionsSubject$.next([updatedTx, ...currentList]);
    }
    this.currentTransaction = updatedTx;
  }

  // ==========================================
  // 5. DATA MAPPERS (DTO <-> Form)
  // ==========================================

  private mapToFrontend(backendData: any): UndertakingTransaction {
    return {
      id: backendData.id,
      channelReference: backendData.channelReference || backendData.tnxId || `REF-${backendData.id}`,
      status: backendData.status || 'Draft',
      lastUpdated: backendData.updatedAt ? new Date(backendData.updatedAt) : new Date(),
      formData: this.transformToAngularForm(backendData)
    };
  }

  /**
   * Maps Java Entity (Flat) -> Angular Form (Nested)
   */
  private transformToAngularForm(backendData: any): any {
    if (!backendData) return {};
    
    return {
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
        expiryDate: backendData.expiryDate ? new Date(backendData.expiryDate).toISOString().split('T')[0] : '',
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
      instructions: {
        deliveryType: backendData.deliveryType,
        deliveryMode: backendData.deliveryMode,
        deliveryTo: backendData.deliveryTo,
        principalAccount: backendData.principalAccount,
        feeAccount: backendData.feeAccount,
        otherInstructions: backendData.otherInstructions
      },
      attachments: {
        files: backendData.files || []
      }
    };
  }

  /**
   * Maps Frontend Data -> Java Entity (Flat)
   * SMART UPDATE: Handles both Flat (DTO) and Nested (Form) inputs
   */
  private transformToBackendDTO(form: any, id?: string | number | null): any {
    if (!form) return {};

    // 1. If form is already flat (Flattened by Component), use it directly
    if (form.productType || form.applicantName || form.undertakingAmount) {
        return {
            ...form,
            id: id || form.id || null
        };
    }

    // 2. If form is Nested (Angular Form Group structure), Flatten it
    const gen = form.generalDetails || {};
    const app = form.applicantBeneficiary || {};
    const bank = form.bankForm || {};
    const und = form.undertakingDetails || {};
    const inst = form.instructions || {};

    return {
      // Identity
      id: id || form.id || null, 

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
      files: form.attachments?.files || form.files || []
    };
  }
}