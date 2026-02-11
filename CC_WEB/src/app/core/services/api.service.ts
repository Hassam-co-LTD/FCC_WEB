import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, retry, throwError } from 'rxjs';
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
  private middlewareURl = `${environment.apiURL_MIDDLEWARE}`; 

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


  /**
   * Save draft (pending record) - status "I"
   */
  savePending(data: ImportLcTransaction): Observable<ImportLcTransaction> {
    console.log('Saving draft:', data);
    const companyId = sessionStorage.getItem('companyId')
    const headers = new HttpHeaders({
      companyid: companyId ?? ''
    });
    return this.http.post<ImportLcTransaction>(`${this.baseUrl}/importlc/save`, data,
       {headers})
      .pipe(catchError(this.handleError));
  }

  // Get full transactions by status
  getTransactionsByStatus(status: string): Observable<ImportLcTransaction[]> {
    const companyId = sessionStorage.getItem('companyId')
    const headers = new HttpHeaders({
      companyid: companyId ?? ''
    });
    return this.http.get<ImportLcTransaction[]>(
      `${this.baseUrl}/importlc/status/${status}`,
      {headers}
    )
      .pipe(catchError(this.handleError));
  }

  // Get lightweight records by status (DTO) {-------FOR TABS VIEW-------}
  getRecordTransactionsByStatus(status: string): Observable<ImportLcTransaction[]> {
    const companyId = sessionStorage.getItem('companyId')
    const headers = new HttpHeaders({
      companyid: companyId ?? ''
    });
    return this.http.get<ImportLcTransaction[]>(`${this.baseUrl}/importlc/records/${status}`, { headers })
      .pipe(catchError(this.handleError));
  }


  //  Get draft (pending record) 

  getPendingTransactions() {
    return this.http.get<ImportLcTransaction[]>(`${this.baseUrl}importlc/pending`);
  }

  //  Get draft (pending record) by TNX ID

  getPendingByTnxId(tnxId: string): Observable<ImportLcTransaction> {
    return this.http.get<ImportLcTransaction>(`${this.baseUrl}importlc/pending/${tnxId}`);
  }

  //  Update draft (pending record) by Tnx ID

  // Update draft (pending record) by Tnx ID
  updatePendingByTnxId(payload: ImportLcTransaction): Observable<ImportLcTransaction> {
    console.log('Payload before update:', payload);
    return this.http
      .put<ImportLcTransaction>(`${this.baseUrl}/importlc/${payload.tnxId}`, payload)
      .pipe(catchError(this.handleError));
  }

  // Submit transaction (status "S") with full data

  /**
   * Submit transaction (status "S") with full data
   */
  submitTransaction(tnxId: string, data: ImportLcTransaction) {
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
    });
  }

  /**
   * Approve transaction by TNX ID (status "A")
   */
  approveTransaction(tnxId: string, data: ImportLcTransaction): Observable<ImportLcTransaction> {
    console.log('Approving transaction ID:', tnxId);
    return this.http.post<ImportLcTransaction>(`${this.baseUrl}/importlc/approve/${tnxId}`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }




  // admin side generic methods

// save transaction
saveTnx(tnx:any,name:String){
   return this.http.post<any>(`${this.baseUrl}${name}`,tnx)
}
// get transaction by status
getTnxByStatus(status:String,Tnx:String){
   return this.http.get<any>(`${this.baseUrl}${Tnx}/status/${status}`);
}

// get transaction by id

getTnxById(id:Number,name:String){
    return this.http.get<any>(`${this.baseUrl}${name}/id/${id}`);
}
getTnxByRolId(id:String,name:String){
    return this.http.get<any>(`${this.baseUrl}${name}/id/${id}`);
}
// update transaction 
updateTnx(data:any,name:String,id?:Number){
     console.log("the id ",id);
    return this.http.put<any>(`${this.baseUrl}${name}/update/${id}`,data);
}
updateTnxByRoleId(data:any,name:String,id:String){
     console.log("the id ",id);
    return this.http.put<any>(`${this.baseUrl}${name}/update/${id}`,data);
}
// set transaction status by id
setTnxByStatus(status: string, id: Number, name: string) {
  console.log('Setting status:', status, 'for ID:', id, 'on', name);

  const url = `${this.baseUrl}${name}/setStatus/${id}`;
  return this.http.put<any>(url, null, { params: { status } }); 
}

//get list of data
getDatalist(name:String){
   return this.http.get<any>(`${this.baseUrl}${name}/list`);
}

deleteTnx(payload: any, name: string) {
  return this.http.delete<any>(`${this.baseUrl}${name}`, {
    body: payload
  });
}
updateTnxx(payload: any, name: string) {
  return this.http.put<any>(`${this.baseUrl}${name}`, payload);
}
getRolesByUser(userId: Number,name:String): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}${name}/${userId}`);
}
setStatusByRoleId(status: String, id: String, name: String) {
  console.log('Setting status:', status, 'for Role ID:', id, 'on', name);
  const url = `${this.baseUrl}${name}/setStatus/${id}`;
  return this.http.put<any>(url, status);

}

 
  /** Reject Reason */
  rejectTransaction(tnxId: string, reason: string): Observable<ImportLcTransaction> {
    return this.http.post<ImportLcTransaction>(`${this.baseUrl}/importlc/rejectReason/${tnxId}`, {rejectionReason: reason}, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }
  // update-Rejected
  updateRejectedTransaction(tnxId: string, payload: ImportLcTransaction) {
    return this.http.put<ImportLcTransaction>(`${this.baseUrl}/importlc/updateRejected/${tnxId}`, payload,{
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
  const body = { rejectionReason: reason }; // ✅ correct key
  return this.http.post<UndertakingLc>(
    `${this.baseUrl}undertaking_lc/rejectReason/${id}`, // ✅ match backend
    body,
    { headers: { 'Content-Type': 'application/json' } }
  ).pipe(catchError(this.handleError));
}
//   updateRejectedTransaction(id: number | string, payload: UndertakingLc): Observable<UndertakingLc> {
//     return this.http.put<UndertakingLc>(`${this.baseUrl}undertaking_lc/updateRejected/${id}`, payload)
//       .pipe(catchError(this.handleError));
//   }
// }
// =================================================================
// API Methods For UNDERTAKING LC MODULE END
// =================================================================
}
