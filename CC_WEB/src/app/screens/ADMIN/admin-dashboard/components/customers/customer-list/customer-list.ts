import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../../../core/services/api.service';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import { Router } from '@angular/router'; 
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { error } from 'node:console';
@Component({


  selector: 'app-customer-status',
  standalone: true,
  templateUrl: './customer-list.html',
  styleUrls: ['./customer-list.scss'],
  imports: [CommonModule, MatTabsModule,FormsModule,ReactiveFormsModule]
})
export class CustomerList implements OnInit {

  selectedTabIndex = 0;

  draftCustomers: any[] = [];
  approvedCustomers: any[] = [];
  submittedCustomers: any[] = [];
  searchText: String = "";
  storeFilteredDraftCustomers : any [] = [];
  storeFilteredSubmittedCustomer: any[] = [];
  storeFilteredApprovedCustomers: any[]= [];
  selectedId = null;
  checkActionId = null;
  editingMode = null
  editingCustomer = null
  savingCustomer = null;
  constructor(private api: ApiService,private router:Router,private route:ActivatedRoute) {}

  ngOnInit(): void {
    this.loadDraftCustomers();
    this.loadApprovedCustomers();
    this.loadSubmittedCustomers();


    
       this.route.queryParams.subscribe(params=> {
            const tab = params["tabName"];
            if(tab==="submitted"){
               this.selectedTabIndex = 2
            }
            else if (tab === "approved"){
               this.selectedTabIndex = 1;
            }
            else {
               this.selectedTabIndex = 0;
            }
    })
  
  }

  onTabChange(index: number) {
    this.selectedTabIndex = index;

    if (index === 0) this.loadDraftCustomers();
    if (index === 1) this.loadApprovedCustomers();
    if (index === 2) this.loadSubmittedCustomers();
  }

  loadDraftCustomers() {
   this.api.getCustomersByStatus('D').subscribe({
  next: res => {
     this.draftCustomers = res
     this.storeFilteredDraftCustomers = [...this.draftCustomers];
  },

  error: err => console.log('Error fetching draft customers', err)
});

  }

filterDraftCustomer(getSearchedId:String){
       if(!getSearchedId) {
          this.storeFilteredDraftCustomers = [...this.draftCustomers]
          return;
       }

       const value = getSearchedId.toLowerCase();
       this.storeFilteredDraftCustomers = this.draftCustomers.filter((c:any)=> {
            return  c.cid.toLowerCase().includes(value)
       })

}

clickOnLegalId(id:any){
  this.selectedId = id;
  console.log(typeof this.selectedId);
  this.checkActionId = id;

}

editCustomer(customer:any){
     this.editingMode  = customer.legalId;
     this.editingCustomer = {...customer};
     console.log("edit customer",this.editingCustomer)
     this.savingCustomer = customer.legalId;
     console.log(this.savingCustomer)
}

submitCustomer(id:any){

}
onCancel(c: any) {
  Object.assign(c, this.editingCustomer); // restore old values
  this.selectedId = null;                // exit edit mode
  this.savingCustomer = null;
}


updateRouter(customer:any){
  this.router.navigate(["/admin/create-customer/"+customer.id])
  
}


loadSubmittedCustomers(){
    this.api.getSubmittedCustomers().subscribe({
      next:res=> {
           this.submittedCustomers= res;
           this.storeFilteredSubmittedCustomer = [...this.submittedCustomers];
           console.log("All submitted customers ", res);
      }
      ,
      error: error=> {
            console.log("err while fetching submitted customers", error);
      }
    })
}

filterSubmittedCustomers(cid:String){
     if(!cid){
        this.storeFilteredSubmittedCustomer = [...this.submittedCustomers];
        return;
     }      

   const  value= cid.toLowerCase();
   this.storeFilteredSubmittedCustomer = this.submittedCustomers.filter((obj:any)=> {
              return obj.cid.toLowerCase().includes(value);
   })

}

loadApprovedCustomers(){
     this.api.getApprovedCustomers().subscribe({
      next:res=> {
          this.approvedCustomers = res;
          this.storeFilteredApprovedCustomers = [...this.approvedCustomers]
          console.log("got approved customers", this.approvedCustomers);
      }
      ,
      error:error=> {
          console.log("error while fetching all the customers",error);
      }

     })
}
 
filterApprovedCustomers(cid:String){
    if(!cid){
       this.storeFilteredApprovedCustomers  = [...this.approvedCustomers];
       return;
    }
    const value = cid.toLowerCase();
    this.storeFilteredApprovedCustomers = this.approvedCustomers.filter((obj)=> {
        return obj.cid.toLowerCase().includes(value);
    })
}
  trackById(index: number, item: any) {
  return item.id;
}

}
