import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-success',
  templateUrl: './success.html',
  styleUrls: ['./success.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule],
})
export class Success implements OnInit {

  tnxId: string = '';
  reference: string = '';
  
  // Default Labels (can be overwritten by state)
  pageName1 = 'Go to Listing'; 
  pageName2 = 'Create New';
  
  // Routes to navigate to
  listingRoute = 'undertaking-issuance/inquiries-records';
  createRoute = '/request-undertaking/general-details';

  constructor(private router: Router) { 
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as any;

    if (state) {
      // 1. Capture Transaction Data
      this.tnxId = state.tnxId || state.transaction?.tnxId;
      this.reference = state.channelReference || state.transaction?.channelReference;

      // 2. Capture Dynamic Config (Labels & Routes)
      if (state.labels) {
        this.pageName1 = state.labels.listingLabel || this.pageName1;
        this.pageName2 = state.labels.createLabel || this.pageName2;
      }
      
      if (state.routes) {
        this.listingRoute = state.routes.listingRoute || this.listingRoute;
        this.createRoute = state.routes.createRoute || this.createRoute;
      }
    }
  }

  ngOnInit(): void {
    // Fallback if accessed directly without state
    if (!this.tnxId && !this.reference) {
      // Optionally redirect back or show empty state
      console.warn('No transaction state found on Success page');
    }
  }

  goToListing(): void {
    this.router.navigate([this.listingRoute]);
  }

  createNew(): void {
    this.router.navigate([this.createRoute]);
  }
}