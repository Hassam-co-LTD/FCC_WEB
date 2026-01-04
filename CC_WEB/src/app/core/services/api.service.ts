import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, retry } from 'rxjs';
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
    return this.http.post(`${this.baseUrl}/preview`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }


  // Post admin/Create-customer 
   
    // Get customers by status (DRAFT / APPROVED / SUBMITTED)
  getCustomersByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/customers?status=${status}`);
  }

  // Create draft customer
  createDraft(customer: any): Observable<any> {
    return this.http.post<any>(this.baseUrl+"/customers", customer);
  }


  // get Customer by Id

  getCustomerById(Id:number){
      return this.http.get(this.baseUrl+"/customers/"+Id);
  }


  // update the customre 

  UpdateCustomer(customer:any) {
      //  console.log("data to send from frontend to backend", customer)this.http.put(this.baseUrl + "/update/" + customer.cId, customer); 
    
 return this.http.put(this.baseUrl + "/customers/update/"+ customer.id, customer);  

  }


  // Submit draft customer
  submitCustomer(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/customers/submit/${id}`, {});
  }


  // load submiteCustomers

  getSubmittedCustomers(){
    return  this.http.get<any>(this.baseUrl+"/customers/submittedCustomers");
  }

  // // Approve submitted customer
  
  setApprovedStatus(id:number):Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/customers/Approved/${id}`,{});
  }

  // get App Approved Customers 

  getApprovedCustomers(){
    return  this.http.get<any>(this.baseUrl+"/customers/ApprovedCustomers")
  }

  // reject the customer and set the status back D

  rejectCustomer(id:number) {
    return this.http.put<any>(`${this.baseUrl}/customers/reject/${id}`,{});
  }

  // set approved status to draft 
  editApprovedCustomer(id:number){
     return this.http.put<any>(`${this.baseUrl}/customers/approvedToDraft/${id}`,{}); 
  }


  

// api services for branch

getAllCities(){
   return this.http.get<any>(`${this.baseUrl}/branch/cities`);
}

// save Branch and set status to draft
saveBranch(data:any){
     return this.http.post( `${this.baseUrl}/branch`,data);   
}

// get All Draft List

getDraftList(){
  return this.http.get<any>(`${this.baseUrl}/branch/draft`);
}

}
 
