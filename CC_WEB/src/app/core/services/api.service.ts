import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ImportLcTransaction } from '../models/import-lc';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl; // base URL

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
    return this.http.post<ImportLcTransaction>(`${this.baseUrl}importlc/save`, data, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }
  //  Get full transactions by status
  getTransactionsByStatus(status: string): Observable<ImportLcTransaction[]> {
    return this.http.get<ImportLcTransaction[]>(
      `${this.baseUrl}importlc/status/${status}`
    )
      .pipe(catchError(this.handleError));
  }
  //  Get lightweight records by status (DTO) {-------FOR TABS VIEW-------}
  getRecordTransactionsByStatus(status: string): Observable<ImportLcTransaction[]> {
    return this.http.get<ImportLcTransaction[]>(`${this.baseUrl}importlc/records/${status}`)
      .pipe(catchError(this.handleError));
  }
  //  Get pending records by TNX ID

  // getPendingByTnxId(tnxId: string): Observable<ImportLcTransaction> {
  //   return this.http.get<ImportLcTransaction>(`${this.baseUrl}importlc/pending/${tnxId}`)
  //     .pipe(catchError(this.handleError));
  // }

  //  Update draft (pending record) by Tnx ID

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
  approveTransaction(tnxId: string,data: ImportLcTransaction): Observable<ImportLcTransaction> {
    console.log('Approving transaction ID:', tnxId);
    return this.http.post<ImportLcTransaction>(`${this.baseUrl}importlc/approve/${tnxId}`, data, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }


  /** Reject Reason */
  rejectTransaction(tnxId: string, reason: string): Observable<ImportLcTransaction> {
    return this.http.post<ImportLcTransaction>(`${this.baseUrl}importlc/rejectReason/${tnxId}`, {rejectionReason: reason}, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }
  // update-Rejected
  updateRejectedTransaction(tnxId: string, payload: ImportLcTransaction) {
    return this.http.put<ImportLcTransaction>(`${this.baseUrl}importlc/updateRejected/${tnxId}`, payload,{
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(catchError(this.handleError));
  }

  /* -------------------- API Methods END -------------------- */
}
