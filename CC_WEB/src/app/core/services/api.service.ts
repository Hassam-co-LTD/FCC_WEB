import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ImportLcTransaction } from '../models/import-lc';
import { TransferDTO, RecordsListTransferDTO, AccountsMaster, AccountAccessPolicyDTO } from '../models/my-accounts';
import { RecordListDTO, UndertakingRequestDTO, UndertakingResponseDTO, UndertakingFormModel } from '../models/undertaking-lc';import { ShippingGuaranteeTransaction } from '../models/shipping-guarantee';
import { DynamicFieldsResponseDto } from '../../screens/ADMIN/admin-dashboard/components/create-generate-fields/create-generate-fields';
import { ExportCollectionTransaction } from '../models/export-collection';


// --- UPDATED INTERFACE FOR UNDERTAKING LC ---
export interface UndertakingLc {
  id?: number | string;
  tnxId?: string;
  channelReference?: string; // e.g. UND-2025-001
  status?: string;
 
  // Flat fields for Table View
  productType?: string;
  applicantName?: string;
  beneficiaryName?: string;
  undertakingAmount?: number;
  currency?: string;
  expiryDate?: string;
 
  // The Nested Form Data
  formData?: any;
 
  // Flexible key for any extra props
  [key: string]: any;
}
 
@Injectable({
  providedIn: 'root',
})
export class ApiService {
 
  // -------------------------------------------------------------
  // CONFIGURATION
  // -------------------------------------------------------------
  // --- DYNAMIC BASE URL CONFIGURATION ---

  // Settlement System (Trade Finance)
  private get baseUrl(): string {
    return `${environment.gatewayUrl}/settlementsystem/api/v1`;
  }

  // Admin/Security System (Login, Roles, Users)
  private get adminBaseUrl(): string {
    return `${environment.gatewayUrl}/secondAdmin/api/v1/`;
  }
  // Ensure your environment.apiUrl is 'http://localhost:8084/api/v1/'
  // private baseUrl = `${environment.apiUrl}`;
  // private middlewareURl = `${environment.apiURL_MIDDLEWARE}`;

  constructor(private http: HttpClient) { }
 
  /* ------------------------------------- Error Handler ------------------------------------- */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unexpected error occurred. Please try again later.';
 
