import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private customerDataSource = new BehaviorSubject<any>(null);
  customerData$ = this.customerDataSource.asObservable();

  saveCustomerData(data: any) {
    this.customerDataSource.next(data);
    
  }
}
 