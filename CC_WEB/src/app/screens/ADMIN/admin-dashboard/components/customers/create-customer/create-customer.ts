import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CustomerService } from '../../../../../../core/services/admin-service/customer-form-service/customer-service';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatInputModule, MatIconModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './create-customer.html',
  styleUrls: ['./create-customer.scss']
})
export class CreateCustomer implements OnInit {
  customerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      Name: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Contact: ['', Validators.required],
      Status: ['Active', Validators.required],
      LegalID: [''],
      Branch_Code: [''],
      Ctry_City: [''],
      Customer_Type: ['Regular', Validators.required],
      Address1: [''],
      Address2: [''],
      Address3: [''],
      createdOn: [''],
      createdBy: [''],
      updatedOn: [''],
      putOn: [''],
      putById: ['']
    });
  }

  onCancel() {
    this.customerForm.reset();
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
editApprovedCustomer(id: number) {
  this.api.editApprovedCustomer(id).subscribe({
    next: res => {
      Swal.fire({
        title: 'Success!',
        text: 'Approved customer moved to Draft',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
  this.router.navigateByUrl('/dummy', { skipLocationChange: true }).then(() => {
    this.router.navigate(['/admin/customer-list']);
  });
});

    },
    error: () => {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to move Approved to Draft',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  });
}

}