    if (error.error instanceof ErrorEvent) {
      // Client-side / network error
      console.error('Client-side error:', error.error.message);
      errorMessage = error.error.message;
    } else {
      // Backend error
      console.error(
        `Backend error [${error.status}]:`,
        error.error
      );
 
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server.';
      } else if (error.status === 404) {
        errorMessage = 'Requested resource not found.';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error.';
      }
    }
 
    return throwError(() => new Error(errorMessage));
  }
  /* ------------------------------------- Error Handler END ------------------------------------- */




  /* -------------------- API Methods -------------------- */
  saveamendTransaction(tnxId: string, data: ImportLcTransaction): Observable<ImportLcTransaction> {
    return this.http.put<ImportLcTransaction>(
      `${this.baseUrl}/importlc/amend/${tnxId}`,
      data,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    ).pipe(catchError(this.handleError));
  }
 
  // Save LC Record (pending record) - status "I"
 
  // savePending(data: ImportLcTransaction): Observable<ImportLcTransaction> {
  //   console.log('Saving draft:', data);
  //   const companyId = sessionStorage.getItem('userData.companyId')
  //   const headers = new HttpHeaders({
  //     companyid: companyId ?? ''
  //   });
  //   return this.http.post<ImportLcTransaction>(`${this.baseUrl}/importlc/save`, data,
  //     { headers })
  //     .pipe(catchError(this.handleError));
  // }


  savePending(data: ImportLcTransaction): Observable<ImportLcTransaction> {
    console.log('Saving draft:', data);

    const userDataStr = sessionStorage.getItem('userData');

    let companyId = '';

    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      companyId = userData.companyId;
    }

    const headers = new HttpHeaders({
      companyid: companyId
    });

    return this.http.post<ImportLcTransaction>(
      `${this.baseUrl}/importlc/save`,
      data,
      { headers }
    ).pipe(catchError(this.handleError));
  }
 

  // Get full transactions by status
  // getTransactionsByStatus(status: string): Observable<ImportLcTransaction[]> {
  //   const companyId = sessionStorage.getItem('companyId')
  //   const headers = new HttpHeaders({
  //     companyid: companyId ?? ''
  //   });
  //   return this.http.get<ImportLcTransaction[]>(
  //     `${this.baseUrl}/importlc/status/${status}`,
  //     {headers}
  //   )
  //     .pipe(catchError(this.handleError));
  // }

  // Get lightweight records by status (DTO) {-------FOR TABS VIEW-------}
  getRecordTransactionsByStatus(status: string): Observable<ImportLcTransaction[]> {
    const companyId = sessionStorage.getItem('companyId')
    const headers = new HttpHeaders({
      companyid: companyId ?? ''
    });
    return this.http.get<ImportLcTransaction[]>(`${this.baseUrl}/importlc/records/${status}`, { headers })
      .pipe(catchError(this.handleError));
  }
 
  // getPendingByTnxId(tnxId: string): Observable<ImportLcTransaction> {
  //   return this.http.get<ImportLcTransaction>(`${this.baseUrl}importlc/pending/${tnxId}`)
  //     .pipe(catchError(this.handleError));
  // }

  // Update draft (pending record) by Tnx ID
  updatePendingByTnxId(payload: ImportLcTransaction): Observable<ImportLcTransaction> {
    console.log('Payload before update:', payload);
    return this.http
      .put<ImportLcTransaction>(`${this.baseUrl}/importlc/${payload.tnxId}`, payload)
      .pipe(catchError(this.handleError));
  }
 
  // Submit transaction (status "S") with full data
 
  submitTransaction(
    tnxId: string,
    data: ImportLcTransaction
  ): Observable<ImportLcTransaction> {
    console.log('Submitting transaction:', tnxId, data);
    return this.http
      .post<ImportLcTransaction>(`${this.baseUrl}/importlc/submit/${tnxId}`, data, {
        headers: { 'Content-Type': 'application/json' }
      })
      .pipe(catchError(this.handleError));
  }
 
  // Get Transaction by TNX ID for READ-ONLY view for approved/rejected records
  getTransactionByTnxId(tnxId: string): Observable<ImportLcTransaction> {
    return this.http.get<ImportLcTransaction>(`${this.baseUrl}/importlc/${tnxId}`, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }
 
  /** Approve transaction */
  approveTransaction(tnxId: string, data: ImportLcTransaction): Observable<ImportLcTransaction> {
    console.log('Approving transaction ID:', tnxId);
    return this.http.post<ImportLcTransaction>(`${this.baseUrl}/importlc/approve/${tnxId}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }
 
 
  /** Reject Reason */
  rejectTransaction(tnxId: string, reason: string): Observable<ImportLcTransaction> {
    return this.http.post<ImportLcTransaction>(`${this.baseUrl}/importlc/rejectReason/${tnxId}`, { rejectionReason: reason }, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }
  // update-Rejected
  updateRejectedTransaction(tnxId: string, payload: ImportLcTransaction) {
    return this.http.put<ImportLcTransaction>(`${this.baseUrl}/importlc/updateRejected/${tnxId}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }
  /* -------------------- IMPORT LC API Methods END -------------------- */

  // =================================================================
  // API Methods For SHIPPING GUARANTEE MODULE START
  // =================================================================
  // Save LC Record (pending record) - status "I"

  savePendingShippingGuarantee(data: ShippingGuaranteeTransaction): Observable<ShippingGuaranteeTransaction> {
    console.log('Saving draft:', data);
    const companyId = sessionStorage.getItem('companyId')
    const headers = new HttpHeaders({
      companyid: companyId ?? ''
    });
    return this.http.post<ShippingGuaranteeTransaction>(`${this.baseUrl}/shippingguarantee/save`, data,
      { headers })
      .pipe(catchError(this.handleError));
  }

  // Get lightweight records by status (DTO) {-------FOR TABS VIEW-------} --- List so using ShippingGuaranteeTransaction[] -> "[]"
  getRecordTransactionsByStatusForShippingGuarantee(status: String): Observable<ShippingGuaranteeTransaction[]> {
    const companyId = sessionStorage.getItem('companyId')
    const headers = new HttpHeaders({
      companyid: companyId ?? ''
    })
    return this.http.get<ShippingGuaranteeTransaction[]>(`${this.baseUrl}/shippingguarantee/records/${status}`, { headers })
      .pipe(catchError(this.handleError));
  }

  // Update draft (pending record) by Tnx ID
  updatePendingByTnxIdForShippingGuarantee(
    tnxId: string,
    payload: ShippingGuaranteeTransaction
  ): Observable<ShippingGuaranteeTransaction> {

    return this.http
      .put<ShippingGuaranteeTransaction>(
        `${this.baseUrl}/shippingguarantee/${tnxId}`,
        payload
      )
      .pipe(catchError(this.handleError));
  }

  // Submit transaction (status "S") with full data

  submitShippingGuaranteeByTnxId(
    tnxId: string,
    data: ShippingGuaranteeTransaction
  ): Observable<ShippingGuaranteeTransaction> {
    console.log('Submitting transaction:', tnxId, data);
    return this.http
      .post<ShippingGuaranteeTransaction>(`${this.baseUrl}/shippingguarantee/submit/${tnxId}`, data, {
        headers: { 'Content-Type': 'application/json' }
      })
      .pipe(catchError(this.handleError));
  }

  // Get Transaction by TNX ID for record clicking for READ-ONLY view for approved/rejected records --- NOT a List so not using ShippingGuaranteeTransaction X -> []
  getTransactionForShippingGuaranteeByTnxId(tnxId: string): Observable<ShippingGuaranteeTransaction> {
    return this.http.get<ShippingGuaranteeTransaction>(`${this.baseUrl}/shippingguarantee/${tnxId}`, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }

  /** Approve transaction */
  approveTransactionForShippingGuarantee(tnxId: string, data: ShippingGuaranteeTransaction): Observable<ShippingGuaranteeTransaction> {
    console.log('Approving transaction ID:', tnxId);
    return this.http.post<ShippingGuaranteeTransaction>(`${this.baseUrl}/shippingguarantee/approve/${tnxId}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }


  /** Reject Reason */
  rejectTransactionForShippingGuarantee(tnxId: string, reason: string): Observable<ShippingGuaranteeTransaction> {
    return this.http.post<ShippingGuaranteeTransaction>(`${this.baseUrl}/shippingguarantee/rejectReason/${tnxId}`, { rejectionReason: reason }, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }
  // update-Rejected
  updateRejectedTransactionForShippingGuarantee(tnxId: string, payload: ShippingGuaranteeTransaction) {
    return this.http.put<ShippingGuaranteeTransaction>(`${this.baseUrl}/shippingguarantee/updateRejected/${tnxId}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }
  // -------------------- SHIPPING GUARANTEE API MODULE END --------------------




  // =================================================================
  // API Methods For EXPORT COLLECTION MODULE START  
  // =================================================================
  
  // Save LC Record (pending record) - status "I"
  savePendingForExportCollection(data: ExportCollectionTransaction): Observable<ExportCollectionTransaction> {
    console.log('Saving draft:', data);
    const companyId = sessionStorage.getItem('companyId')
    const headers = new HttpHeaders({
      companyid: companyId ?? ''
    });
    return this.http.post<ExportCollectionTransaction>(`${this.baseUrl}/exportcollection/save`, data,
      { headers })
      .pipe(catchError(this.handleError));
  }

  // Get lightweight records by status (DTO) {-------FOR TABS VIEW-------} --- List so using ShippingGuaranteeTransaction[] -> "[]"
  getRecordTransactionsByStatusForExportCollection(status: String): Observable<ExportCollectionTransaction[]> {
    const companyId = sessionStorage.getItem('companyId')
    const headers = new HttpHeaders({
      companyid: companyId ?? ''
    })
    return this.http.get<ExportCollectionTransaction[]>(`${this.baseUrl}/exportcollection/records/${status}`, { headers })
      .pipe(catchError(this.handleError));
  }

  // Update draft (pending record) by Tnx ID
  updatePendingByTnxIdForExportCollection(
    tnxId: string,
    payload: ExportCollectionTransaction
  ): Observable<ExportCollectionTransaction> {

    return this.http
      .put<ExportCollectionTransaction>(
        `${this.baseUrl}/exportcollection/${tnxId}`,
        payload
      )
      .pipe(catchError(this.handleError));
  }

  // Submit transaction (status "S") with full data

  submitExportCollectionByTnxId(
    tnxId: string,
    data: ExportCollectionTransaction
  ): Observable<ExportCollectionTransaction> {
    console.log('Submitting transaction:', tnxId, data);
    return this.http
      .post<ExportCollectionTransaction>(`${this.baseUrl}/exportcollection/submit/${tnxId}`, data, {
        headers: { 'Content-Type': 'application/json' }
      })
      .pipe(catchError(this.handleError));
  }

  // Get Transaction by TNX ID for record clicking for READ-ONLY view for approved/rejected records --- NOT a List so not using ShippingGuaranteeTransaction X -> []
  getTransactionForExportCollectionByTnxId(tnxId: string): Observable<ExportCollectionTransaction> {
    return this.http.get<ExportCollectionTransaction>(`${this.baseUrl}/exportcollection/${tnxId}`, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }

  /** Approve transaction */
  approveTransactionForExportCollection(tnxId: string, data: ExportCollectionTransaction): Observable<ExportCollectionTransaction> {
    console.log('Approving transaction ID:', tnxId);
    return this.http.post<ExportCollectionTransaction>(`${this.baseUrl}/exportcollection/approve/${tnxId}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }


  /** Reject Reason */
  rejectTransactionForExportCollection(tnxId: string, reason: string): Observable<ExportCollectionTransaction> {
    return this.http.post<ExportCollectionTransaction>(`${this.baseUrl}/exportcollection/rejectReason/${tnxId}`, { rejectionReason: reason }, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }
  // update-Rejected
  updateRejectedTransactionForExportCollection(tnxId: string, payload: ExportCollectionTransaction) {
    return this.http.put<ExportCollectionTransaction>(`${this.baseUrl}/exportcollection/updateRejected/${tnxId}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }
  //=================================================================
  // API Methods For UNDERTAKING LC MODULE (ALIGNED WITH CONTROLLER)
  // =================================================================

  getUndertakingByStatus(status: string): Observable<RecordListDTO[]> {
    const companyId = sessionStorage.getItem('companyId') || '';
    const headers = new HttpHeaders({ companyid: companyId });
    return this.http.get<RecordListDTO[]>(
      `${this.baseUrl}/undertaking_lc/status/${status}`,
      { headers }
    ).pipe(catchError(this.handleError));
  }

  getUndertakingRecordsByStatus(status: string): Observable<RecordListDTO[]> {
    return this.http.get<RecordListDTO[]>(
      `${this.baseUrl}/undertaking_lc/records/${status}`
    ).pipe(catchError(this.handleError));
  }

  getUndertakingByTnxId(tnxId: string): Observable<UndertakingResponseDTO> {
    return this.http.get<UndertakingResponseDTO>(
      `${this.baseUrl}/undertaking_lc/${tnxId}`
    ).pipe(catchError(this.handleError));
  }

  saveUndertakingDraft(dto: UndertakingRequestDTO): Observable<UndertakingResponseDTO> {
    const companyId = sessionStorage.getItem('companyId') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      companyid: companyId
    });
    return this.http.post<UndertakingResponseDTO>(
      `${this.baseUrl}/undertaking_lc/save`,
      dto,
      { headers }
    ).pipe(catchError(this.handleError));
  }

updateUndertakingDraft(tnxId: string, dto: UndertakingRequestDTO): Observable<UndertakingResponseDTO> {
  const url = `${this.baseUrl}undertaking/update-draft/${tnxId}`;

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'companyid': sessionStorage.getItem('companyId') || 'ABC'
  });

  return this.http.put<UndertakingResponseDTO>(url, dto, { headers })
    .pipe(catchError(this.handleError));
}

  submitUndertaking(tnxId: string, dto: UndertakingRequestDTO): Observable<UndertakingResponseDTO> {
    return this.http.post<UndertakingResponseDTO>(
      `${this.baseUrl}/undertaking_lc/submit/${tnxId}`,
      dto,
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(catchError(this.handleError));
  }

  approveUndertaking(tnxId: string, dto: UndertakingRequestDTO): Observable<UndertakingResponseDTO> {
    return this.http.post<UndertakingResponseDTO>(
      `${this.baseUrl}/undertaking_lc/approve/${tnxId}`,
      dto,
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(catchError(this.handleError));
  }

  rejectUndertaking(tnxId: string, rejectionReason: string): Observable<UndertakingResponseDTO> {
    const body = { rejectionReason };
    return this.http.post<UndertakingResponseDTO>(
      `${this.baseUrl}/undertaking_lc/rejectReason/${tnxId}`,
      body,
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(catchError(this.handleError));
  }

  updateRejectedUndertaking(tnxId: string, dto: UndertakingRequestDTO): Observable<UndertakingResponseDTO> {
    return this.http.put<UndertakingResponseDTO>(
      `${this.baseUrl}/undertaking_lc/updateRejected/${tnxId}`,
      dto,
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(catchError(this.handleError));
  }

  // =================================================================
  // TRANSFERS API Methods
  // =================================================================

  saveTransferDraft(data: TransferDTO): Observable<TransferDTO> {
    const companyId = sessionStorage.getItem('companyId') || 'ABC';
    const headers = new HttpHeaders()
      .set('companyid', companyId);

    console.log('Sending to Backend -> companyid:', companyId);

    return this.http.post<TransferDTO>(
      `${this.baseUrl}/transfers/save`,
      data,
      { headers }
    ).pipe(catchError(this.handleError));
  }
  getTransfersByStatus(status: string): Observable<TransferDTO[]> {
    const companyId = sessionStorage.getItem('companyId') || '';
    const headers = new HttpHeaders({
      'companyid': companyId
    });
    return this.http.get<TransferDTO[]>(`${this.baseUrl}/transfers/status/${status}`, { headers })
      .pipe(catchError(this.handleError));
  }

  getTransferRecordsByStatus(status: string): Observable<RecordsListTransferDTO[]> {
    return this.http.get<RecordsListTransferDTO[]>(`${this.baseUrl}/transfers/records/${status}`)
      .pipe(catchError(this.handleError));
  }

  getTransferByTnxId(tnxId: string): Observable<TransferDTO> {
    return this.http.get<TransferDTO>(`${this.baseUrl}/transfers/${tnxId}`)
      .pipe(catchError(this.handleError));
  }

  updateTransferDraft(tnxId: string, data: TransferDTO): Observable<TransferDTO> {
    return this.http.put<TransferDTO>(`${this.baseUrl}/transfers/${tnxId}`, data)
      .pipe(catchError(this.handleError));
  }

  submitTransfer(tnxId: string, data: TransferDTO): Observable<TransferDTO> {
    return this.http.post<TransferDTO>(`${this.baseUrl}/transfers/submit/${tnxId}`, data)
      .pipe(catchError(this.handleError));
  }

  approveTransfer(tnxId: string, data: TransferDTO): Observable<TransferDTO> {
    return this.http.post<TransferDTO>(`${this.baseUrl}/transfers/approve/${tnxId}`, data)
      .pipe(catchError(this.handleError));
  }

  // In your ApiService
  rejectTransfer(tnxId: string, reason: string): Observable<TransferDTO> {
    const body = { rejectionReason: reason };
    return this.http.post<TransferDTO>(
      `${this.baseUrl}/transfers/rejectReason/${tnxId}`,
      body
    ).pipe(
      catchError(this.handleError)
    );
  }

  updateRejectedTransfer(tnxId: string, data: TransferDTO): Observable<TransferDTO> {
    return this.http.put<TransferDTO>(`${this.baseUrl}/transfers/updateRejected/${tnxId}`, data)
      .pipe(catchError(this.handleError));
  }

  // =================================================================
  // ACCOUNTS API Methods (UPDATED WITH PARAMETERS)
  // =================================================================

  /**
   * Get accessible accounts based on user role and access policies
   */
  getAccessibleAccounts(userRole: string, companyId: string, userId: string): Observable<AccountsMaster[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get<AccountsMaster[]>(
      `${this.baseUrl}accounts/accessible?companyId=${companyId}&userId=${userId}&userRole=${userRole}`,
      { headers }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Get accounts that can be transferred FROM
   */
  getTransferFromAccounts(userRole: string, companyId: string, userId: string): Observable<AccountsMaster[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get<AccountsMaster[]>(
      `${this.baseUrl}accounts/transfer-from?companyId=${companyId}&userId=${userId}&userRole=${userRole}`,
      { headers }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Get accounts that can be transferred TO
   */
  getTransferToAccounts(userRole: string, companyId: string, userId: string): Observable<AccountsMaster[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get<AccountsMaster[]>(
      `${this.baseUrl}accounts/transfer-to?companyId=${companyId}&userId=${userId}&userRole=${userRole}`,
      { headers }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Check if user has access to specific account
   */
  checkAccountAccess(accountNumber: string, accessType: string): Observable<boolean> {
    const companyId = sessionStorage.getItem('companyId') || '';
    const userId = sessionStorage.getItem('userId') || '';
    const userRole = sessionStorage.getItem('userRole') || '';

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get<boolean>(
      `${this.baseUrl}accounts/check-access?accountNumber=${accountNumber}&companyId=${companyId}&userId=${userId}&userRole=${userRole}&accessType=${accessType}`,
      { headers }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Get company accounts
   */
  getCompanyAccounts(companyId: string): Observable<AccountsMaster[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get<AccountsMaster[]>(
      `${this.baseUrl}accounts/company/${companyId}`,
      { headers }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Get account by number
   */
  getAccountByNumber(accountNumber: string): Observable<AccountsMaster> {
    return this.http.get<AccountsMaster>(`${this.baseUrl}accounts/${accountNumber}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new account
   */
  createAccount(accountData: any): Observable<string> {
    const companyId = sessionStorage.getItem('companyId') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<string>(
      `${this.baseUrl}accounts/save`,
      accountData,
      { headers }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Update existing account
   */
  updateAccount(accountData: any): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<string>(
      `${this.baseUrl}accounts/update`,
      accountData,
      { headers }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Get user roles
   */
  getUserRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}roles/active`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get role by code
   */
  getRoleByCode(roleCode: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}roles/code/${roleCode}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Check if role can transfer funds
   */
  canRoleTransferFunds(roleCode: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}roles/permissions/can-transfer/${roleCode}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Check if role can approve transfers
   */
  canRoleApproveTransfers(roleCode: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}roles/permissions/can-approve/${roleCode}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get account options for dropdown (mock/static data)
   */
  // getAccountOptions(): Observable<any[]> {
  //   const mockAccounts = [
  //     { value: 'ACC001', label: 'Main Operating Account (ACC001) - PKR 5,000,000.00', balance: 5000000.00 },
  //     { value: 'ACC002', label: 'Savings Account (ACC002) - PKR 2,500,000.00', balance: 2500000.00 },
  //     { value: 'ACC003', label: 'USD Foreign Account (ACC003) - USD 100,000.00', balance: 100000.00 }
  //   ];
  //   return new Observable(observer => {
  //     observer.next(mockAccounts);
  //     observer.complete();
  //   });
  // }


  // vs side generic methods

// save transaction
saveTnx(tnx:any,name:String){
   return this.http.post<any>(`${this.adminBaseUrl}${name}`,tnx)
}
// get transaction by status
getTnxByStatus(status:String,Tnx:String){
   return this.http.get<any>(`${this.adminBaseUrl}${Tnx}/status/${status}`);
}

// get transaction by id

getTnxById(id:Number | String,name:String){
    return this.http.get<any>(`${this.adminBaseUrl}${name}/id/${id}`);
}
getTnxByRolId(id:String,name:String){
    return this.http.get<any>(`${this.adminBaseUrl}${name}/id/${id}`);
}
// update transaction 
updateTnx(data:any,name:String,id?:Number){
     console.log("the id ",id);
    return this.http.put<any>(`${this.adminBaseUrl}${name}/update/${id}`,data);
}
updateTnxByRoleId(data:any,name:String,id:String){
     console.log("the id ",id);
    return this.http.put<any>(`${this.adminBaseUrl}${name}/update/${id}`,data);
}
// set transaction status by id
setTnxByStatus(status: string, id: Number, name: string) {
  console.log('Setting status:', status, 'for ID:', id, 'on', name);

  const url = `${this.adminBaseUrl}${name}/setStatus/${id}`;
  return this.http.put<any>(url, null, { params: { status } }); 
}

//get list of data
getDatalist(name:String){
   return this.http.get<any>(`${this.adminBaseUrl}${name}/list`);
}

deleteTnx(payload: any, name: string) {
  return this.http.delete<any>(`${this.adminBaseUrl}${name}`, {
    body: payload
  });
}
updateTnxx(payload: any, name: string) {
  console.log("Updating transaction with payload:", payload);
  return this.http.put<any>(`${this.adminBaseUrl}${name}`, payload);
}
getRolesByUser(userId: Number,name:String): Observable<any> {
  return this.http.get<any>(`${this.adminBaseUrl}${name}/${userId}`);
}
setStatusByRoleId(status: String, id: String, name: String) {
  console.log('Setting status:', status, 'for Role ID:', id, 'on', name);
  const url = `${this.adminBaseUrl}${name}/setStatus/${id}`;
  return this.http.put<any>(url, status);

}

userLogin(payload: any, name: string) {
  return this.http.post<any>(`${this.adminBaseUrl}${name}/login`, payload);
}

getCustomerAccounts(custId:String,name:String){

  return this.http.get<any>(`${this.adminBaseUrl}${name}/${custId}`,)
}

deleteAccount(id:Number,apiName:String){
 return  this.http.delete<any>(`${this.adminBaseUrl}${apiName}/delete/${id}`)
}

getFieldsByScreenAndStatus(screen: string, status: string): Observable<DynamicFieldsResponseDto[]> {
    return this.http.get<DynamicFieldsResponseDto[]>(`${this.adminBaseUrl}dynamic-fields/screen/${screen}/status/${status}`);
}

  getDropdownOptionsByScreenAndType(screen: string, dropdownType: string): Observable<any[]> {
    const params = new HttpParams()
      .set('screen', screen)
      .set('dropdownType', dropdownType);
    return this.http.get<any[]>(`${this.adminBaseUrl}/dynamic-dropdown-options`, { params });
  }

  findByRecordStatusAndScreenAndDropDown(recordStatus: string, screen: string, dropDown: string): Observable<any[]> {
    const params = new HttpParams()
      .set('recordStatus', recordStatus)
      .set('screen',screen)
      .set('dropDown',dropDown);
    return this.http.get<any[]>(`${this.adminBaseUrl}dropdown-values/search`, { params });
  }
 

        // Implementation to fetch dropdown options based on the provided parameters
}