import { CommonModule, NgClass } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../../../../core/services/api.service';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { error } from 'console';
@Component({
  selector: 'app-city-master',
  templateUrl: './city.html',
  styleUrls: ['./city.scss'],
 imports: [ReactiveFormsModule, MatButtonModule, MatInputModule, MatIconModule, MatFormFieldModule, MatSelectModule,CommonModule],
})
export class City implements OnInit {

  cityForm!: FormGroup;
  isOpen = true;
  storeCity: any;
  constructor(private fb: FormBuilder,private api:ApiService,private location:Location,private activateRouter:ActivatedRoute) {}
   
  
  ngOnInit(): void {
    
    this.cityForm = this.fb.group({
      id: [null, Validators.required],          // manual ID
      cityName: ['', Validators.required],
      state: [''],
      country: ['']
    });
    this.getCityById();
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }
  isReadOnly(): boolean {
  return (this.storeCity?.cityStaus === "A");
}

  save() {
    this.api.setCity(this.cityForm.value).subscribe({
      next:res=> {
         this.storeCity  = res;
         console.log("got city", res);
          Swal.fire({
                   title: 'Success!',
                   text: 'Your form was approved!',
                   icon: 'success',
                   confirmButtonText: 'OK',
                   customClass: { popup: 'swal2-top-left' },
                 });
      }
      ,
      error:err=> {
          console.log("getting error ",err)
      }
    })
  }

  back(): void {
    this.location.back();
  }

  cancel(){
   this.cityForm.reset();
  }
 
  // get CityBy Id

  getCityById(){
    const id = Number(this.activateRouter.snapshot.paramMap.get("id"));
    console.log("got id",id ,"the type of the id is ", typeof(id))
    // console.log(typeof (id), "this is the id",id )
    if (!id) return;

    this.api.getCityById(id).subscribe({
      next: (res: any) => {
          this.storeCity = res;
        console.log("get City By id", res);
        if (res) this.cityForm.patchValue(res);
      },
      error: (err) => console.log("Error fetching draft:", err)
    });
  }

   update(){
     this.api.updateCity(this.cityForm.value).subscribe({
      next:res=> {
        console.log("city updated",res)
      }
      ,
      error:err=> {
        console.log(err)
      }
     })
  }

  submit(){
     this.api.setCityByStatus("S",this.storeCity.id).subscribe({
      next:res=> {
        console.log("set City Status",res);
      },
      error:err=>{
        console.log("error while submitting value ",err)
      }
     })   
  }

  approve(id:number){
     this.api.setCityByStatus("A",this.storeCity.id).subscribe({
      next:res=>{
        console.log("Approved", res)
        this.storeCity = res;
        
      },
      error:err=> {
         console.log("error while approving", err)
      }
     })
  }
  reject(id:number){

  }
  editApprovedCity(id:number){

  }
}
