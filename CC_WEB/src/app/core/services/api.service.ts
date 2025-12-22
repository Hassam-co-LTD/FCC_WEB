import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl; // base URL

  constructor(private http: HttpClient) { }

  // POST preview
  submitPreview(data: any): Observable<any> {
    console.log('Fetching from:', data);
    return this.http.post(`${this.baseUrl}importlc/preview`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
