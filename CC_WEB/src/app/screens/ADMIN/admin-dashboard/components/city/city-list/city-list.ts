import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../../../core/services/api.service';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTabsModule, MatIconModule, RouterLink],
  templateUrl: './city-list.html',
  styleUrls: ['./city-list.scss']
})
export class CityList implements OnInit {

  selectedTabIndex = 0;

  draftCity: any[] = [];
  approvedCity: any[] = [];
  submittedCity: any[] = [];

  storeFilteredDraftCity : any[] = [];
  storeFilteredApprovedCity: any[] = [];
  storeFilteredSubmittedCity: any[] = [];

  searchText: string = '';

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tab = params['tabName'];
      if (tab === 'submitted') this.onTabChange(2);
      else if (tab === 'approved') this.onTabChange(1);
      else this.onTabChange(0);
    });
  }

  // ================== Tab Change ==================
  onTabChange(index: number) {
    this.selectedTabIndex = index;
    if (index === 0) this.loadDraftCity();
    else if (index === 1) this.loadApprovedCity();
    else if (index === 2) this.loadSubmittedCity();

    this.searchText = '';
  }

  // ================== Load Customers ==================
  loadDraftCity() {
    this.api.getTnxByStatus('I','city').subscribe({
      next: res => {
        console.log('Draft customers response:', res);
        this.draftCity = res;
        this.storeFilteredDraftCity = [...res];  
      },
      error: err => console.error('Error fetching draft customers', err)
    });
  }

  loadApprovedCity() {
    this.api.getTnxByStatus('A','city').subscribe({
      next: res =>   {
        this.approvedCity = res;
        this.storeFilteredApprovedCity = [...res];
      },
      error: err => console.error('Error fetching approved customers', err)
    });
  }

  loadSubmittedCity() {
    this.api.getTnxByStatus('S','city').subscribe({
      next: res => {
        this.submittedCity = res;
        this.storeFilteredSubmittedCity = [...res];
      },
      error: err => console.error('Error fetching submitted customers', err)
    });
  }

  // ================== Filter Customers ==================
  filterDraftCity(search: string) {
    if (!search) { this.storeFilteredDraftCity = [...this.draftCity]; return; }
    const value = search.toLowerCase();
    this.storeFilteredDraftCity = this.draftCity.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  filterApprovedCity(search: string) {
    if (!search) { this.storeFilteredApprovedCity = [...this.approvedCity]; return; }
    const value = search.toLowerCase();
    this.storeFilteredApprovedCity = this.approvedCity.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  filterSubmittedCity(search: string) {
    if (!search) { this.storeFilteredSubmittedCity = [...this.submittedCity]; return; }
    const value = search.toLowerCase();
    this.storeFilteredSubmittedCity = this.submittedCity.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  // ================== Actions ==================
  
  submitStatus(id: number) {
    this.api.setTnxByStatus('S', id, 'city').subscribe({
      next: () => {
        Swal.fire('Success', 'City submitted successfully', 'success');
        this.loadDraftCity();
        this.loadSubmittedCity();
      },
      error: err => Swal.fire('Error', 'Failed to submit city', 'error')
    });
  }

  setApprove(id: number) {
    this.api.setTnxByStatus('A', id, 'city').subscribe({
      next: () => {
        Swal.fire('Success', 'City approved successfully', 'success');
        this.loadSubmittedCity();
        this.loadApprovedCity();
      },
      error: err => Swal.fire('Error', 'Failed to approve city', 'error')
    });
  }

  Reject(id: number) {
    this.api.setTnxByStatus('R', id, 'city').subscribe({
      next: () => {
        Swal.fire('Success', 'City rejected successfully', 'success');
        this.loadSubmittedCity();
      },
      error: err => Swal.fire('Error', 'Failed to reject city', 'error')
    });
  }

  /** ================== Edit Approved Customer ================== */
  editApprovedCity(id: number) {
    // Move approved customer back to Draft for editing
    this.api.setTnxByStatus('I', id, 'city').subscribe({
      next: () => {
        Swal.fire('Success', 'Approved city moved to Draft for editing', 'success');
        // Reload all tabs
        this.loadDraftCity();
        this.loadApprovedCity();
      },
      error: err => Swal.fire('Error', 'Failed to move approved city to draft', 'error')
    });
  }

  // ================== Track By ==================
  trackById(index: number, item: any) {
    return item.id;
  }

  // ================== Counts ==================
  get draftCount(): number { return this.draftCity.length; }
  get approvedCount(): number { return this.approvedCity.length; }
  get submittedCount(): number { return this.submittedCity.length; }

  get filteredDraftCount(): number { return this.storeFilteredDraftCity.length; }
  get filteredApprovedCount(): number { return this.storeFilteredApprovedCity.length; }
  get filteredSubmittedCount(): number { return this.storeFilteredSubmittedCity.length; }
}
