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
  templateUrl: './account-types-inquiry.html', 
  styleUrls: ['./account-types-inquiry.scss']
})
export class AccountTypesInquiry implements OnInit {

  selectedTabIndex = 0;

  draftAccountTypes: any[] = [];
  approvedAccountTypes: any[] = [];
  submittedAccountTypes: any[] = [];

  storeFilteredDraftAccountTypes: any[] = [];
  storeFilteredApprovedAccountTypes: any[] = [];
  storeFilteredSubmittedAccountTypes: any[] = [];

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
    if (index === 0) this.loadDraftAccountTypes();
    else if (index === 1) this.loadApprovedAccountTypes();
    else if (index === 2) this.loadSubmittedAccountTypes();

    this.searchText = '';
  }

  // ================== Load AccountTypes ==================
  loadDraftAccountTypes() {
    this.api.getTnxByStatus('I','customer').subscribe({
      next: res => {
        console.log('Draft AccountTypes response:', res);
        this.draftAccountTypes = res;
        this.storeFilteredDraftAccountTypes = [...res];  
      },
      error: err => console.error('Error fetching draft AccountTypes', err)
    });
  }

  loadApprovedAccountTypes() {
    this.api.getTnxByStatus('A','customer').subscribe({
      next: res => {
        this.approvedAccountTypes = res;
        this.storeFilteredApprovedAccountTypes = [...res];
      },
      error: err => console.error('Error fetching approved AccountTypes', err)
    });
  }

  loadSubmittedAccountTypes() {
    this.api.getTnxByStatus('S','customer').subscribe({
      next: res => {
        this.submittedAccountTypes = res;
        this.storeFilteredSubmittedAccountTypes = [...res];
      },
      error: err => console.error('Error fetching submitted AccountTypes', err)
    });
  }

  // ================== Filter AccountTypes ==================
  filterDraftAccountTypes(search: string) {
    if (!search) { this.storeFilteredDraftAccountTypes = [...this.draftAccountTypes]; return; }
    const value = search.toLowerCase();
    this.storeFilteredDraftAccountTypes = this.draftAccountTypes.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  filterApprovedAccountTypes(search: string) {
    if (!search) { this.storeFilteredApprovedAccountTypes = [...this.approvedAccountTypes]; return; }
    const value = search.toLowerCase();
    this.storeFilteredApprovedAccountTypes = this.approvedAccountTypes.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  filterSubmittedAccountTypes(search: string) {
    if (!search) { this.storeFilteredSubmittedAccountTypes = [...this.submittedAccountTypes]; return; }
    const value = search.toLowerCase();
    this.storeFilteredSubmittedAccountTypes = this.submittedAccountTypes.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  // ================== Actions ==================
  updateRouter(customer: any) {
    this.router.navigate(['/admin/create-customer/' + customer.id]);
  }

  submitStatus(id: number) {
    this.api.setTnxByStatus('S', id, 'customer').subscribe({
      next: () => {
        Swal.fire('Success', 'Customer submitted successfully', 'success');
        this.loadDraftAccountTypes();
        this.loadSubmittedAccountTypes();
      },
      error: err => Swal.fire('Error', 'Failed to submit customer', 'error')
    });
  }

  setApprove(id: number) {
    this.api.setTnxByStatus('A', id, 'customer').subscribe({
      next: () => {
        Swal.fire('Success', 'Customer approved successfully', 'success');
        this.loadSubmittedAccountTypes();
        this.loadApprovedAccountTypes();
      },
      error: err => Swal.fire('Error', 'Failed to approve customer', 'error')
    });
  }

  Reject(id: number) {
    this.api.setTnxByStatus('R', id, 'customer').subscribe({
      next: () => {
        Swal.fire('Success', 'Customer rejected successfully', 'success');
        this.loadSubmittedAccountTypes();
      },
      error: err => Swal.fire('Error', 'Failed to reject customer', 'error')
    });
  }

  /** ================== Edit Approved Customer ================== */
  editApprovedCustomer(id: number) {
    // Move approved customer back to Draft for editing
    this.api.setTnxByStatus('D', id, 'customer').subscribe({
      next: () => {
        Swal.fire('Success', 'Approved customer moved to Draft for editing', 'success');
        // Reload all tabs
        this.loadDraftAccountTypes();
        this.loadApprovedAccountTypes();
      },
      error: err => Swal.fire('Error', 'Failed to move approved customer to draft', 'error')
    });
  }

  // ================== Track By ==================
  trackById(index: number, item: any) {
    return item.id;
  }

  // ================== Counts ==================
  get draftCount(): number { return this.draftAccountTypes.length; }
  get approvedCount(): number { return this.approvedAccountTypes.length; }
  get submittedCount(): number { return this.submittedAccountTypes.length; }

  get filteredDraftCount(): number { return this.storeFilteredDraftAccountTypes.length; }
  get filteredApprovedCount(): number { return this.storeFilteredApprovedAccountTypes.length; }
  get filteredSubmittedCount(): number { return this.storeFilteredSubmittedAccountTypes.length; }
}
