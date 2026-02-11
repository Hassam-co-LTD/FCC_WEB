import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ImportLcTransaction } from '../models/import-lc';
import { TransferDTO, RecordsListTransferDTO, AccountsMaster, AccountAccessPolicyDTO } from '../models/my-accounts';


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
  // Ensure your environment.apiUrl is 'http://localhost:8084/api/v1/'
  private baseUrl = `${environment.apiUrl}`;

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

  // Save LC Record (pending record) - status "I"

  savePending(data: ImportLcTransaction): Observable<ImportLcTransaction> {
    console.log('Saving draft:', data);
    const companyId = sessionStorage.getItem('companyId')
    const headers = new HttpHeaders({
      companyid: companyId ?? ''
    });
    return this.http.post<ImportLcTransaction>(`${this.baseUrl}importlc/save`, data,
      { headers })
      .pipe(catchError(this.handleError));
  }

  // Get full transactions by status
  getTransactionsByStatus(status: string): Observable<ImportLcTransaction[]> {
    const companyId = sessionStorage.getItem('companyId')
    const headers = new HttpHeaders({
      companyid: companyId ?? ''
    });
    return this.http.get<ImportLcTransaction[]>(
      `${this.baseUrl}importlc/status/${status}`,
      { headers }
    )
      .pipe(catchError(this.handleError));
  }

  // Get lightweight records by status (DTO) {-------FOR TABS VIEW-------}
  getRecordTransactionsByStatus(status: string): Observable<ImportLcTransaction[]> {
    const companyId = sessionStorage.getItem('companyId')
    const headers = new HttpHeaders({
      companyid: companyId ?? ''
    });
    return this.http.get<ImportLcTransaction[]>(`${this.baseUrl}importlc/records/${status}`, { headers })
      .pipe(catchError(this.handleError));
  }

  // getPendingByTnxId(tnxId: string): Observable<ImportLcTransaction> {
  //   return this.http.get<ImportLcTransaction>(`${this.baseUrl}importlc/pending/${tnxId}`)
  //     .pipe(catchError(this.handleError));
  // }

  //  Update draft (pending record) by Tnx ID

  // Update draft (pending record) by Tnx ID
  updatePendingByTnxId(payload: ImportLcTransaction): Observable<ImportLcTransaction> {
    console.log('Payload before update:', payload);
    return this.http
      .put<ImportLcTransaction>(`${this.baseUrl}importlc/${payload.tnxId}`, payload)
      .pipe(catchError(this.handleError));
  }

  // Submit transaction (status "S") with full data

  submitTransaction(
    tnxId: string,
    data: ImportLcTransaction
  ): Observable<ImportLcTransaction> {
    console.log('Submitting transaction:', tnxId, data);
    return this.http
      .post<ImportLcTransaction>(`${this.baseUrl}importlc/submit/${tnxId}`, data, {
        headers: { 'Content-Type': 'application/json' }
      })
      .pipe(catchError(this.handleError));
  }

  // Get Transaction by TNX ID for READ-ONLY view for approved/rejected records
  getTransactionByTnxId(tnxId: string): Observable<ImportLcTransaction> {
    return this.http.get<ImportLcTransaction>(`${this.baseUrl}importlc/${tnxId}`, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }

  /** Approve transaction */
  approveTransaction(tnxId: string, data: ImportLcTransaction): Observable<ImportLcTransaction> {
    console.log('Approving transaction ID:', tnxId);
    return this.http.post<ImportLcTransaction>(`${this.baseUrl}importlc/approve/${tnxId}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }


  /** Reject Reason */
  rejectTransaction(tnxId: string, reason: string): Observable<ImportLcTransaction> {
    return this.http.post<ImportLcTransaction>(`${this.baseUrl}importlc/rejectReason/${tnxId}`, { rejectionReason: reason }, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }
  // update-Rejected
  updateRejectedTransaction(tnxId: string, payload: ImportLcTransaction) {
    return this.http.put<ImportLcTransaction>(`${this.baseUrl}importlc/updateRejected/${tnxId}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }
  /* -------------------- IMPORT LC API Methods END -------------------- */


  // =================================================================
  // API Methods For UNDERTAKING LC MODULE (ALIGNED WITH CONTROLLER)
  // =================================================================

  getUndertakingList(): Observable<UndertakingLc[]> {
    // GET /api/v1/undertaking_lc/list
    return this.http.get<UndertakingLc[]>(`${this.baseUrl}undertaking_lc/list`)
      .pipe(catchError(this.handleError));
  }

  // 2️⃣ Get record list strictly by STATUS (BEST FOR TABS)
  getUndertakingRecordsByStatus(status: string): Observable<UndertakingLc[]> {
    return this.http.get<UndertakingLc[]>(
      `${this.baseUrl}undertaking_lc/status/${status}`
    ).pipe(catchError(this.handleError));
  }
  getUndertakingById(id: number | string): Observable<UndertakingLc> {
    // GET /api/v1/undertaking_lc/{id}
    return this.http.get<UndertakingLc>(`${this.baseUrl}undertaking_lc/${id}`)
      .pipe(catchError(this.handleError));
  }

  saveUndertakingDraft(data: UndertakingLc): Observable<UndertakingLc> {
    const companyId = sessionStorage.getItem('companyId');
    const headers = new HttpHeaders({
      companyid: companyId ?? ''
    });
    // POST /api/v1/undertaking_lc/save
    return this.http.post<UndertakingLc>(`${this.baseUrl}undertaking_lc/save`, data, { headers })
      .pipe(catchError(this.handleError));
  }

  updateUndertaking(id: number | string, data: UndertakingLc): Observable<UndertakingLc> {
    // PUT /api/v1/undertaking_lc/update/{id}
    return this.http.put<UndertakingLc>(`${this.baseUrl}undertaking_lc/update/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  submitUndertaking(id: number | string): Observable<UndertakingLc> {
    // POST /api/v1/undertaking_lc/submit/{id}
    // Changed from .put to .post to match @PostMapping
    return this.http.post<UndertakingLc>(`${this.baseUrl}undertaking_lc/submit/${id}`, {})
      .pipe(catchError(this.handleError));
  }

  approveUndertaking(id: number | string): Observable<UndertakingLc> {
    // POST /api/v1/undertaking_lc/approve/{id}
    // Changed from .put to .post to match @PostMapping
    return this.http.post<UndertakingLc>(`${this.baseUrl}undertaking_lc/approve/${id}`, {})
      .pipe(catchError(this.handleError));
  }

  rejectUndertaking(id: number | string, reason: string): Observable<UndertakingLc> {
    // POST /api/v1/undertaking_lc/reject/{id}
    // Matches @PostMapping and Map<String, String> payload
    const body = { reason: reason };
    return this.http.post<UndertakingLc>(`${this.baseUrl}undertaking_lc/reject/${id}`, body)
      .pipe(catchError(this.handleError));
  }

  // =================================================================
  // API Methods For UNDERTAKING LC MODULE END
  // =================================================================


  // =================================================================
  // TRANSFERS API Methods
  // =================================================================

  saveTransferDraft(data: TransferDTO): Observable<TransferDTO> {
    const companyId = sessionStorage.getItem('companyId') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'companyid': companyId
    });
    return this.http.post<TransferDTO>(`${this.baseUrl}transfers/save`, data, { headers })
      .pipe(catchError(this.handleError));
  }

  getTransfersByStatus(status: string): Observable<TransferDTO[]> {
    const companyId = sessionStorage.getItem('companyId') || '';
    const headers = new HttpHeaders({
      'companyid': companyId
    });
    return this.http.get<TransferDTO[]>(`${this.baseUrl}transfers/status/${status}`, { headers })
      .pipe(catchError(this.handleError));
  }

  getTransferRecordsByStatus(status: string): Observable<RecordsListTransferDTO[]> {
    return this.http.get<RecordsListTransferDTO[]>(`${this.baseUrl}transfers/records/${status}`)
      .pipe(catchError(this.handleError));
  }

  getTransferByTnxId(tnxId: string): Observable<TransferDTO> {
    return this.http.get<TransferDTO>(`${this.baseUrl}transfers/${tnxId}`)
      .pipe(catchError(this.handleError));
  }

  updateTransferDraft(tnxId: string, data: TransferDTO): Observable<TransferDTO> {
    return this.http.put<TransferDTO>(`${this.baseUrl}transfers/${tnxId}`, data)
      .pipe(catchError(this.handleError));
  }

  submitTransfer(tnxId: string, data: TransferDTO): Observable<TransferDTO> {
    return this.http.post<TransferDTO>(`${this.baseUrl}transfers/submit/${tnxId}`, data)
      .pipe(catchError(this.handleError));
  }

  approveTransfer(tnxId: string, data: TransferDTO): Observable<TransferDTO> {
    return this.http.post<TransferDTO>(`${this.baseUrl}transfers/approve/${tnxId}`, data)
      .pipe(catchError(this.handleError));
  }

// In your ApiService
rejectTransfer(tnxId: string, reason: string): Observable<TransferDTO> {
  const body = { rejectionReason: reason };
  return this.http.post<TransferDTO>(
    `${this.baseUrl}transfers/rejectReason/${tnxId}`, 
    body
  ).pipe(
    catchError(this.handleError)
  );
}

  updateRejectedTransfer(tnxId: string, data: TransferDTO): Observable<TransferDTO> {
    return this.http.put<TransferDTO>(`${this.baseUrl}transfers/updateRejected/${tnxId}`, data)
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
  getAccountOptions(): Observable<any[]> {
    const mockAccounts = [
      { value: 'ACC001', label: 'Main Operating Account (ACC001) - PKR 5,000,000.00', balance: 5000000.00 },
      { value: 'ACC002', label: 'Savings Account (ACC002) - PKR 2,500,000.00', balance: 2500000.00 },
      { value: 'ACC003', label: 'USD Foreign Account (ACC003) - USD 100,000.00', balance: 100000.00 }
    ];
    return new Observable(observer => {
      observer.next(mockAccounts);
      observer.complete();
    });
  }
}