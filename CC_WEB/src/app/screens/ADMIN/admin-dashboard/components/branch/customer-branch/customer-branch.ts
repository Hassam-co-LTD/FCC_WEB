import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../../../../core/services/api.service';
import Swal from 'sweetalert2';
import { error } from 'console';

@Component({
  selector: 'app-branch',
  templateUrl: './customer-branch.html',
  styleUrls: ['./customer-branch.scss'],standalone: true,
  imports: [
    ReactiveFormsModule,

    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    CommonModule
  ],
})
export class CustomerBranch implements OnInit {
  branchForm!: FormGroup;

  // Inject FormBuilder via constructor
  constructor(private fb: FormBuilder,private api:ApiService) {}
  storeBranchData:any[] = [];
  getAllCities: any[] = [];
  
  ngOnInit() {
    // Initialize the form
    this.branchForm = this.fb.group({
       branchId: ['', Validators.required], 
      branchName: ['', Validators.required],
      branchAddress: ['', Validators.required],
      cityId: ['', Validators.required],
      contactPerson: ['', Validators.required],
      contactNo: ['', Validators.required],
      recordStatus: ['A', Validators.required]
    });
    this.getAllcities();
   
  }



  cancel(){
    return  this.branchForm.reset();
  }

   getAllcities(){
     this.api.getAllCities().subscribe({
      next:res=> {
          this.getAllCities  = res;
      }
      ,
      error:err=> {
        console.log(err);
      }
     })
   }


 
   
  save(){
   const  payload = {
  branchid: this.branchForm.value.branchId,       // String ID
  branchname: this.branchForm.value.branchName,
  branchaddress: this.branchForm.value.branchAddress,
  contactperson: this.branchForm.value.contactPerson,
  contactno: this.branchForm.value.contactNo,
  citymaster: { id: this.branchForm.value.cityId },  // ✅ must be an object
  recordstatus: this.branchForm.value.recordStatus
};
    console.log("form data to send",payload)
       this.api.saveBranch(payload).subscribe({
        next:res=> {
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
                   
                  this.storeBranchData = [res]
                  console.log("backend respond", this.storeBranchData);
        },
        error:err=> {
            console.log("error while saving data",err);
              Swal.fire({
                     title: 'Erorr',
                     text: `got errror ${err}`,
                     icon: 'error',
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
        }
        
       })
      }


  // getDraftList
  
      }    
