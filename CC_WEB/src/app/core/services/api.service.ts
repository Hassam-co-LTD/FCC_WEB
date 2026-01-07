import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ImportLcTransaction } from '../models/import-lc';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl; // base URL

  constructor(private http: HttpClient) { }


  /**
   * Save draft (pending record) - status "I"
   */
  savePending(data: ImportLcTransaction): Observable<ImportLcTransaction> {
    console.log('Saving draft:', data);
    return this.http.post<ImportLcTransaction>(`${this.baseUrl}importlc/save`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  
  //  Get Status wise recordss
  getTransactionsByStatus(status: string) {
    return this.http.get<ImportLcTransaction[]>(
      `${this.baseUrl}importlc/status/${status}`
    );
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
}
