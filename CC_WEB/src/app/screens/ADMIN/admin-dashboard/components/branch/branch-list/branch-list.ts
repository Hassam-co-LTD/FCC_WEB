import { Component, NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../../../../../core/services/api.service';
import { OnInit } from '@angular/core';
import { NgModelGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-branch-list',
  imports: [MatTabsModule,CommonModule],
  templateUrl: './branch-list.html',
  styleUrl: './branch-list.scss'
})
export class BranchList  {
  constructor(private api:ApiService){}
getDraftList: any[] = [];

ngOnInit(): void {
   this.getAllDraft();
}

getAllDraft(){
     this.api.getDraftList().subscribe({
       next:res=> {
           this.getDraftList = res;
           console.log("draft list",this.getDraftList);
       },
       error:err=> {
           console.log("error while fetching draft list", err);
       }
     })
  } 
}
