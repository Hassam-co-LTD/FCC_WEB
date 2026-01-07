import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../../../../core/services/api.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-city-master',
  templateUrl: './city.html',
  styleUrls: ['./city.scss'],
  imports:[MatFormFieldModule,
MatInputModule,
MatSelectModule,
ReactiveFormsModule,
MatIconModule
]
})
export class City implements OnInit {

  cityForm!: FormGroup;
  isOpen = true;
  storeCity: any[] = []
  constructor(private fb: FormBuilder,private api:ApiService) {}
   
  ngOnInit(): void {
    this.cityForm = this.fb.group({
      id: [null, Validators.required],          // manual ID
      cityName: ['', Validators.required],
      state: [''],
      country: ['']
    });
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
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

  reset(): void {
    this.cityForm.reset();
  }
}
