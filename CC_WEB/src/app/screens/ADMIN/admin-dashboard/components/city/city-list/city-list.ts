import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
// import { FormsModule } from '@angular/forms';
import { NgModel } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../../../../core/services/api.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-city-records',
  templateUrl: './city-list.html',
  styleUrls: ['./city-list.scss'],
  imports:[MatTabsModule,CommonModule,MatIconModule,FormsModule,           // <-- Add this
    ReactiveFormsModule,  ]
})
export class CityList implements OnInit {

  // ================== Form ==================
  cityForm: FormGroup;

  // ================== Tabs ==================
  selectedTabIndex: number = 0;

  // ================== Search ==================
  searchText: string = '';

  // ================== Records ==================
  draftCount: number = 0;
  approvedCount: number = 0;
  submittedCount: number = 0;

  filteredDraftCount:number=0;
  filteredApprovedCount:number=0;
  filteredSubmittedCount:number=0;

  storeFilteredDraftCities: any[] = [];
  storeFilteredApprovedCities: any[] = [];
  storeFilteredSubmittedCities: any[] = [];

  constructor(private fb: FormBuilder,private api:ApiService,private route:Router) {
    this.cityForm = this.fb.group({
      id: [null, Validators.required],        // Manual ID
      cityName: ['', Validators.required],
      state: [''],
      country: ['']
    });
  }

  ngOnInit(){
    // Initialize counts and load data
    this.api.getCityByStatus("D").subscribe({
       next:res=> {
         this.storeFilteredDraftCities = res;
         console.log(this.storeFilteredDraftCities)
       },
       error:err=> {
          console.log("not status found");
       }
    })

     this.api.getCityByStatus("S").subscribe({
       next:res=> {
         this.storeFilteredSubmittedCities = res;
         console.log(this.storeFilteredSubmittedCities)
       },
       error:err=> {
          console.log("not status found");
       }
    })


     this.api.getCityByStatus("D").subscribe({
       next:res=> {
         this.storeFilteredApprovedCities = res;
         console.log(this.storeFilteredApprovedCities)
       },
       error:err=> {
          console.log("not status found");
       }
    })
  }

  // ================== Router ==================
  updateRouter(city: any): void {
      this.route.navigate(["/admin/city",city])
  }

  // ================== Tab Change ==================
  onTabChange(index: number): void {
    // Handle tab change
  }

  // ================== Filters ==================
  filterDraftCities(searchText:any) {  
     this.api.getAllCities().subscribe({
       next:res=> {
            
           this.storeFilteredDraftCities = [...res];
           console.log(this.storeFilteredApprovedCities);    
       }
     })
    
  }

  filterApprovedCities(searchText: string): void {
    // Filter approved cities based on searchText
  }

  filterSubmittedCities(searchText: string): void {
    // Filter submitted cities based on searchText
  }

  // ================== Track By ==================
  trackById(index: number, item: any): any {
    return item.id;
  }

}
