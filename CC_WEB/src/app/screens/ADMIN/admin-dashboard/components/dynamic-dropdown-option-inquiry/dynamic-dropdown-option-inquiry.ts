import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../../core/services/api.service';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTabsModule, MatIconModule, RouterLink],
  templateUrl: './dynamic-dropdown-option-inquiry.html',
  styleUrls: ['./dynamic-dropdown-option-inquiry.scss']
})
export class DynamicDropdownOptionInquiry implements OnInit {

  selectedTabIndex = 0;

  draftCity: any[] = [];
  approvedCity: any[] = [];
  submittedCity: any[] = [];

  storeFilteredDraftDropDown : any[] = [];
  storeFilteredApprovedDropDown: any[] = [];
  storeFilteredSubmittedDropDown: any[] = [];

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
    this.api.getTnxByStatus('I','dynamic-dropdown').subscribe({
      next: res => {
        console.log('Draft customers response:', res);
        this.draftCity = res;
        this.storeFilteredDraftDropDown = [...res];  
      },
      error: err => console.error('Error fetching draft customers', err)
    });
  }

  loadApprovedCity() {
    this.api.getTnxByStatus('A','dynamic-dropdown').subscribe({
      next: res =>   {
        this.approvedCity = res;
        this.storeFilteredApprovedDropDown = [...res];
      },
      error: err => console.error('Error fetching approved customers', err)
    });
  }

  loadSubmittedCity() {
    this.api.getTnxByStatus('S','dynamic-dropdown').subscribe({
      next: res => {
        this.submittedCity = res;
        this.storeFilteredSubmittedDropDown = [...res];
      },
      error: err => console.error('Error fetching submitted customers', err)
    });
  }

  // ================== Filter Customers ==================
  filterDraftDropDown(search: string) {
    if (!search) { this.storeFilteredDraftDropDown = [...this.draftCity]; return; }
    const value = search.toLowerCase();
    this.storeFilteredDraftDropDown = this.draftCity.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  filterApprovedDropDown(search: string) {
    if (!search) { this.storeFilteredApprovedDropDown = [...this.approvedCity]; return; }
    const value = search.toLowerCase();
    this.storeFilteredApprovedDropDown = this.approvedCity.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  filterSubmittedDropDown(search: string) {
    if (!search) { this.storeFilteredSubmittedDropDown = [...this.submittedCity]; return; }
    const value = search.toLowerCase();
    this.storeFilteredSubmittedDropDown = this.submittedCity.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  // ================== Actions ==================
  
  submitStatus(id: number) {
    this.api.setTnxByStatus('S', id, 'dynamic-dropdown').subscribe({
      next: () => {
        Swal.fire('Success', 'Dropdown option submitted successfully', 'success');
        this.loadDraftCity();
        this.loadSubmittedCity();
      },
      error: err => Swal.fire('Error', 'Failed to submit dropdown option', 'error')
    });
  }

  setApprove(id: number) {
    this.api.setTnxByStatus('A', id, 'dynamic-dropdown').subscribe({
      next: () => {
        Swal.fire('Success', 'Dropdown option approved successfully', 'success');
        this.loadSubmittedCity();
        this.loadApprovedCity();
      },
      error: err => Swal.fire('Error', 'Failed to approve dropdown option', 'error')
    });
  }

  Reject(id: number) {
    this.api.setTnxByStatus('R', id, 'dynamic-dropdown').subscribe({
      next: () => {
        Swal.fire('Success', 'Dropdown option rejected successfully', 'success');
        this.loadSubmittedCity();
      },
      error: err => Swal.fire('Error', 'Failed to reject dropdown option', 'error')
    });
  }

  /** ================== Edit Approved Customer ================== */
  editApprovedCity(id: number) {
    // Move approved customer back to Draft for editing
    this.api.setTnxByStatus('I', id, 'dynamic-dropdown').subscribe({
      next: () => {
        Swal.fire('Success', 'Approved dropdown option moved to Draft for editing', 'success');
        // Reload all tabs
        this.loadDraftCity();
        this.loadApprovedCity();
      },
      error: err => Swal.fire('Error', 'Failed to move approved dropdown option to draft', 'error')
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

  get filteredDraftCount(): number { return this.storeFilteredDraftDropDown.length; }
  get filteredApprovedCount(): number { return this.storeFilteredApprovedDropDown.length; }
  get filteredSubmittedCount(): number { return this.storeFilteredSubmittedDropDown.length; }
}
