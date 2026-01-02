import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../../../../core/services/api.service';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SharedService } from '../../../../../../core/services/user-service/shared-form-service/shared-service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

import { error } from 'console';
import { Location } from '@angular/common';

import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatInputModule, MatIconModule, MatFormFieldModule, MatSelectModule,CommonModule],
  templateUrl: './create-customer.html',
  styleUrls: ['./create-customer.scss']
})
export class CreateCustomer implements OnInit {
  customerForm!: FormGroup;
  isEditMode : string | null | boolean = null;
  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private getSharedService:SharedService,
    private activateRoute:ActivatedRoute,
    private  location:Location
  ) {}
 getCustomerById : any = ""
  ngOnInit(): void {
  this.customerForm = this.fb.group({
    id: [{ value: '', disabled: true }],
    cId : ['',Validators.required],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    contact: ['', Validators.required],
    legalId: [''],           // corrected
    customerStatus:['',Validators.required],
    branchCode: [''],        // corrected
    countryCity: [''],       // corrected
    customerType: ['Regular', Validators.required], // corrected
    address1: [''],
    address2: [''],
    address3: ['']
    // status is not included, backend will set it
  });
const idParam = this.activateRoute.snapshot.paramMap.get('id');
console.log('customer page', idParam);

const id = Number(idParam);

if (typeof id === 'number' && !isNaN(id)) {
  this.isEditMode = true;

  this.api.getCustomerById(id).subscribe({
    next: res => {
      this.getCustomerById = res;

      console.log(this.getCustomerById.status);
      console.log(this.getCustomerById.id);

      this.customerForm.patchValue(this.getCustomerById);

      console.log('received data getById', this.customerForm.value);
    },
    error: error => {
      console.log('got error while getting customer by Id', error);
    }
  });
}
  }
 
  onSave() {
  console.log('onSave called, form valid?', this.customerForm.valid);
  console.log("myForm",this.customerForm.value)
  if (!this.customerForm.valid) {
    alert('Form is invalid');
    return;
  }

  const payload = this.customerForm.value;
  console.log('Form data to send:', payload);

  this.api.createDraft(payload).subscribe({
    next: (response: any) => {
      console.log('Backend response received:', response);
       
       Swal.fire({
        title: 'Success!',
        text: `your form was saved!`,
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'swal2-top-left', // use our custom top-left class
        },
        showClass: {
          popup: 'swal2-show'
        },
        hideClass: {
          popup: 'swal2-hide'
        }
      });
      
      this.customerForm.reset();

      console.log('Navigating to /admin/customer-list...');
      this.router.navigate(['/admin/customer-list'])
        .then(() => console.log('Navigation successful'))
        .catch(err => console.error('Navigation error:', err));
    },

    error: (error) => {
      console.error('Error while saving customer:', error);
      alert('Error while saving customer');
    }
  });
}

onBack() {
   this.location.back();
}
onCancel(){
  this.customerForm.reset()
}
update(){
    if(this.customerForm.valid){
      
    this.api.UpdateCustomer(this.customerForm.getRawValue()).subscribe({
      next:res=>{
               Swal.fire({
        title: 'Success!',
        text: `customer updated`,
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'swal2-top-left', // use our custom top-left class
        },
        showClass: {
          popup: 'swal2-show'
        },
        hideClass: {
          popup: 'swal2-hide'
        }
      });
      },
      error:error=> {
             console.log("got error while updating",error);
      }
    })
    }
}

submitStatus(id:number){
  console.log("submit id"+id);
    this.api.submitCustomer(id).subscribe({
      next:res=> {
           console.log(res);
           Swal.fire({
        title: 'Success!',
        text: `your form was submitted!`,
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'swal2-top-left', // use our custom top-left class
        },
        showClass: {
          popup: 'swal2-show'
        },
        hideClass: {
          popup: 'swal2-hide'
        }
      });
           this.router.navigate(['/admin/customer-list'], {
  queryParams: { tabName: 'submitted' }
});

      }
      ,
      error:error=> {
           console.log("error while submitting ",error); 
        Swal.fire({
        title: 'Error!',
        text: 'Please enter your name.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
           
      }
    })
} 


setApprove(id:number){
     this.api.setApprovedStatus(id).subscribe({
       next:res=> {
           
           console.log("status updated ",res.status);
            console.log("Approved Customers", res);  
              Swal.fire({
        title: 'Success!',
        text: `your form was approved!`,
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'swal2-top-left', // use our custom top-left class
        },
        showClass: {
          popup: 'swal2-show'
        },
        hideClass: {
          popup: 'swal2-hide'
        }
      });
            this.router.navigate(["/admin/customer-list"],{queryParams:{tabName:"approved"}})
       }
       ,
       error:error=> {
          //  alert("cusotmer did not approved");
           console.log("error while approving", error);
       }
     })
}

rejected(id:number){
      console.log("rejected id", id);
      this.api.rejectCustomer(id).subscribe({
         next:next=> {
              
               console.log("customer rejected successfully");
               this.router.navigate(["/admin/customer-list"])
         },
         error:error=> {
              console.log("customer did not rejected ",error);
              alert("Customer didnot rejected")
         }
      })  
}

isReadOnly(): boolean {
  // return !(this.getCustomerById?.status === "A");
    return false;
}

// set approved 

editApprovedCustomer() {
  this.router.navigate(['/admin/create-customer/', this.getCustomerById.id]);
}

}



