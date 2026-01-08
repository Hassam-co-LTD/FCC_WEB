import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ImportLcTransaction } from '../models/import-lc';

// 1. ADD THIS INTERFACE FOR THE NEW MODULE
export interface UndertakingLc {
  id?: number;
  tnxId?: string;
  status?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  
  // -------------------------------------------------------------
  // CONFIGURATION
  // -------------------------------------------------------------
  // FIXED: Removed quotes so it reads the actual variable, not the string '${...}'
  private baseUrl = 'http://localhost:8084/api/v1/'; 

  constructor(private http: HttpClient) { }

  // =================================================================
  // ORIGINAL IMPORT LC METHODS (KEPT EXACTLY AS YOU REQUESTED)
  // =================================================================

  /**
   * Save draft (pending record) - status "I"
   */
  savePending(data: ImportLcTransaction): Observable<ImportLcTransaction> {
    console.log('Saving draft:', data);
    return this.http.post<ImportLcTransaction>(`${this.baseUrl}importlc/save`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Get Status wise records
  getTransactionsByStatus(status: string) {
    return this.http.get<ImportLcTransaction[]>(
      `${this.baseUrl}importlc/status/${status}`
    );
  }

  // Get draft (pending record)
  getPendingTransactions() {
    return this.http.get<ImportLcTransaction[]>(`${this.baseUrl}importlc/pending`);
  }

  // Get draft (pending record) by TNX ID
  getPendingByTnxId(tnxId: string): Observable<ImportLcTransaction> {
    return this.http.get<ImportLcTransaction>(`${this.baseUrl}importlc/pending/${tnxId}`);
  }

  // Update draft (pending record) by Tnx ID
  updatePendingByTnxId(payload: ImportLcTransaction) {
    console.log('Payload before update:', payload);
    return this.http.put<ImportLcTransaction>(
      `${this.baseUrl}importlc/${payload.tnxId}`,
      payload
    );
  }

  /**
   * Submit transaction (status "S") with full data
   */
  submitTransaction(tnxId: string, data: ImportLcTransaction) {
    console.log('Submitting transaction:', tnxId, data);
    return this.http.post<ImportLcTransaction>(
      `${this.baseUrl}importlc/submit/${tnxId}`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Approve transaction by TNX ID (status "A")
   */
  approveTransaction(tnxId: string): Observable<ImportLcTransaction> {
    console.log('Approving transaction ID:', tnxId);
    return this.http.post<ImportLcTransaction>(`${this.baseUrl}importlc/approve/${tnxId}`, {}, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // =================================================================
  // NEW UNDERTAKING LC METHODS (ADDED FOR BACKEND COMPATIBILITY)
  // =================================================================

  getUndertakingList(): Observable<UndertakingLc[]> {
    return this.http.get<UndertakingLc[]>(`${this.baseUrl}undertaking-lc/list`);
  }

  getUndertakingById(id: number): Observable<UndertakingLc> {
    return this.http.get<UndertakingLc>(`${this.baseUrl}undertaking-lc/${id}`);
  }

  saveUndertakingDraft(data: UndertakingLc): Observable<UndertakingLc> {
    return this.http.post<UndertakingLc>(`${this.baseUrl}undertaking-lc/save`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  updateUndertaking(id: number, data: UndertakingLc): Observable<UndertakingLc> {
    return this.http.put<UndertakingLc>(`${this.baseUrl}undertaking-lc/update/${id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  submitUndertaking(id: number): Observable<UndertakingLc> {
    return this.http.post<UndertakingLc>(`${this.baseUrl}undertaking-lc/submit/${id}`, {}, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  approveUndertaking(id: number): Observable<UndertakingLc> {
    return this.http.post<UndertakingLc>(`${this.baseUrl}undertaking-lc/approve/${id}`, {}, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  rejectUndertaking(id: number, reason: string): Observable<UndertakingLc> {
    return this.http.post<UndertakingLc>(`${this.baseUrl}undertaking-lc/reject/${id}`, reason, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // =================================================================
  // HELPERS
  // =================================================================
  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'Server Error'));
  }
}