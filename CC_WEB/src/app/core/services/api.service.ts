import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, retry } from 'rxjs';
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


  // Post admin/Create-customer 
   
    // Get customers by status (DRAFT / APPROVED / SUBMITTED)
  getCustomersByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}customers?status=${status}`);
  }

  // Create draft customer
  createDraft(customer: any): Observable<any> {
    return this.http.post<any>(this.baseUrl+"customers", customer);
  }


  // get Customer by Id

  getCustomerById(Id:number){
      return this.http.get(this.baseUrl+"customers/"+Id);
  }


  // update the customre 

  UpdateCustomer(customer:any) {
      //  console.log("data to send from frontend to backend", customer)this.http.put(this.baseUrl + "/update/" + customer.cId, customer); 
    
 return this.http.put(this.baseUrl + "customers/update/"+ customer.id, customer);  

  }


  // Submit draft customer
  submitCustomer(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}customers/submit/${id}`, {});
  }


  // load submiteCustomers

  getSubmittedCustomers(){
    return  this.http.get<any>(this.baseUrl+"customers/submittedCustomers");
  }

  // // Approve submitted customer
  
  setApprovedStatus(id:number):Observable<any> {
    return this.http.put<any>(`${this.baseUrl}customers/Approved/${id}`,{});
  }

  // get App Approved Customers 

  getApprovedCustomers(){
    return  this.http.get<any>(this.baseUrl+"customers/ApprovedCustomers")
  }

  // reject the customer and set the status back D

  rejectCustomer(id:number) {
    return this.http.put<any>(`${this.baseUrl}customers/reject/${id}`,{});
  }

  // set approved status to draft 
  editApprovedCustomer(id:number){
     return this.http.put<any>(`${this.baseUrl}customers/approvedToDraft/${id}`,{}); 
  }


  

// api services for branch

getAllCities(){
   return this.http.get<any>(`${this.baseUrl}branch/cities`);
}

// save Branch and set status to draft
saveBranch(data:any){
     return this.http.post( `${this.baseUrl}branch`,data);   
}

// get All Draft List

getDraftList(){
  return this.http.get<any>(`${this.baseUrl}branch/draft`);
}

// get Draft ById 

getSearchById(id:Number){
   return this.http.get<any>(`${this.baseUrl}branch/${id}`);
}

// update the Draft 

updateDraftBranch(id:number,updateBranch:any){
   
  return this.http.put<any>(`${this.baseUrl}branch/update/${id}`,updateBranch);
}

// submit the form

submitDraftBranch(id:number){
   console.log("submitted id",typeof(id) , id)
  return this.http.get<any>(`${this.baseUrl}branch/submit/${id}`);
}

// get all the submitted
getAllSubmitted(){
    return   this.http.get<any>(`${this.baseUrl}branch`) ;
}

// reject and set status to D
rejectSubmitted(id:number){
  return this.http.get<any>( `${this.baseUrl}branch/reject/${id}`);
}

approved(id:number){
  return this.http.get<any>(`${this.baseUrl}branch/approved/${id}`);
}

// get All Approved

getAllAproved(){
  return this.http.get<any>(`${this.baseUrl}branch/approved`);
}

// set Cities 
setCity(data:any){
   return this.http.post<any>(`${this.baseUrl}branch/city`,data)
}
getCityByStatus(status:String){
   return this.http.get<any>(`${this.baseUrl}cities/${status}`);
}

getCityById(id:number){
    return this.http.get<any>(`${this.baseUrl}city/${id}`);
}

updateCity(data:any){
  
    return this.http.put<any>(`${this.baseUrl}update/city/${data.id}`,data);
}

setCityByStatus(status:String,id:number){
      return this.http.post<any>(`${this.baseUrl}cities/setStatus/${id}`,{status})
}



}
 
