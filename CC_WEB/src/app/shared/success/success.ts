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

  tnxId = '';
  reference = '';

  pageName1 = 'Go to Listing';
  pageName2 = 'Create New';

  listingRoute = '';
  createRoute = '';

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as any;

    if (!state) {
      console.warn('No navigation state found on Success page');
      return;
    }

    this.tnxId = state.tnxId || state.transaction?.tnxId || '';
    this.reference =
      state.channelReference || state.transaction?.channelReference || '';

    switch (state.source) {
      case 'IMPORT_LC':
        this.listingRoute = 'import-screen/inquiries';
        this.createRoute = 'import-screen';
        break;

      case 'UNDERTAKING_ISSUANCE':
        this.listingRoute = 'undertaking-issuance/inquiries-records';
        this.createRoute =
          'undertaking-issuance/request-undertaking/general-details';
        break;
    }

    // Explicit overrides (still supported)
    if (state.routes) {
      this.listingRoute = state.routes.listingRoute || this.listingRoute;
      this.createRoute = state.routes.createRoute || this.createRoute;
    }

    if (state.labels) {
      this.pageName1 = state.labels.listingLabel || this.pageName1;
      this.pageName2 = state.labels.createLabel || this.pageName2;
    }
  }

  ngOnInit(): void {
    if (!this.tnxId && !this.reference) {
      console.warn('Success page accessed without transaction context');
    }
  }

  goToListing(): void {
    this.router.navigate([this.listingRoute]);
  }

  createNew(): void {
    this.router.navigate([this.createRoute]);
  }
}
